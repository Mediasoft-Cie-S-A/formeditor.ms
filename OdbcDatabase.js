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

const odbc = require('odbc');

class OdbcDatabase {
    constructor(connectionString) {
        this.connectionString = connectionString;
    }

    async connect() {        
        try {
            const connectionConfig = {
                connectionString: this.connectionString,
                connectionTimeout: 10,
                loginTimeout: 10,
            }
            this.connection = await odbc.connect(connectionConfig);
            this.connection.setIsolationLevel(odbc.SQL_TXN_READ_UNCOMMITTED);
        } catch (err) {
            console.log('Error connecting to the database:', err);
          //  throw err;
        }
    }

    async connectWrite() {
        try {
            const connectionConfig = {
                connectionString: this.connectionString,
                connectionTimeout: 10,
                loginTimeout: 10,
            }
            this.connection = await odbc.connect(connectionConfig);
            this.connection.setIsolationLevel(odbc.SQL_TXN_READ_COMMITTED);
        } catch (err) {
            console.log('Error connecting to the database:', err);
          //  throw err;
        }
    }

    async selectDistinct(tableName, columnName, filter) {
        try {
            // Construct the SQL statement
            // if filter is not empty, add it to the query

            var sql = `SELECT DISTINCT "${columnName}" FROM PUB.${tableName} `;	
            if (filter && filter.length > 0) {
                sql+=` WHERE ${filter} `;
            }
            console.log(sql);
            // Execute the query
            const result = await this.connection.query(sql);

            return result;
        } catch (err) {
            console.log('Error selecting distinct values:', err);
            throw err;
        }
    }

