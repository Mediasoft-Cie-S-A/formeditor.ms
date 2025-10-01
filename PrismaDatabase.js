const { PrismaClient } = require('@prisma/client');
const { parse: json2csv } = require('json2csv');

const PROVIDER_CONFIG = {
  mysql: { quoteStart: '`', quoteEnd: '`', supportsLimit: true, defaultSchema: null },
  mariadb: { quoteStart: '`', quoteEnd: '`', supportsLimit: true, defaultSchema: null },
  postgresql: { quoteStart: '"', quoteEnd: '"', supportsLimit: true, defaultSchema: 'public' },
  cockroachdb: { quoteStart: '"', quoteEnd: '"', supportsLimit: true, defaultSchema: 'public' },
  sqlite: { quoteStart: '"', quoteEnd: '"', supportsLimit: true, defaultSchema: null },
  sqlserver: { quoteStart: '[', quoteEnd: ']', supportsLimit: false, defaultSchema: 'dbo' },
  mongodb: { quoteStart: '"', quoteEnd: '"', supportsLimit: false, defaultSchema: null },
};

function escapeIdentifierPart(part, close) {
  if (close === '"') {
    return part.replace(/"/g, '""');
  }
  if (close === '`') {
    return part.replace(/`/g, '``');
  }
  if (close === ']') {
    return part.replace(/]/g, ']]');
  }
  return part;
}

function isSafeIdentifier(part) {
  return /^[A-Za-z0-9_$]+$/.test(part);
}

class PrismaDatabase {
  constructor(connectionConfig = {}, globalConfig = {}) {
    this.connectionString = connectionConfig.ConnectionString || connectionConfig.connectionString || connectionConfig.url;
    if (!this.connectionString) {
      throw new Error('PrismaDatabase requires a valid connection string.');
    }

    this.provider = (connectionConfig.provider || globalConfig.provider || this.detectProviderFromUrl(this.connectionString) || 'mysql').toLowerCase();
    this.config = PROVIDER_CONFIG[this.provider] ? { ...PROVIDER_CONFIG[this.provider] } : { ...PROVIDER_CONFIG.mysql };

    this.rowIdColumn = connectionConfig.rowId || globalConfig.rowId || 'rowid';
    this.schema = connectionConfig.schema ||
      (globalConfig.defaultSchema && (globalConfig.defaultSchema[this.provider] || globalConfig.defaultSchema.default)) ||
      this.config.defaultSchema;

    const prismaOptions = {};
    const mergedLog = connectionConfig.log || globalConfig.log;
    if (Array.isArray(mergedLog) && mergedLog.length > 0) {
      prismaOptions.log = mergedLog;
    }

    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: this.connectionString,
        },
      },
      ...prismaOptions,
    });
  }

  detectProviderFromUrl(url) {
    try {
      const parsed = new URL(url);
      const protocol = parsed.protocol.replace(':', '').toLowerCase();
      switch (protocol) {
        case 'postgres':
        case 'postgresql':
          return 'postgresql';
        case 'mysql':
          return 'mysql';
        case 'mariadb':
          return 'mariadb';
        case 'cockroachdb':
          return 'cockroachdb';
        case 'sqlite':
          return 'sqlite';
        case 'sqlserver':
        case 'mssql':
          return 'sqlserver';
        case 'mongodb':
        case 'mongodb+srv':
          return 'mongodb';
        default:
          return protocol;
      }
    } catch (error) {
      console.warn('Unable to detect Prisma provider from URL, defaulting to mysql. Error:', error.message);
      return 'mysql';
    }
  }

  splitIdentifier(identifier) {
    return identifier.split('.').map(part => part.trim()).filter(Boolean);
  }

  quoteIdentifier(identifier) {
    const parts = this.splitIdentifier(identifier);
    if (parts.length === 0) {
      throw new Error('Invalid identifier');
    }
    const { quoteStart, quoteEnd } = this.config;
    return parts
      .map(part => {
        if (!isSafeIdentifier(part)) {
          throw new Error(`Invalid identifier part: ${part}`);
        }
        return `${quoteStart}${escapeIdentifierPart(part, quoteEnd)}${quoteEnd}`;
      })
      .join('.');
  }

  fieldList(fields = []) {
    if (!fields || fields.length === 0) {
      return '*';
    }
    return fields
      .map(field => {
        if (!field) {
          return null;
        }
        const lowered = field.toLowerCase();
        if (lowered === 'rowid') {
          return this.quoteIdentifier(this.rowIdColumn);
        }
        return this.quoteIdentifier(field);
      })
      .filter(Boolean)
      .join(', ');
  }

  orderByClause(orderBy = []) {
    if (!Array.isArray(orderBy) || orderBy.length === 0) {
      return '';
    }
    const parts = orderBy
      .map(o => {
        if (!o || !o.fieldName) {
          return null;
        }
        const direction = o.order && o.order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        return `${this.quoteIdentifier(o.fieldName)} ${direction}`;
      })
      .filter(Boolean);
    return parts.length ? ` ORDER BY ${parts.join(', ')}` : '';
  }

  whereFromJson(json) {
    if (!json || !Array.isArray(json.filters) || json.filters.length === 0) {
      return { where: '', params: [] };
    }
    const params = [];
    const conditions = json.filters
      .map(filter => {
        if (!filter || !filter.field) {
          return null;
        }
        const column = this.quoteIdentifier(filter.field);
        if (Array.isArray(filter.values) && filter.values.length > 0) {
          const placeholders = filter.values.map(() => '?').join(', ');
          params.push(...filter.values);
          return `${column} IN (${placeholders})`;
        }
        if (filter.value !== undefined && filter.operator) {
          params.push(filter.value);
          return `${column} ${filter.operator} ?`;
        }
        return null;
      })
      .filter(Boolean);

    if (conditions.length === 0) {
      return { where: '', params: [] };
    }

    return { where: ` WHERE ${conditions.join(' AND ')}`, params };
  }

  getRowIdIdentifier() {
    return this.quoteIdentifier(this.rowIdColumn);
  }

  async query(sql, params = []) {
    if (this.provider === 'mongodb') {
      throw new Error('Raw SQL queries are not supported for MongoDB through Prisma.');
    }
    return this.prisma.$queryRawUnsafe(sql, ...params);
  }

  async exec(sql, params = []) {
    if (this.provider === 'mongodb') {
      throw new Error('Raw SQL commands are not supported for MongoDB through Prisma.');
    }
    const result = await this.prisma.$executeRawUnsafe(sql, ...params);
    if (typeof result === 'number') {
      return { affectedRows: result };
    }
    return result;
  }

  async queryData(queryString, params = []) {
    return this.query(queryString, params);
  }

  async updateData(updateQuery, params = []) {
    return this.exec(updateQuery, params);
  }

  async getTablesList() {
    switch (this.provider) {
      case 'mysql':
      case 'mariadb':
        return this.prisma.$queryRawUnsafe(`
          SELECT TABLE_NAME AS NAME, TABLE_NAME AS LABEL
          FROM INFORMATION_SCHEMA.TABLES
          WHERE TABLE_SCHEMA = DATABASE()
          ORDER BY TABLE_NAME
        `);
      case 'postgresql':
      case 'cockroachdb': {
        if (this.schema) {
          return this.prisma.$queryRawUnsafe(`
            SELECT table_name AS "NAME", table_name AS "LABEL"
            FROM information_schema.tables
            WHERE table_schema = ?
              AND table_type = 'BASE TABLE'
            ORDER BY table_name
          `, this.schema);
        }
        return this.prisma.$queryRawUnsafe(`
          SELECT table_name AS "NAME", table_name AS "LABEL"
          FROM information_schema.tables
          WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
            AND table_type = 'BASE TABLE'
          ORDER BY table_name
        `);
      }
      case 'sqlite':
        return this.prisma.$queryRawUnsafe(`
          SELECT name AS NAME, name AS LABEL
          FROM sqlite_master
          WHERE type = 'table'
            AND name NOT LIKE 'sqlite_%'
          ORDER BY name
        `);
      case 'sqlserver':
        return this.prisma.$queryRawUnsafe(`
          SELECT TABLE_NAME AS NAME, TABLE_NAME AS LABEL
          FROM INFORMATION_SCHEMA.TABLES
          WHERE TABLE_TYPE = 'BASE TABLE'
            AND TABLE_SCHEMA = ?
          ORDER BY TABLE_NAME
        `, this.schema || 'dbo');
      case 'mongodb': {
        const result = await this.prisma.$runCommandRaw({ listCollections: 1 });
        const collections = result?.cursor?.firstBatch || [];
        return collections.map(col => ({
          NAME: col.name,
          LABEL: col.name,
        }));
      }
      default:
        throw new Error(`Unsupported Prisma provider: ${this.provider}`);
    }
  }

  async getTableFields(tableName) {
    switch (this.provider) {
      case 'mysql':
      case 'mariadb':
        return this.prisma.$queryRawUnsafe(`
          SELECT COLUMN_NAME AS NAME,
                 DATA_TYPE   AS TYPE,
                 COLUMN_COMMENT AS LABEL,
                 CASE WHEN IS_NULLABLE = 'NO' THEN 1 ELSE 0 END AS MANDATORY,
                 COLUMN_TYPE  AS \`FORMAT\`,
                 NUMERIC_SCALE AS \`DECIMAL\`,
                 CHARACTER_MAXIMUM_LENGTH AS \`WIDTH\`,
                 COLUMN_DEFAULT AS \`DEFAULT\`
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
          ORDER BY ORDINAL_POSITION
        `, tableName);
      case 'postgresql':
      case 'cockroachdb': {
        const params = [tableName];
        let schemaCondition = 'table_schema NOT IN (\'pg_catalog\', \'information_schema\')';
        if (this.schema) {
          schemaCondition = 'table_schema = ?';
          params.push(this.schema);
        }
        return this.prisma.$queryRawUnsafe(`
          SELECT column_name AS "NAME",
                 data_type AS "TYPE",
                 column_name AS "LABEL",
                 CASE WHEN is_nullable = 'NO' THEN 1 ELSE 0 END AS "MANDATORY",
                 data_type AS "FORMAT",
                 numeric_scale AS "DECIMAL",
                 character_maximum_length AS "WIDTH",
                 column_default AS "DEFAULT"
          FROM information_schema.columns
          WHERE table_name = ?
            AND ${schemaCondition}
          ORDER BY ordinal_position
        `, ...params);
      }
      case 'sqlite': {
        const sanitized = this.quoteIdentifier(tableName);
        const rows = await this.prisma.$queryRawUnsafe(`PRAGMA table_info(${sanitized});`);
        return rows.map(row => ({
          NAME: row.name,
          TYPE: row.type,
          LABEL: row.name,
          MANDATORY: row.notnull,
          FORMAT: row.type,
          DECIMAL: null,
          WIDTH: row.type && row.type.includes('(')
            ? parseInt(row.type.substring(row.type.indexOf('(') + 1, row.type.indexOf(')')), 10)
            : null,
          DEFAULT: row.dflt_value,
        }));
      }
      case 'sqlserver':
        return this.prisma.$queryRawUnsafe(`
          SELECT COLUMN_NAME AS NAME,
                 DATA_TYPE AS TYPE,
                 COLUMN_NAME AS LABEL,
                 CASE WHEN IS_NULLABLE = 'NO' THEN 1 ELSE 0 END AS MANDATORY,
                 DATA_TYPE AS [FORMAT],
                 NUMERIC_SCALE AS [DECIMAL],
                 CHARACTER_MAXIMUM_LENGTH AS [WIDTH],
                 COLUMN_DEFAULT AS [DEFAULT]
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
          ORDER BY ORDINAL_POSITION
        `, this.schema || 'dbo', tableName);
      case 'mongodb': {
        const result = await this.prisma.$runCommandRaw({
          listCollections: 1,
          filter: { name: tableName },
        });
        const info = result?.cursor?.firstBatch?.[0];
        const fields = Object.entries(info?.options?.validator?.$jsonSchema?.properties || {}).map(([name, definition]) => ({
          NAME: name,
          TYPE: definition.bsonType || 'mixed',
          LABEL: definition.description || name,
          MANDATORY: Array.isArray(definition.required) ? (definition.required.includes(name) ? 1 : 0) : 0,
          FORMAT: definition.bsonType || 'mixed',
          DECIMAL: null,
          WIDTH: null,
          DEFAULT: null,
        }));
        return fields;
      }
      default:
        throw new Error(`Unsupported Prisma provider: ${this.provider}`);
    }
  }

  async getTableIndexes(tableName) {
    switch (this.provider) {
      case 'mysql':
      case 'mariadb':
        return this.prisma.$queryRawUnsafe(`
          SELECT INDEX_NAME AS NAME, NON_UNIQUE
          FROM INFORMATION_SCHEMA.STATISTICS
          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
          GROUP BY INDEX_NAME, NON_UNIQUE
          ORDER BY (INDEX_NAME = 'PRIMARY') DESC, INDEX_NAME
        `, tableName);
      case 'postgresql':
      case 'cockroachdb': {
        if (this.schema) {
          return this.prisma.$queryRawUnsafe(`
            SELECT indexname AS "NAME",
                   CASE WHEN indexdef ILIKE '% UNIQUE %' THEN 0 ELSE 1 END AS "NON_UNIQUE"
            FROM pg_indexes
            WHERE tablename = ?
              AND schemaname = ?
          `, tableName, this.schema);
        }
        return this.prisma.$queryRawUnsafe(`
          SELECT indexname AS "NAME",
                 CASE WHEN indexdef ILIKE '% UNIQUE %' THEN 0 ELSE 1 END AS "NON_UNIQUE"
          FROM pg_indexes
          WHERE tablename = ?
            AND schemaname NOT IN ('pg_catalog', 'information_schema')
        `, tableName);
      }
      case 'sqlite': {
        const sanitized = this.quoteIdentifier(tableName);
        const rows = await this.prisma.$queryRawUnsafe(`PRAGMA index_list(${sanitized});`);
        return rows.map(row => ({
          NAME: row.name,
          NON_UNIQUE: row.unique ? 0 : 1,
        }));
      }
      case 'sqlserver':
        return this.prisma.$queryRawUnsafe(`
          SELECT i.name AS NAME,
                 CASE WHEN i.is_unique = 1 THEN 0 ELSE 1 END AS NON_UNIQUE
          FROM sys.indexes i
          INNER JOIN sys.tables t ON i.object_id = t.object_id
          INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
          WHERE s.name = ?
            AND t.name = ?
            AND i.is_hypothetical = 0
            AND i.type_desc <> 'HEAP'
        `, this.schema || 'dbo', tableName);
      case 'mongodb':
        return [];
      default:
        throw new Error(`Unsupported Prisma provider: ${this.provider}`);
    }
  }

  async getFieldLabels(tableName, fields, rowID) {
    if (!fields || fields.length === 0) {
      return null;
    }
    const filteredFields = fields
      .filter(field => field.toLowerCase() !== 'rowid')
      .map(field => field);

    switch (this.provider) {
      case 'mysql':
      case 'mariadb':
        return this.prisma.$queryRawUnsafe(`
          SELECT COLUMN_NAME AS NAME, COLUMN_COMMENT AS LABEL
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = ?
            AND COLUMN_NAME IN (${filteredFields.map(() => '?').join(', ')})
        `, tableName, ...filteredFields);
      case 'postgresql':
      case 'cockroachdb': {
        const params = [tableName];
        let schemaCondition = 'table_schema NOT IN (\'pg_catalog\', \'information_schema\')';
        if (this.schema) {
          schemaCondition = 'table_schema = ?';
          params.push(this.schema);
        }
        return this.prisma.$queryRawUnsafe(`
          SELECT column_name AS "NAME", column_name AS "LABEL"
          FROM information_schema.columns
          WHERE table_name = ?
            AND ${schemaCondition}
            AND column_name IN (${filteredFields.map(() => '?').join(', ')})
        `, ...params, ...filteredFields);
      }
      case 'sqlite':
        return filteredFields.map(name => ({ NAME: name, LABEL: name }));
      case 'sqlserver':
        return this.prisma.$queryRawUnsafe(`
          SELECT COLUMN_NAME AS NAME, COLUMN_NAME AS LABEL
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
            AND COLUMN_NAME IN (${filteredFields.map(() => '?').join(', ')})
        `, this.schema || 'dbo', tableName, ...filteredFields);
      case 'mongodb':
        return filteredFields.map(name => ({ NAME: name, LABEL: name }));
      default:
        throw new Error(`Unsupported Prisma provider: ${this.provider}`);
    }
  }

  buildFilterCondition(filterString) {
    if (!filterString) {
      return '';
    }
    return ` WHERE ${filterString}`;
  }

  async queryDataWithPagination(tableName, page, pageSize, fields, filterJson, orderBy) {
    const tbl = this.quoteIdentifier(tableName);
    const cols = this.fieldList(fields);
    const offset = Math.max(0, (page - 1) * pageSize);
    let sql = `SELECT ${cols} FROM ${tbl}`;
    let params = [];
    if (filterJson && typeof filterJson === 'object') {
      const where = this.whereFromJson(filterJson);
      sql += where.where;
      params = where.params;
    }

    const orderClause = this.orderByClause(orderBy) || (this.provider === 'sqlserver' ? ` ORDER BY ${this.getRowIdIdentifier()}` : '');
    sql += orderClause;

    if (this.provider === 'sqlserver') {
      sql += ' OFFSET ? ROWS FETCH NEXT ? ROWS ONLY';
      params.push(offset, pageSize);
    } else {
      sql += ' LIMIT ? OFFSET ?';
      params.push(pageSize, offset);
    }

    return this.query(sql, params);
  }

  async selectDistinct(tableName, columnName, filter) {
    const tbl = this.quoteIdentifier(tableName);
    const column = Array.isArray(columnName)
      ? columnName.map(name => this.quoteIdentifier(name)).join(', ')
      : this.quoteIdentifier(columnName);
    let sql = `SELECT DISTINCT ${column} FROM ${tbl}`;
    if (filter && filter.length > 0) {
      sql += this.buildFilterCondition(filter);
    }
    if (this.provider !== 'sqlserver') {
      sql += ' ORDER BY ' + column;
      sql += ' LIMIT 10';
    } else {
      sql = `SELECT TOP 10 DISTINCT ${column} FROM ${tbl}` + (filter && filter.length > 0 ? this.buildFilterCondition(filter) : '') + ` ORDER BY ${column}`;
    }
    return this.query(sql);
  }

  async selectDistinctIdValue(tableName, columnId, columnName, filter) {
    const tbl = this.quoteIdentifier(tableName);
    const id = this.quoteIdentifier(columnId);
    const label = this.quoteIdentifier(columnName);
    let sql;
    if (this.provider === 'sqlserver') {
      sql = `SELECT TOP 10 DISTINCT ${id}, ${label} FROM ${tbl}`;
      if (filter && filter.length > 0) {
        sql += this.buildFilterCondition(filter);
      }
      sql += ` ORDER BY ${id}`;
    } else {
      sql = `SELECT DISTINCT ${id}, ${label} FROM ${tbl}`;
      if (filter && filter.length > 0) {
        sql += this.buildFilterCondition(filter);
      }
      sql += ` ORDER BY ${id} LIMIT 10`;
    }
    return this.query(sql);
  }

  async moveToFirst(tableName, fields, filter) {
    const tbl = this.quoteIdentifier(tableName);
    const cols = this.fieldList(fields);
    let sql;
    let params = [];
    if (this.provider === 'sqlserver') {
      sql = `SELECT TOP 1 ${cols} FROM ${tbl}`;
      if (filter && typeof filter === 'object') {
        const where = this.whereFromJson(filter);
        sql += where.where;
        params = where.params;
      }
      sql += ` ORDER BY ${this.getRowIdIdentifier()} ASC`;
    } else {
      sql = `SELECT ${cols} FROM ${tbl}`;
      if (filter && typeof filter === 'object') {
        const where = this.whereFromJson(filter);
        sql += where.where;
        params = where.params;
      }
      sql += ` ORDER BY ${this.getRowIdIdentifier()} ASC LIMIT 1`;
    }
    return this.query(sql, params);
  }

  async moveToLast(tableName, fields, filter) {
    const tbl = this.quoteIdentifier(tableName);
    const cols = this.fieldList(fields);
    let sql;
    let params = [];
    if (this.provider === 'sqlserver') {
      sql = `SELECT TOP 1 ${cols} FROM ${tbl}`;
      if (filter && typeof filter === 'object') {
        const where = this.whereFromJson(filter);
        sql += where.where;
        params = where.params;
      }
      sql += ` ORDER BY ${this.getRowIdIdentifier()} DESC`;
    } else {
      sql = `SELECT ${cols} FROM ${tbl}`;
      if (filter && typeof filter === 'object') {
        const where = this.whereFromJson(filter);
        sql += where.where;
        params = where.params;
      }
      sql += ` ORDER BY ${this.getRowIdIdentifier()} DESC LIMIT 1`;
    }
    return this.query(sql, params);
  }

  async moveToNext(tableName, fields, currentRowId, filter) {
    const tbl = this.quoteIdentifier(tableName);
    const cols = this.fieldList(fields);
    let sql;
    let params = [currentRowId];
    if (this.provider === 'sqlserver') {
      sql = `SELECT TOP 1 ${cols} FROM ${tbl} WHERE ${this.getRowIdIdentifier()} > ?`;
      if (filter && typeof filter === 'object') {
        const where = this.whereFromJson(filter);
        sql += where.where ? ` AND ${where.where.replace(/^ WHERE /i, '')}` : '';
        params = params.concat(where.params);
      }
      sql += ` ORDER BY ${this.getRowIdIdentifier()} ASC`;
    } else {
      sql = `SELECT ${cols} FROM ${tbl} WHERE ${this.getRowIdIdentifier()} > ?`;
      if (filter && typeof filter === 'object') {
        const where = this.whereFromJson(filter);
        sql += where.where ? ` AND ${where.where.replace(/^ WHERE /i, '')}` : '';
        params = params.concat(where.params);
      }
      sql += ` ORDER BY ${this.getRowIdIdentifier()} ASC LIMIT 1`;
    }
    return this.query(sql, params);
  }

  async moveToPrevious(tableName, fields, currentRowId, filter) {
    const tbl = this.quoteIdentifier(tableName);
    const cols = this.fieldList(fields);
    let sql;
    let params = [currentRowId];
    if (this.provider === 'sqlserver') {
      sql = `SELECT TOP 1 ${cols} FROM ${tbl} WHERE ${this.getRowIdIdentifier()} < ?`;
      if (filter && typeof filter === 'object') {
        const where = this.whereFromJson(filter);
        sql += where.where ? ` AND ${where.where.replace(/^ WHERE /i, '')}` : '';
        params = params.concat(where.params);
      }
      sql += ` ORDER BY ${this.getRowIdIdentifier()} DESC`;
    } else {
      sql = `SELECT ${cols} FROM ${tbl} WHERE ${this.getRowIdIdentifier()} < ?`;
      if (filter && typeof filter === 'object') {
        const where = this.whereFromJson(filter);
        sql += where.where ? ` AND ${where.where.replace(/^ WHERE /i, '')}` : '';
        params = params.concat(where.params);
      }
      sql += ` ORDER BY ${this.getRowIdIdentifier()} DESC LIMIT 1`;
    }
    return this.query(sql, params);
  }

  async getRecordByRowID(tableName, fields, rowID) {
    const tbl = this.quoteIdentifier(tableName);
    const cols = this.fieldList(fields);
    let sql;
    if (this.provider === 'sqlserver') {
      sql = `SELECT TOP 1 ${cols} FROM ${tbl} WHERE ${this.getRowIdIdentifier()} = ?`;
    } else {
      sql = `SELECT ${cols} FROM ${tbl} WHERE ${this.getRowIdIdentifier()} = ? LIMIT 1`;
    }
    return this.query(sql, [rowID]);
  }

  async getROWID(tableName, offset = 0) {
    const tbl = this.quoteIdentifier(tableName);
    if (this.provider === 'sqlserver') {
      const rows = await this.query(`
        SELECT ${this.getRowIdIdentifier()} AS rowid
        FROM ${tbl}
        ORDER BY ${this.getRowIdIdentifier()} ASC
        OFFSET ? ROWS FETCH NEXT 1 ROWS ONLY
      `, [offset]);
      return rows[0]?.rowid ?? null;
    }
    const rows = await this.query(`
      SELECT ${this.getRowIdIdentifier()} AS rowid
      FROM ${tbl}
      ORDER BY ${this.getRowIdIdentifier()} ASC
      LIMIT 1 OFFSET ?
    `, [offset]);
    return rows[0]?.rowid ?? null;
  }

  async insertRecord(tableName, data, pkField) {
    if (!data || !Array.isArray(data.fields) || !Array.isArray(data.values) || data.fields.length !== data.values.length) {
      throw new Error("'fields' and 'values' arrays are required and must be same length.");
    }
    const tbl = this.quoteIdentifier(tableName);
    const fields = [];
    const placeholders = [];
    const params = [];

    data.fields.forEach((field, index) => {
      const value = data.values[index];
      if (value === '' || value === undefined || value === null) {
        return;
      }
      fields.push(this.quoteIdentifier(field));
      placeholders.push('?');
      params.push(value);
    });

    const sql = `INSERT INTO ${tbl} (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
    const execResult = await this.exec(sql, params);
    const baseResult = typeof execResult === 'object' ? execResult : { affectedRows: execResult };

    try {
      let rowQuery;
      if (this.provider === 'sqlserver') {
        rowQuery = `SELECT TOP 1 ${this.getRowIdIdentifier()} AS rowid FROM ${tbl} ORDER BY ${this.getRowIdIdentifier()} DESC`;
      } else {
        rowQuery = `SELECT ${this.getRowIdIdentifier()} AS rowid FROM ${tbl} ORDER BY ${this.getRowIdIdentifier()} DESC LIMIT 1`;
      }
      const rows = await this.query(rowQuery);
      return { ...baseResult, rowid: rows[0]?.rowid ?? null };
    } catch (error) {
      console.warn('Unable to retrieve last inserted rowid:', error.message);
    }

    return baseResult;
  }

  async updateRecord(tableName, data, rowID) {
    if (!data || !Array.isArray(data.fields) || !Array.isArray(data.values) || data.fields.length !== data.values.length) {
      throw new Error("Invalid data format. 'fields' and 'values' must be arrays of the same length.");
    }
    const tbl = this.quoteIdentifier(tableName);
    const setParts = [];
    const params = [];

    data.fields.forEach((field, index) => {
      const value = data.values[index];
      if (value === '' || value === undefined || value === null) {
        return;
      }
      setParts.push(`${this.quoteIdentifier(field)} = ?`);
      params.push(value);
    });

    params.push(rowID);

    const sql = `UPDATE ${tbl} SET ${setParts.join(', ')} WHERE ${this.getRowIdIdentifier()} = ?`;
    return this.exec(sql, params);
  }

  async getAll(tableName, fields, filterJson) {
    const tbl = this.quoteIdentifier(tableName);
    const cols = this.fieldList(fields);
    let sql = `SELECT ${cols} FROM ${tbl}`;
    let params = [];
    if (filterJson && typeof filterJson === 'object') {
      const where = this.whereFromJson(filterJson);
      sql += where.where;
      params = where.params;
    }
    return this.query(sql, params);
  }

  async alterTable(tableName, columnName, columnType) {
    if (!columnName || !columnType) {
      throw new Error('columnName and columnType are required.');
    }
    const tbl = this.quoteIdentifier(tableName);
    const column = this.quoteIdentifier(columnName);
    switch (this.provider) {
      case 'mysql':
      case 'mariadb':
      case 'postgresql':
      case 'cockroachdb':
      case 'sqlite':
        return this.exec(`ALTER TABLE ${tbl} ADD COLUMN ${column} ${columnType}`);
      case 'sqlserver':
        return this.exec(`ALTER TABLE ${tbl} ADD ${column} ${columnType}`);
      default:
        throw new Error(`alterTable is not supported for provider ${this.provider}`);
    }
  }

  async alterTableColumn(tableName, columnName, newColumnName, newColumnType) {
    if (!columnName || !newColumnName) {
      throw new Error('columnName and newColumnName are required.');
    }
    const tbl = this.quoteIdentifier(tableName);
    const column = this.quoteIdentifier(columnName);
    const newColumn = this.quoteIdentifier(newColumnName);

    switch (this.provider) {
      case 'mysql':
      case 'mariadb':
        if (!newColumnType) {
          throw new Error('newColumnType is required for MySQL/MariaDB');
        }
        return this.exec(`ALTER TABLE ${tbl} CHANGE COLUMN ${column} ${newColumn} ${newColumnType}`);
      case 'postgresql':
      case 'cockroachdb': {
        const statements = [`ALTER TABLE ${tbl} RENAME COLUMN ${column} TO ${newColumn}`];
        if (newColumnType) {
          statements.push(`ALTER TABLE ${tbl} ALTER COLUMN ${newColumn} TYPE ${newColumnType}`);
        }
        for (const stmt of statements) {
          await this.exec(stmt);
        }
        return { success: true };
      }
      case 'sqlite':
        return this.exec(`ALTER TABLE ${tbl} RENAME COLUMN ${column} TO ${newColumn}`);
      case 'sqlserver':
        return this.exec(`EXEC sp_rename '${tableName}.${columnName}', '${newColumnName}', 'COLUMN'`);
      default:
        throw new Error(`alterTableColumn is not supported for provider ${this.provider}`);
    }
  }

  async createTable(tableName, columns) {
    if (!Array.isArray(columns) || columns.length === 0) {
      throw new Error('columns must be a non-empty array');
    }
    const tbl = this.quoteIdentifier(tableName);
    const columnsSql = columns.join(', ');
    return this.exec(`CREATE TABLE ${tbl} (${columnsSql})`);
  }

  async exportTableToCSV(tableName, fields) {
    const tbl = this.quoteIdentifier(tableName);
    const cols = Array.isArray(fields) && fields.length > 0
      ? fields.map(field => this.quoteIdentifier(field)).join(', ')
      : '*';
    const rows = await this.query(`SELECT ${cols} FROM ${tbl}`);
    return json2csv(rows);
  }

  async nextSequence(seqTable, seqName) {
    switch (this.provider) {
      case 'postgresql':
      case 'cockroachdb':
        if (!isSafeIdentifier(seqName)) {
          throw new Error('Invalid sequence name');
        }
        if (this.schema && !isSafeIdentifier(this.schema)) {
          throw new Error('Invalid schema for sequence');
        }
        {
          const sequenceName = this.schema ? `${this.schema}.${seqName}` : seqName;
          return this.prisma.$queryRawUnsafe(`SELECT nextval('${sequenceName}') AS value`);
        }
      default:
        throw new Error(`nextSequence is not supported for provider ${this.provider}`);
    }
  }

  async getAllGroupe(tableName, fields, filter) {
    const tbl = this.quoteIdentifier(tableName);
    let sql = 'SELECT ';
    if (fields && fields.length > 0) {
      sql += fields
        .map(field => (field.toLowerCase() === 'rowid' ? this.getRowIdIdentifier() : this.quoteIdentifier(field)))
        .join(', ');
    } else {
      sql += '*';
    }
    sql += ` FROM ${tbl}`;
    if (filter && filter.column && filter.operator) {
      sql += ` WHERE ${this.quoteIdentifier(filter.column)} ${filter.operator} ?`;
      return this.query(sql, [filter.value]);
    }
    return this.query(sql);
  }

  async close() {
    await this.prisma.$disconnect();
  }
}

module.exports = PrismaDatabase;
