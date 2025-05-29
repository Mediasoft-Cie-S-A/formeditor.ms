/*!
 * Copyright (c) 2023 Mediasoft & Cie S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const odbc = require("odbc");

class OdbcDatabase {
  constructor(connectionString) {
    console.log("connectionString", connectionString.ConnectionString);
    this.connectionString = connectionString.ConnectionString;
  }



  async selectDistinct(tableName, columnName, filter) {
    try {
      // Construct the SQL statement
      // if filter is not empty, add it to the query

      var sql = `SELECT DISTINCT "${columnName}" FROM PUB.${tableName} `;
      if (filter && filter.length > 0) {
        sql += ` WHERE ${filter} `;
      }
      console.log(sql);
      // Execute the query
    
      
       const connection =  await odbc.connect(this.connectionString);  
       await connection.setIsolationLevel(odbc.SQL_TXN_READ_UNCOMMITTED);
      const result = await connection.query(sql);
      await connection.close();
      return result;
    } catch (err) {
      console.log("Error selecting distinct values:", err);
      throw err;
    }
  }

  async selectDistinctIdValue(tableName, columnId, columnName, filter) {
    try {
      // Construct the SQL statement
      // if filter is not empty, add it to the query

      var sql = `SELECT DISTINCT "${columnId}","${columnName}" FROM PUB.${tableName} `;
      if (filter && filter.length > 0) {
        sql += ` WHERE ${filter} `;
      }
      // order by columnId
      sql += ` ORDER BY "${columnId}"`;
      //  FETCH FIRST 10 ROWS ONLY 
      sql += ` FETCH FIRST 10 ROWS ONLY`;
      console.log(sql);
      // Execute the query
     
       const connection =  await odbc.connect(this.connectionString);
       await connection.setIsolationLevel(odbc.SQL_TXN_READ_UNCOMMITTED);
      const result = await connection.query(sql);
      await connection.close();
      return result;
    } catch (err) {
      console.log("Error selecting distinct values:", err);
      throw err;
    }
  }


  // count records
  async count(tableName, filter) {
    try {
      // Construct the SQL statement
      // if filter is not empty, add it to the query

      var sql = `SELECT COUNT(*) FROM PUB.${tableName} `;
      if (filter && filter.length > 0) {
        sql += ` WHERE ${filter} `;
      }
      console.log(sql);
      // Execute the query

      
       const connection =  await odbc.connect(this.connectionString);
       await connection.setIsolationLevel(odbc.SQL_TXN_READ_UNCOMMITTED);
      const result = await connection.query(sql);
      await connection.close();
      return result;
    } catch (err) {
      console.log("Error counting records:", err);
      throw err;
    }
  }

  async queryData(queryString) {
    try {
      console.log(queryString);
      // Execute the query
  
       const connection =  await odbc.connect(this.connectionString);
       await connection.setIsolationLevel(odbc.SQL_TXN_READ_UNCOMMITTED);
      const result = await connection.query(queryString);
      await connection.close();
      return result;
    } catch (err) {
      console.log("Error querying data:", queryString, err);
      // throw err;
    }
  }

  async updateData(updateQuery) {
    try {
      // Execute the update query
  
      const connection =  await odbc.connect(this.connectionString);
      await connection.setIsolationLevel(odbc.SQL_TXN_READ_COMMITTED);
      const result = await connection.query(updateQuery);
      await connection.close();
      
      return result;
    } catch (err) {
      console.log("Error updating data:", err);
      // throw err;
    }
  }

  async deleteData(deleteQuery) {
    try {
      // Execute the delete query
      
      const connection =  await odbc.connect(this.connectionString);  
      await connection.setIsolationLevel(odbc.SQL_TXN_READ_COMMITTED);
      const result = await connection.query(deleteQuery);
      await connection.close();
      return result;
    } catch (err) {
      console.log("Error deleting data:", err);
      //  throw err;
    }
  }

  
  async getTablesList() {
    try {
      // Query to get list of tables in OpenEdge
      console.log("getTablesList");
      const query = `SELECT "_File-Name" name, "_Desc" label FROM PUB."_File" WHERE "_file-Number">0 and "_file-Number"<32768 ORDER BY "_File-Name"`;
      console.log(this.connectionString);
      const connection =  await odbc.connect(this.connectionString);
      await connection.setIsolationLevel(odbc.SQL_TXN_READ_UNCOMMITTED);
      const result = await connection.query(query);
      await connection.close();
      return result;
    } catch (err) {
      console.log("Error retrieving tables list:", err);
      // throw err;
    }
  }

  async getTableFields(tableName) {
    try {
      // Query to get fields of a table in OpenEdge
      var query = `SELECT "_Field-Name" Name, "_Data-Type" 'TYPE', "_Label" LABEL, "_Mandatory" 'MANDATORY',`;
      query += ` "_Format" 'FORMAT', "_Decimals" 'DECIMAL', "_Width" 'WIDTH', "_Initial" 'DEFAULT' FROM PUB."_Field" `;
      query += ` WHERE PUB."_Field"."_File-Recid" = (SELECT ROWID FROM PUB."_File" WHERE "_File-Name" = '${tableName}')`;
      console.log(query);
      
      const connection =  await odbc.connect(this.connectionString);
      await connection.setIsolationLevel(odbc.SQL_TXN_READ_UNCOMMITTED);
      const result = await connection.query(query);
      await connection.close();
      return result;
    } catch (err) {
      console.log(`Error retrieving fields for table ${tableName}:`, err);
      //  throw err;
    }
  }

  async getTableIndexes(tableName) {
    try {
      // Query to get indexes of a table in OpenEdge
      const query = `select "_index-name" Name from PUB."_index" idx, PUB."_file" fi where fi."_file-name"='${tableName}' and idx.rowid =(select"_file"."_prime-index" from PUB."_file" fs where fs."_file-name"='${tableName}')`;
      console.log(query);
      
      const connection =  await odbc.connect(this.connectionString);
      await connection.setIsolationLevel(odbc.SQL_TXN_READ_UNCOMMITTED);
      const result = await connection.query(query);
      await connection.close();
      return result;
    } catch (err) {
      console.log(`Error retrieving indexes for table ${tableName}:`, err);
      //  throw err;
    }
  }

  async queryDataWithPagination(tableName, page, pageSize, fields, filter, orderBy) {
    
    try {
      // create filter base on filer paramenter, for search based on the input values,
      //with field name and value separated by | and each filter separated by ,
      // and build the query where clause
      console.log(orderBy);
      if (fields && fields.length > 0) {
        // Construct the SQL query based on the fields provided by fieldList and adding "" to the field name
        const fieldList = fields
          .map((field) => `"${field}"`)
          .join(", ")
          .replace('"rowid"', "rowid");
        const offset = (page - 1) * pageSize;

        var paginatedQuery = `select  ${fieldList} FROM PUB."${tableName}"`;
        if (filter ) {
        //  console.log("filter", filter);
          paginatedQuery += this.jsonToWhereClause(filter);
        }
        // order by
        // paginatedQuery += ` ORDER BY ....
       
        if (orderBy && Array.isArray(orderBy) && orderBy.length > 0) {
          const orderClause = orderBy
            .map((order) => `"${order.fieldName}" ${order.order== "desc" ? "DESC" : "ASC"}`)
            .join(", ");
          paginatedQuery += ` ORDER BY ${orderClause}`;
        }

        paginatedQuery += ` OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;
        console.log(paginatedQuery);

      
        // Execute the paginated query
        
        const connection =  await odbc.connect(this.connectionString);
        await connection.setIsolationLevel(odbc.SQL_TXN_READ_UNCOMMITTED);
        const result = await connection.query(paginatedQuery);
          
        await connection.close();
        console.log("close connection");
        // Return the result
        return result;
      }
        // sum up of what filter has
      if (!filterJSON || !filterJSON.filters || filterJSON.filters.length === 0) {
        console.log("[FILTRES] Aucun filtre actif.");
      } else {
        console.table(
          filterJSON.filters.map(f => ({
            Champ: `${f.tableName}.${f.field}`,
            Valeur: f.value,
          }))
        );
      }

      return null;
    } catch (err) {
      console.error("Error querying data with pagination:", err);
      throw err;
    } // finally block to ensure connection is closed
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




  // CURSOR

  // Move to the first record
  //  async moveToFirst(tableName, fields) {
  //     // Construct the SQL query based on the fields provided
  //     let query;
  //     if (fields && fields.length > 0) {
  //         const fieldList = fields.map(field => `"${field}"`).join(', ').replace("\"rowid\"","rowid");
  //         console.log(fieldList);
  //         const query = `SELECT TOP 1 ${fieldList} FROM PUB.${tableName} `;
  //         return this.queryData(query);
  //     }
  //     return null;
  // }

  async moveToFirst(tableName, fields, filter) {
    // Construct the SQL query based on the fields provided
    let query = "SELECT TOP 1 ";

    if (fields && fields.length > 0) {
      const fieldList = fields
        .map((field) => `"${field}"`)
        .join(", ")
        .replace('"rowid"', "rowid");
      query += `${fieldList} `;
    } else {
      query += "* ";
    }

    query += `FROM PUB.${tableName} `;

    if (filter) {
      query += `WHERE "${filter.column}" ${filter.operator} '${filter.value}' `;
    }

    return this.queryData(query);
  }

  // Move to the last record
  // async moveToLast(tableName , fields) {
  //     // OpenEdge doesn't have a direct way to select the last record, so you might need to use an ORDER BY clause
  //     // with DESC and then select the TOP 1 record. This assumes you have a column to order by.
  //     if (fields && fields.length > 0) {
  //         const fieldList = fields.map(field => `"${field}"`).join(', ').replace("\"rowid\"","rowid");
  //         const query = `SELECT ${fieldList} FROM PUB.${tableName} ORDER BY 1 desc `;
  //         return this.queryData(query);
  //     }
  //     return null;
  // }

  async moveToLast(tableName, fields, filter) {
    let fieldList = "*";
    if (fields && fields.length > 0) {
      fieldList = fields
        .map((field) => `"${field}"`)
        .join(", ")
        .replace('"rowid"', "rowid");
    }
    let query = `SELECT ${fieldList} FROM PUB.${tableName} `;
    let whereClause = "";
    if (filter) {
      whereClause += `WHERE "${filter.column}" ${filter.operator} '${filter.value}' `;
    }
    query += `
        ${whereClause}
        ORDER BY 1 desc 
    `;
    console.log(query);
    return this.queryData(query);
  }
  async moveToNext(tableName, fields, currentRowId, filter) {
    let fieldList = "*";
    if (fields && fields.length > 0) {
      fieldList = fields
        .map((field) => `"${field}"`)
        .join(", ")
        .replace('"rowid"', "rowid");
    }
    let query = `SELECT ${fieldList} FROM PUB.${tableName} `;
    let whereClause = "";
    if (filter) {
      whereClause += `WHERE "${filter.column}" ${filter.operator} '${filter.value}' `;
    }
    query += `
        ${whereClause}
        OFFSET ${currentRowId} ROWS FETCH NEXT 1 ROWS ONLY
    `;
    console.log(query);
    return this.queryData(query);
  }

  // Move to the previous record
  // async moveToPrevious(tableName, fields, currentRowId) {
  //     // This is a bit tricky as OpenEdge doesn't support fetching the previous record directly
  //     // You might need to fetch all records with ROWID less than the current one and then take the last one
  //     if (fields && fields.length > 0) {
  //         const fieldList = fields.map(field => `"${field}"`).join(', ').replace("\"rowid\"","rowid");
  //             const query = `SELECT ${fieldList} FROM PUB.${tableName} OFFSET ${currentRowId} ROWS FETCH NEXT 1 ROWS ONLY`;
  //             console.log(query);
  //             return this.queryData(query);
  //         }
  //         return null;
  // }
  async moveToPrevious(tableName, fields, currentRowId, filter) {
    let fieldList = "*";
    if (fields && fields.length > 0) {
      fieldList = fields
        .map((field) => `"${field}"`)
        .join(", ")
        .replace('"rowid"', "rowid");
    }
    let query = `SELECT ${fieldList} FROM PUB.${tableName} `;
    let whereClause = "";
    if (filter) {
      whereClause += `WHERE "${filter.column}" ${filter.operator} '${filter.value}' `;
    }
    query += `
        ${whereClause}
        OFFSET ${currentRowId} ROWS FETCH NEXT 1 ROWS ONLY
    `;
    console.log(query);
    return this.queryData(query);
  }

  // Move to the row with the specified ROWID
  async getRecordByRowID(tableName, fields, rowID) {
    // Assuming 'rowID' is the ROWID of the record to move to
    if (fields && fields.length > 0) {
      const fieldList = fields
        .map((field) => `"${field}"`)
        .join(", ")
        .replace('"rowid"', "rowid");
      console.log(fieldList);
      const query = `SELECT ${fieldList} FROM PUB.${tableName} WHERE ROWID = '${rowID}'`;
      console.log(query);
      return this.queryData(query);
    }
    return null;
  }

  // Move to the next record
  async getROWID(tableName, currentRowId) {
    // Assuming 'currentRowId' is the ROWID of the current record
    const query = `SELECT ROWID FROM PUB."${tableName}"  OFFSET ${currentRowId} ROWS FETCH NEXT 1 ROWS ONLY`;
    console.log(query);
    return this.queryData(query);
  }

  async updateRecord(tableName, data, rowID) {
    try {
      let setdata = "";
      // convert array data.fields and data.values to string
      if (!data || !data.fields || !data.values) {
        throw new Error("Invalid data format. 'fields' and 'values' are required.");
      }
      if (typeof data.fields !== "object" && typeof data.values !== "object") {
        throw new Error("Invalid data format. 'fields' and 'values' should be arrays.");
      }
      if (data.fields.length !== data.values.length) {
        throw new Error("Fields and values length mismatch.");
      }
      for( let i = 0; i < data.fields.length; i++) {
        setdata += `"${data.fields[i]}" = '${data.values[i]}',`;
      }
      // remove the last comma
      setdata = setdata.slice(0, -1); // remove the last comma
      // Construct the full SQL statement
      const sql = `UPDATE PUB.${tableName} SET ${setdata} WHERE ROWID = '${rowID}'`;

      console.log(sql);
      // Execute the query
     
      const connection =  await odbc.connect(this.connectionString);
      await connection.setIsolationLevel(odbc.SQL_TXN_READ_COMMITTED);
      const result = await connection.query(sql);
      await connection.close();
      return result;
    } catch (err) {
      console.log("Error updating record:", err);
      throw err;
    }
  }

  // insert new record
  async insertRecord(tableName, data) {
    try {
      let fields = "";
      let values = "";
      // convert array data.fields and data.values to string
      if (!data || !data.fields || !data.values) {
        throw new Error("Invalid data format. 'fields' and 'values' are required.");
      }
      if (typeof data.fields === "object") {
        fields = "\""+ data.fields.join("\",\"") + "\""; // add quotes around each field
      }
      if (typeof data.values === "object") {
        values =  "'"+ data.values.join("','") + "'"; // add quotes around each value  
      }
      // remove the last comma and quote
   
      
      // Construct the full SQL statement
      const sql = `INSERT INTO PUB.${tableName} (${fields}) VALUES (${values})`;
      // Note: The values should be properly escaped to prevent SQL injection
      console.log(sql);
      // Execute the query
      const connection =  await odbc.connect(this.connectionString);
      await connection.setIsolationLevel(odbc.SQL_TXN_READ_COMMITTED);     

      const result = await connection.query(sql);
      await connection.close();
      return result;
    } catch (err) {
      console.log("Error inserting record:", err);
      throw err;
    }
  }

  // SCHEMA Modification
  // Alter table
  // Alter table
  async alterTable(tableName, columnName, columnType) {
    try {
      // Construct the SQL statement
      const sql = `ALTER TABLE PUB.${tableName} ADD ${columnName} ${columnType}`;
      console.log(sql);
      // Execute the query
      const connection =  await odbc.connect(this.connectionString);
      await connection.setIsolationLevel(odbc.SQL_TXN_READ_COMMITTED);
      const result = await connection.query(sql);
      await connection.close();
      return result;
    } catch (err) {
      console.log("Error altering table:", err);
      throw err;
    }
  }

  // Alter table column
  async alterTableColumn(tableName, columnName, newColumnName, newColumnType) {
    try {
      // Construct the SQL statement for renaming the column
      let sql = `ALTER TABLE PUB.${tableName} RENAME COLUMN ${columnName} TO ${newColumnName}`;

      // Execute the query
      console.log(sql);
      const connection =  await odbc.connect(this.connectionString);
      await connection.setIsolationLevel(odbc.SQL_TXN_READ_COMMITTED);
      let result = await connection.query(sql);
      await connection.close();
      return result;
    } catch (err) {
      console.log("Error altering table column:", err);
      throw err;
    }
  }

  // Create table
  async createTable(tableName, columns) {
    try {
      // Construct the SQL statement
      const sql = `CREATE TABLE PUB.${tableName} (${columns.join(", ")})`;
      console.log(sql);
      // Execute the query
      const connection =  await odbc.connect(this.connectionString);
      await connection.setIsolationLevel(odbc.SQL_TXN_READ_COMMITTED);
      const result = await connection.query(sql);
      await connection.close();
      return result;
    } catch (err) {
      console.log("Error creating table:", err);
      throw err;
    }
  }

  // select distinct values from column
  async selectDistinct(tableName, columnName, filter) {
    try {
      // Construct the SQL statement
      // if filter is not empty, add it to the query

      var sql = `SELECT DISTINCT ${columnName} FROM PUB.${tableName} `;
      if (filter && filter.length > 0) {
        sql += ` WHERE ${filter} `;
      }
      console.log(sql);
      // Execute the query
      const connection =  await odbc.connect(this.connectionString);
      await connection.setIsolationLevel(odbc.SQL_TXN_READ_UNCOMMITTED);
      const result = await connection.query(sql);
      await connection.close();
      return result;
    } catch (err) {
      console.log("Error selecting distinct values:", err);
      throw err;
    }
  }

  // ----------------------------------
  // Export table to CSV
  // ----------------------------------
  async exportTableToCSV(tableName, fields) {
    try {
      // Construct the SQL statement
      const fieldList = fields.join(", ");
      const sql = `SELECT ${fieldList} FROM PUB.${tableName}`;
      console.log(sql);
      // Execute the query
      const connection =  await odbc.connect(this.connectionString);
      await connection.setIsolationLevel(odbc.SQL_TXN_READ_UNCOMMITTED);
      const result = await connection.query(sql);
      await connection.close();
      // convert result form json to csv
      const json2csv = require("json2csv").parse;
      const csv = json2csv(result);
      // console.log(csv);

      return csv;
    } catch (err) {
      console.log("Error exporting table to CSV:", err);
      throw err;
    }
  }

  async nextSequence(seqTable,seqName) {
    let query = `SELECT TOP 1 PUB.${seqName}.NEXTVAL FROM PUB."${seqTable}"`;
    console.log(".........................................................");
    console.log(query);
    return this.queryData(query);
  }

  async getAllGroupe(tableName, fields, filter) {
    // Construct the SQL query based on the fields provided
    let query = "SELECT";

    if (fields && fields.length > 0) {
      const fieldList = fields
        .map((field) => `"${field}"`)
        .join(", ")
        .replace('"rowid"', "rowid");
      query += `${fieldList} `;
    } else {
      query += "* ";
    }

    query += `FROM PUB.${tableName} `;

    if (filter) {
      query += `WHERE "${filter.column}" ${filter.operator} '${filter.value}' `;
    }

    return this.queryData(query);
  }
}

module.exports = OdbcDatabase;
