// MySqlDatabase.js
const mysql = require('mysql2/promise');

function ident(name) {
  if (!/^[A-Za-z0-9_.]+$/.test(name)) throw new Error(`Invalid identifier: ${name}`);
  return '`' + name.split('.').join('`.`') + '`';
}
function fieldList(fields = []) {
  if (!fields || fields.length === 0) return '*';
  return fields.map(f => f.toLowerCase() === 'rowid' ? '`rowid`' : ident(f)).join(', ');
}
function orderByClause(orderBy = []) {
  if (!Array.isArray(orderBy) || orderBy.length === 0) return '';
  const parts = orderBy.map(o => `${ident(o.fieldName)} ${o.order === 'desc' ? 'DESC' : 'ASC'}`);
  return ' ORDER BY ' + parts.join(', ');
}
function whereFromJson(json) {
  if (!json || !Array.isArray(json.filters) || json.filters.length === 0) return { where: '', params: [] };
  const params = [];
  const conds = json.filters.map(f => {
    const col = ident(f.field);
    if (Array.isArray(f.values) && f.values.length > 0) {
      const qs = f.values.map(() => '?').join(', ');
      params.push(...f.values);
      return `${col} IN (${qs})`;
    }
    if (f.value !== undefined && f.operator) {
      params.push(f.value);
      return `${col} ${f.operator} ?`;
    }
    return '1=1';
  });
  return { where: ' WHERE ' + conds.filter(Boolean).join(' AND '), params };
}

