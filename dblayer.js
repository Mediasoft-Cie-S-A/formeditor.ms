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

const OdbcDatabase = require('./OdbcDatabase'); 

module.exports = function(app,session, passport) {
    const checkAuthenticated = (req, res, next) => {
        if (req.isAuthenticated()) { return next(); }
        res.redirect("/login");
    };

    const dsn = 'DSN=Sports2000;UID=sysprogress;PWD=sysprogress'; 
    // Replace with your actual connection string
const db = new OdbcDatabase(dsn);

app.get('/table-structure/:tableName',checkAuthenticated, async (req, res) => {
    try {
        await db.connect();
        const tableName = req.params.tableName;
        const structure = await db.getTableStructure(tableName);
        res.json(structure);
    } catch (err) {
        console.log('Error:', err);
        res.status(500).send('Internal Server Error');
    } finally {
        await db.close();
    }
});

app.get('/tables-list', checkAuthenticated, async (req, res) => {
    try {
        console.log("tablesList");
        await db.connect();
        const tablesList = await db.getTablesList();
        res.json(tablesList);
    } catch (err) {
        console.log('Error:', err);
        res.status(500).send('Error retrieving tables list');
    } finally {
        await db.close();
    }
});

app.get('/table-fields/:tableName',checkAuthenticated, async (req, res) => {
    try {
        console.log("table-fields");
        await db.connect();
        const tableName = req.params.tableName;
        const fields = await db.getTableFields(tableName);
        res.json(fields);
    } catch (err) {
        res.status(500).send(`Error retrieving fields for table ${tableName}`);
    } finally {
        await db.close();
    }
});

app.get('/table-indexes/:tableName',checkAuthenticated, async (req, res) => {
    try {
        console.log("table-indexes");
        await db.connect();
        const tableName = req.params.tableName;
        const indexes = await db.getTableIndexes(tableName);
        res.json(indexes);
    } catch (err) {
        res.status(500).send(`Error retrieving indexes for table ${tableName}`);
    } finally {
        await db.close();
    }
});

 // Route to move to the first record of a table
 app.get('/move-to-first/:tableName', checkAuthenticated, async (req, res) => {
    try {
        await db.connect();
        const tableName = req.params.tableName;
        const firstRecord = await db.moveToFirst(tableName);
        res.json(firstRecord);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Error moving to first record');
    } finally {
        await db.close();
    }
});

// Route to move to the last record of a table
app.get('/move-to-last/:tableName', checkAuthenticated, async (req, res) => {
    try {
        await db.connect();
        const tableName = req.params.tableName;
        const lastRecord = await db.moveToLast(tableName);
        res.json(lastRecord);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Error moving to last record');
    } finally {
        await db.close();
    }
});

// Route to move to the next record of a table
app.get('/move-to-next/:tableName/:currentRowId', checkAuthenticated, async (req, res) => {
    try {
        await db.connect();
        const tableName = req.params.tableName;
        const currentRowId = req.params.currentRowId;
        const nextRecord = await db.moveToNext(tableName, currentRowId);
        res.json(nextRecord);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Error moving to next record');
    } finally {
        await db.close();
    }
});

// Route to move to the previous record of a table
app.get('/move-to-previous/:tableName/:currentRowId', checkAuthenticated, async (req, res) => {
    try {
        await db.connect();
        const tableName = req.params.tableName;
        const currentRowId = req.params.currentRowId;
        const previousRecord = await db.moveToPrevious(tableName, currentRowId);
        res.json(previousRecord);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Error moving to previous record');
    } finally {
        await db.close();
    }
});

// Route to move to the getROWID record of a table
app.get('/getROWID/:tableName/:currentRowId', checkAuthenticated, async (req, res) => {
    try {
        await db.connect();
        const tableName = req.params.tableName;
        const currentRowId = req.params.currentRowId;
        const nextRecord = await db.getROWID(tableName, currentRowId);
        res.json(nextRecord);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Error moving to next record');
    } finally {
        await db.close();
    }
});

// Route to update a record
app.put('/update-record/:tableName/:rowID',  checkAuthenticated, async (req, res) => {
    const { tableName, rowID } = req.params;
    const data = req.body; // Assuming the updated data is sent in the request body
    console.log(data);    
    try {
        await db.connectWrite();
        const result = await db.updateRecord(tableName, data, rowID);
        res.json({ message: 'Record updated successfully', result });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating record');
    } finally {
        await db.close();
    }
});

//GRID
app.get('/table-data/:tableName/:page/:pageSize', checkAuthenticated,  async (req, res) => {
    try {
        
        const { tableName, page, pageSize } = req.params;
        await db.connect();
        // Convert page and pageSize to numbers
        const pageNum = parseInt(page, 10);
        const pageSizeNum = parseInt(pageSize, 10);

        const data = await db.queryDataWithPagination(tableName, pageNum, pageSizeNum);
        res.json(data);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Error fetching paginated data');
    } finally {
        await db.close();
    }
});

}