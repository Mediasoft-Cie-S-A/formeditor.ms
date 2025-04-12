const mysql = require("mysql2/promise");

class MySqlDatabase {
  constructor(connectionConfig) 
  {
    connectionConfig = connectionConfig;
  }

  async connect() {
    try {
      connection = await mysql.createConnection(connectionConfig);
      console.log("Connected to MySQL database");
    } catch (err) {
      console.log("Error connecting to the database:", err);
      throw err;
    }
  }

  async queryData(queryString, params = []) {
    try {
      console.log(queryString);
      const [result] = await connection.execute(queryString, params);
      return result;
    } catch (err) {
      console.log("Error querying data:", queryString, err);
      throw err;
    }
  }

  async selectDistinct(tableName, columnName, filter = "") {
    try {
      let sql = `SELECT DISTINCT \`${columnName}\` FROM \`${tableName}\``;
      if (filter) sql += ` WHERE ${filter}`;
      return await this.queryData(sql);
    } catch (err) {
      console.log("Error selecting distinct values:", err);
      throw err;
    }
  }

  async count(tableName, filter = "") {
    try {
      let sql = `SELECT COUNT(*) AS count FROM \`${tableName}\``;
      if (filter) sql += ` WHERE ${filter}`;
      const result = await this.queryData(sql);
      return result[0].count;
    } catch (err) {
      console.log("Error counting records:", err);
      throw err;
    }
  }

  async updateData(updateQuery, params = []) {
    return await this.queryData(updateQuery, params);
  }

  async deleteData(deleteQuery, params = []) {
    return await this.queryData(deleteQuery, params);
  }

  async close() {
    try {
      await connection.end();
      console.log("MySQL connection closed");
    } catch (err) {
      console.log("Error closing the database connection:", err);
    }
  }

  async getTablesList() {
    try {
      const query = "SELECT DISTINCT TABLE_NAME NAME, TABLE_NAME label FROM `sys`.`x$schema_flattened_keys` WHERE TABLE_SCHEMA = DATABASE();";
      return await this.queryData(query);
    } catch (err) {
      console.log("Error retrieving tables list:", err);
      throw err;
    }
  }

  async getTableFields(tableName) {
    try {
      var query = "SELECT COLUMN_NAME AS NAME, ";
    query+= " SUBSTRING_INDEX(COLUMN_TYPE, '(', 1) AS `TYPE`, COLUMN_NAME AS LABEL, 0 MANDATORY, ";
    query+= " COLUMN_TYPE AS `FORMAT`, ";
    query+= " REGEXP_SUBSTR(COLUMN_TYPE, '\\(([^)]+)\\)') AS `DECIMAL`, ";
    query+= " REGEXP_SUBSTR(COLUMN_TYPE, '\\(([^)]+)\\)') AS `WIDTH`, ";
    query+= " COLUMN_DEFAULT AS `Default`, IS_NULLABLE AS `NULL`,  COLUMN_KEY AS `Key`,    EXTRA AS `Extra` ";
  query+= "FROM information_schema.COLUMNS   "
query+= `WHERE TABLE_NAME = '${tableName}' AND TABLE_SCHEMA = DATABASE()`;
      return await this.queryData(query);
    } catch (err) {
      console.log(`Error retrieving fields for table ${tableName}:`, err);
      throw err;
    }
  }

  async getTableIndexes(tableName) {
    try {
      const query = `SHOW INDEX FROM \`${tableName}\``;
      return await this.queryData(query);
    } catch (err) {
      console.log(`Error retrieving indexes for table ${tableName}:`, err);
      throw err;
    }
  }

  async queryDataWithPagination(tableName, page, pageSize, fields , filter ) {
    try {
      const offset = (page - 1) * pageSize;
      let sql = `SELECT ${fields} FROM \`${tableName}\``;
      console.log("filter", filter);
      if (filter) sql +=this.jsonToWhereClause(filter);
      sql += ` LIMIT ${pageSize} OFFSET ${offset}`;
      return await this.queryData(sql);
    } catch (err) {
      console.error("Error querying data with pagination:", err);
      throw err;
    }
  }

  jsonToWhereClause(json) {
    let whereClause = '';
    console.log("json ->", json);
    if (json.filters) {
      let conditions = json.filters.map(filter => {
        console.log(filter);
        const { field, operator, value, values, type } = filter;
        const dbField = field;

        // If values array is present, use IN clause
        if (values && values.length > 0) {
            const formattedValues = values.map(val => 
                type === 'character' ? `'${val}'` : val
            ).join(', ');
            return `${dbField} IN (${formattedValues})`;
        }
        
        // If single value, use operator directly
        if (value && operator) {
            const formattedValue = type === 'character' ? `'${value}'` : value;
            return `${dbField} ${operator} ${formattedValue}`;
        }
        
        return ''; // Return empty string if no valid condition found
    });

    // Join all conditions with AND
    whereClause = conditions.filter(Boolean).join(' AND ');
}

return whereClause ? ` WHERE ${whereClause}` : '';
}




  async insertRecord(tableName, data) {
    try {
      const columns = Object.keys(data).map(col => `\`${col}\``).join(", ");
      const values = Object.values(data);
      const placeholders = values.map(() => "?").join(", ");
      const sql = `INSERT INTO \`${tableName}\` (${columns}) VALUES (${placeholders})`;
      return await this.queryData(sql, values);
    } catch (err) {
      console.log("Error inserting record:", err);
      throw err;
    }
  }

  async updateRecord(tableName, data, condition) {
    try {
      const updates = Object.keys(data).map(col => `\`${col}\` = ?`).join(", ");
      const values = [...Object.values(data)];
      const sql = `UPDATE \`${tableName}\` SET ${updates} WHERE ${condition}`;
      return await this.queryData(sql, values);
    } catch (err) {
      console.log("Error updating record:", err);
      throw err;
    }
  }

  async createTable(tableName, columns) {
    try {
      const sql = `CREATE TABLE \`${tableName}\` (${columns.join(", ")})`;
      return await this.queryData(sql);
    } catch (err) {
      console.log("Error creating table:", err);
      throw err;
    }
  }

  async alterTable(tableName, columnDefinition) {
    try {
      const sql = `ALTER TABLE \`${tableName}\` ADD ${columnDefinition}`;
      return await this.queryData(sql);
    } catch (err) {
      console.log("Error altering table:", err);
      throw err;
    }
  }

  async deleteRecord(tableName, condition) {
    try {
      const sql = `DELETE FROM \`${tableName}\` WHERE ${condition}`;
      return await this.queryData(sql);
    } catch (err) {
      console.log("Error deleting record:", err);
      throw err;
    }
  }

  async exportTableToCSV(tableName, fields = "*") {
    try {
      const sql = `SELECT ${fields} FROM \`${tableName}\``;
      const result = await this.queryData(sql);
      const json2csv = require("json2csv").parse;
      return json2csv(result);
    } catch (err) {
      console.log("Error exporting table to CSV:", err);
      throw err;
    }
  }
}

module.exports = MySqlDatabase;