    async selectDistinctIdValue(tableName,columnId, columnName, filter) {
        try {
            // Construct the SQL statement
            // if filter is not empty, add it to the query

            var sql = `SELECT DISTINCT "${columnId}","${columnName}" FROM PUB.${tableName} `;	
            if (filter && filter.length > 0) {
                sql+=` WHERE ${filter} `;
            }
            console.log(sql);
            // Execute the query
            const result = await this.connection.query(sql);

            return result;
        } catch (err) {
            console.log('Error selecting distinct values:', err);
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
                sql+=` WHERE ${filter} `;
            }
            console.log(sql);
            // Execute the query
            const result = await this.connection.query(sql);

            return result;
        } catch (err) {
            console.log('Error counting records:', err);
            throw err;
        }   
    }


    async queryData(queryString) {
        try {
            const result = await this.connection.query(queryString);
            return result;
        } catch (err) {
            console.log('Error querying data:', queryString, err);
           // throw err;
        }
    }

    async updateData(updateQuery) {
        try {
            const result = await this.connection.query(updateQuery);
            return result;
        } catch (err) {
            console.log('Error updating data:', err);
           // throw err;
        }
    }

    async deleteData(deleteQuery) {
        try {
            const result = await this.connection.query(deleteQuery);
            return result;
        } catch (err) {
            console.log('Error deleting data:', err);
          //  throw err;
        }
    }

    async close() {
        try {
            await this.connection.close();
        } catch (err) {
            console.log('Error closing the database connection:', err);
     }
    }

 
    async getTablesList() {
        try {
            // Query to get list of tables in OpenEdge
            console.log("getTablesList");
            const query = `SELECT "_File-Name" name, "_Desc" label FROM PUB."_File" WHERE "_file-Number">0 and "_file-Number"<32768 ORDER BY "_File-Name"`;
            const result = await this.connection.query(query);
            return result;
        } catch (err) {
            console.log('Error retrieving tables list:', err);
           // throw err;
        }
    }

    async getTableFields(tableName) {
        try {
            // Query to get fields of a table in OpenEdge
            var query = `SELECT "_Field-Name" Name, "_Data-Type" 'TYPE', "_Label" LABEL, "_Mandatory" 'MANDATORY',`;
            query+=` "_Format" 'FORMAT', "_Decimals" 'DECIMAL', "_Width" 'WIDTH', "_Initial" 'DEFAULT' FROM PUB."_Field" `;
            query+=` WHERE PUB."_Field"."_File-Recid" = (SELECT ROWID FROM PUB."_File" WHERE "_File-Name" = '${tableName}')`;
            console.log(query);
            const result = await this.connection.query(query);
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
            const result = await this.connection.query(query);
            return result;
        } catch (err) {
            console.log(`Error retrieving indexes for table ${tableName}:`, err);
          //  throw err;
        }
    }

    async queryDataWithPagination(tableName, page, pageSize,fields,filter) {
        try {
             // create filter base on filer paramenter, for search based on the input values, 
             //with field name and value separated by | and each filter separated by ,
             // and build the query where clause           

             // if filter is not empty, add it to the query
             if (filter && filter.length > 0) {
                filter = filter.split(',').map(f => {
                    const [fieldName,op, value] = f.split('|');
                   switch (op) {
                        case 'eq':
                            return `${fieldName} = '${value}'`;
                        case 'ne':
                            return `${fieldName} != '${value}'`;
                        case 'lt':
                            return `${fieldName} < '${value}'`;
                        case 'le':
                            return `${fieldName} <= '${value}'`;
                        case 'gt':
                            return `${fieldName} > '${value}'`;
                        case 'ge':
                            return `${fieldName} >= '${value}'`;
                        case 'like':
                            return `${fieldName} like '%${value}%'`;
                        case 'notlike':
                            return `${fieldName} not like '%${value}%'`;
                        case 'in':
                            return `${fieldName} in (${value})`;
                        case 'notin':
                            return `${fieldName} not in (${value})`;
                        default:
                            return `${fieldName} like '%${value}%'`;
                    }   
                }).join(' AND ');
            }


            if (fields && fields.length > 0) {
                // Construct the SQL query based on the fields provided by fieldList and adding "" to the field name
                const fieldList = fields.map(field => `"${field}"`).join(', ').replace("\"rowid\"","rowid");
                const offset = (page - 1) * pageSize;
                
                var paginatedQuery = `select  ${fieldList} FROM PUB."${tableName}"`;
                if (filter && filter.length > 0) {
                    paginatedQuery+=` WHERE ${filter} `;
                }
                paginatedQuery+=` OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;
                console.log(paginatedQuery)
                const result = await this.connection.query(paginatedQuery);
                return result;
                }
            return null;
        } catch (err) {
            console.error('Error querying data with pagination:', err);
            throw err;
        }
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
    let query = 'SELECT TOP 1 ';
    
    if (fields && fields.length > 0) {
        const fieldList = fields.map(field => `"${field}"`).join(', ').replace("\"rowid\"", "rowid");
        query += `${fieldList} `;
    } else {
        query += '* ';
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
    let fieldList = '*';
    if (fields && fields.length > 0) {
        fieldList = fields.map(field => `"${field}"`).join(', ').replace("\"rowid\"", "rowid");
    }
    let query = `SELECT ${fieldList} FROM PUB.${tableName} `;
    let whereClause = '';
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
    let fieldList = '*';
    if (fields && fields.length > 0) {
        fieldList = fields.map(field => `"${field}"`).join(', ').replace("\"rowid\"", "rowid");
    }
    let query = `SELECT ${fieldList} FROM PUB.${tableName} `;
    let whereClause = '';
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
    let fieldList = '*';
    if (fields && fields.length > 0) {
        fieldList = fields.map(field => `"${field}"`).join(', ').replace("\"rowid\"", "rowid");
    }
    let query = `SELECT ${fieldList} FROM PUB.${tableName} `;
    let whereClause = '';
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
        const fieldList = fields.map(field => `"${field}"`).join(', ').replace("\"rowid\"","rowid");
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
        
        // Construct the full SQL statement
        const sql = `UPDATE PUB.${tableName} SET ${data.body} WHERE ROWID = '${rowID}'`;
  
       console.log(sql);
        // Execute the query
        const result = await this.connection.query(sql);
        
        return result;
    } catch (err) {
        console.log('Error updating record:', err);
        throw err;
    }
}

// insert new record
async insertRecord(tableName, data) {
    try {
        // Construct the full SQL statement
        
        const sql = `INSERT INTO PUB.${tableName} (${data.fields}) VALUES (${data.values})`;
        console.log(sql);
        // Execute the query
        const result = await this.connection.query(sql);

        return result;
    } catch (err) {
        console.log('Error inserting record:', err);
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
        const result = await this.connection.query(sql);

        return result;
    } catch (err) {
        console.log('Error altering table:', err);
        throw err;
    }
}

// Alter table column
async alterTableColumn(tableName, columnName, newColumnName, newColumnType) {
    try {
        // Construct the SQL statement for renaming the column
        let sql = `ALTER TABLE PUB.${tableName} RENAME COLUMN ${columnName} TO ${newColumnName}`;

        // Execute the query
        let result = await this.connection.query(sql);

               return result;
    } catch (err) {
        console.log('Error altering table column:', err);
        throw err;
    }
}

// Create table
async createTable(tableName, columns) {
    try {
        // Construct the SQL statement
        const sql = `CREATE TABLE PUB.${tableName} (${columns.join(', ')})`;
        console.log(sql);
        // Execute the query
        const result = await this.connection.query(sql);

        return result;
    } catch (err) {
        console.log('Error creating table:', err);
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
            sql+=` WHERE ${filter} `;
        }
        console.log(sql);
        // Execute the query
        const result = await this.connection.query(sql);

        return result;
    } catch (err) {
        console.log('Error selecting distinct values:', err);
        throw err;
    }
}

// ----------------------------------
// Export table to CSV
// ----------------------------------
    async exportTableToCSV(tableName, fields) {
        try {
            // Construct the SQL statement
            const fieldList = fields.join(', ');
            const sql = `SELECT ${fieldList} FROM PUB.${tableName}`;
            console.log(sql);
            // Execute the query
            const result = await this.connection.query(sql);
            // convert result form json to csv
            const json2csv = require('json2csv').parse;
           const csv = json2csv(result);
           // console.log(csv);   

            
            return csv;
        } catch (err) {
            console.log('Error exporting table to CSV:', err);
            throw err;
        }
        }
}

module.exports = OdbcDatabase;