class MySqlDatabase {
  /**
   * @param {object|string} config - mysql2 config object or URI string
   * Example object: { host:'127.0.0.1', user:'root', password:'...', database:'ove_erp_lt' }
   * Example URI: "mysql://root:pass@127.0.0.1:3306/ove_erp_lt?charset=utf8mb4"
   */
  constructor(config) {
    console.log("MySqlDatabase constructor", config);
    console.log("Type of config.ConnectionString:", typeof config.ConnectionString);
    console.log("Config object:", config.ConnectionString);
    if (typeof config.ConnectionString === 'string') {
      this.pool = mysql.createPool({ uri: config.ConnectionString, waitForConnections: true, connectionLimit: 10 });
      try {
        this.dbName = new URL(config).pathname.replace(/^\//, '');
      } catch {
        this.dbName = null;
      }
    }
  }

  /* ---------- basic ---------- */
  async query(sql, params = []) {
    console.log("Executing query:", sql, params);
    const [rows] = await this.pool.execute(sql, params);
    console.log("Query result:", rows);
    return rows;
  }
  async exec(sql, params = []) {
    const [res] = await this.pool.execute(sql, params);
    console.log("Exec result:", res);
    return res;
  }
  async queryData(queryString, params = []) {  // <-- fix: use pool, no `connection` var
    return this.query(queryString, params);
  }
  async updateData(updateQuery, params = []) { return this.exec(updateQuery, params); }

  /* ---------- metadata (MariaDB-safe) ---------- */
  async getTablesList() {

    const sql = `
      SELECT TABLE_NAME AS NAME, TABLE_NAME AS LABEL
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `;

    return this.query(sql);
  }
  async getTableFields(tableName) {
    const sql = `
      SELECT COLUMN_NAME AS NAME,
             DATA_TYPE   AS TYPE,
             COLUMN_COMMENT AS LABEL,
             IF(IS_NULLABLE='NO',1,0) AS MANDATORY,
             COLUMN_TYPE  AS \`FORMAT\`,
             NUMERIC_SCALE AS \`DECIMAL\`,
             CHARACTER_MAXIMUM_LENGTH AS \`WIDTH\`,
             COLUMN_DEFAULT AS \`DEFAULT\`
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA =  DATABASE() AND TABLE_NAME = ? 
      ORDER BY ORDINAL_POSITION
    `;

    return this.query(sql, [tableName]);
  }
  async getTableIndexes(tableName) {
    const sql = `
      SELECT INDEX_NAME AS NAME, NON_UNIQUE
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = COALESCE(?, DATABASE()) AND TABLE_NAME = ?
      GROUP BY INDEX_NAME, NON_UNIQUE
      ORDER BY (INDEX_NAME='PRIMARY') DESC, INDEX_NAME
    `;
    return this.query(sql, [this.dbName, tableName]);
  }

  async getFieldLabels(tableName, fields, rowID) {
    // Assuming 'rowID' is the ROWID of the record to move to
    if (fields && fields.length > 0) {
      const filteredFields = fields
        .filter(f => f.toLowerCase() !== 'rowid')
        .map(f => `'${f}'`) // single quotes only
        .join(", ");
      console.log(filteredFields);



      const query = `
        SELECT COLUMN_NAME AS NAME, COLUMN_COMMENT AS LABEL
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME IN (${filteredFields})
      `;
      return this.queryData(query, [tableName]);
    }
    return null;
  }

  /* ---------- pagination/search ---------- */
  async queryDataWithPagination(tableName, page, pageSize, fields, filterJson, orderBy) {
    const tbl = ident(tableName);
    const cols = fieldList(fields);
    const offset = Math.max(0, (page - 1) * pageSize);
    let sql = `SELECT ${cols} FROM ${tbl}`;
    let params = [];
    if (filterJson && typeof filterJson === 'object') {
      const w = whereFromJson(filterJson); sql += w.where; params = w.params;
    }
    sql += orderByClause(orderBy);
    sql += ` LIMIT ? OFFSET ?`;
    params.push(pageSize, offset);
    return this.query(sql, params);
  }

  async selectDistinct(tableName, columnName, filter) {
    try {
      // Construct the MYSQL statement
      // if filter is not empty, add it to the query 
      var sql = `SELECT DISTINCT \`${columnName}\` FROM \`${tableName}\` `;
      if (filter && filter.length > 0) {
        sql += ` WHERE ${filter} `;
      }
      // order by columnName
      sql += ` ORDER BY \`${columnName}\` `;
      //  LIMIT 10
      sql += ` LIMIT 10`;
      console.log(sql);
      // Execute the query

      const result = await this.query(sql);
      return result;
    } catch (err) {
      console.log("Error selecting distinct values:", err);
      throw err;
    }


  }

  async selectDistinctIdValue(tableName, columnId, columnName, filter) {
    try {
      // Construct the MYSQL statement
      // if filter is not empty, add it to the query
      var sql = `SELECT DISTINCT \`${columnId}\`, \`${columnName}\` FROM \`${tableName}\` `;
      if (filter && filter.length > 0) {
        sql += ` WHERE ${filter} `;
      }
      // order by columnId
      sql += ` ORDER BY \`${columnId}\``;
      //  LIMIT 10
      sql += ` LIMIT 10`;
      console.log(sql);
      // Execute the query

      const result = await this.query(sql);
      return result;
    } catch (err) {
      console.log("Error selecting distinct values:", err);
      throw err;
    }

  }

  /* ---------- rowid nav (generated by DB trigger) ---------- */
  async moveToFirst(tableName, fields, filter) {
    const tbl = ident(tableName); const cols = fieldList(fields);
    let sql = `SELECT ${cols} FROM ${tbl}`; let params = [];
    if (filter && typeof filter === 'object') { const w = whereFromJson(filter); sql += w.where; params = w.params; }
    sql += ` ORDER BY \`rowid\` ASC LIMIT 1`;
    return this.query(sql, params);
  }
  async moveToLast(tableName, fields, filter) {
    const tbl = ident(tableName); const cols = fieldList(fields);
    let sql = `SELECT ${cols} FROM ${tbl}`; let params = [];
    if (filter && typeof filter === 'object') { const w = whereFromJson(filter); sql += w.where; params = w.params; }
    sql += ` ORDER BY \`rowid\` DESC LIMIT 1`;
    return this.query(sql, params);
  }
  async moveToNext(tableName, fields, currentRowId, filter) {
    const tbl = ident(tableName); const cols = fieldList(fields);
    let sql = `SELECT ${cols} FROM ${tbl} WHERE \`rowid\` > ?`; let params = [currentRowId];
    if (filter && typeof filter === 'object') { const w = whereFromJson(filter); sql += w.where ? (' AND ' + w.where.replace(/^ WHERE /, '')) : ''; params.push(...w.params); }
    sql += ` ORDER BY \`rowid\` ASC LIMIT 1`;
    return this.query(sql, params);
  }
  async moveToPrevious(tableName, fields, currentRowId, filter) {
    const tbl = ident(tableName); const cols = fieldList(fields);
    let sql = `SELECT ${cols} FROM ${tbl} WHERE \`rowid\` < ?`; let params = [currentRowId];
    if (filter && typeof filter === 'object') { const w = whereFromJson(filter); sql += w.where ? (' AND ' + w.where.replace(/^ WHERE /, '')) : ''; params.push(...w.params); }
    sql += ` ORDER BY \`rowid\` DESC LIMIT 1`;
    return this.query(sql, params);
  }
  async getRecordByRowID(tableName, fields, rowID) {
    const tbl = ident(tableName); const cols = fieldList(fields);
    return this.query(`SELECT ${cols} FROM ${tbl} WHERE \`rowid\` = ? LIMIT 1`, [rowID]);
  }
  async getROWID(tableName, offset = 0) {
    const tbl = ident(tableName);
    const rows = await this.query(`SELECT \`rowid\` FROM ${tbl} ORDER BY \`rowid\` ASC LIMIT 1 OFFSET ?`, [offset]);
    return rows[0]?.rowid ?? null;
  }

  /* ---------- CRUD by arrays (triggers fill rowid) ---------- */
  async insertRecord(tableName, data /* {fields:[], values:[]} */, pkField /* optional */) {
    if (!data || !Array.isArray(data.fields) || !Array.isArray(data.values) || data.fields.length !== data.values.length) {
      throw new Error("'fields' and 'values' arrays are required and must be same length.");
    }
    const tbl = ident(tableName);
    const flds = data.fields.map(ident).join(', ');
    const qs = data.values.map(() => '?').join(', ');
    const r = await this.exec(`INSERT INTO ${tbl} (${flds}) VALUES (${qs})`, data.values);

    if (pkField && r.insertId) {
      const row = await this.query(`SELECT \`rowid\` FROM ${tbl} WHERE ${ident(pkField)} = ?`, [r.insertId]);
      return { ...r, rowid: row[0]?.rowid ?? null };
    }
    return r;
  }
  async updateRecord(tableName, data, rowID) {
    if (!data || !Array.isArray(data.fields) || !Array.isArray(data.values) || data.fields.length !== data.values.length) {
      throw new Error("Invalid data format. 'fields' and 'values' must be arrays of the same length.");
    }
    const tbl = ident(tableName);
    const setClause = data.fields.map(f => `${ident(f)} = ?`).join(', ');
    return this.exec(`UPDATE ${tbl} SET ${setClause} WHERE \`rowid\` = ?`, [...data.values, rowID]);
  }
  async deleteRecordByRowId(tableName, rowID) {
    const tbl = ident(tableName);
    return this.exec(`DELETE FROM ${tbl} WHERE \`rowid\` = ?`, [rowID]);
  }

  /* ---------- generic getAll ---------- */
  async getAll(tableName, fields, filterJson) {
    const tbl = ident(tableName); const cols = fieldList(fields);
    let sql = `SELECT ${cols} FROM ${tbl}`; let params = [];
    if (filterJson && typeof filterJson === 'object') { const w = whereFromJson(filterJson); sql += w.where; params = w.params; }
    return this.query(sql, params);
  }
}

module.exports = MySqlDatabase;
// end of MySqlDatabase.js