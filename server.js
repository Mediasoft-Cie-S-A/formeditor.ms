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

const express = require('express');
//Import the main Passport and Express-Session library
const passport = require('passport')
const session = require('express-session')
//Import the secondary "Strategy" library
const LocalStrategy = require('passport-local').Strategy
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const router = express.Router();



const app = express();
const port = 3000;

// Connection URL
const url = 'mongodb://0.0.0.0:27017';
const dbName = 'formeditmsapp';

// Create a new MongoClient
const client = new MongoClient(url, { useUnifiedTopology: true });
require('./mongodb')(app,client,dbName);

app.use(express.urlencoded({extended: false}))

// Serve static files from the 'public' folder
app.use(express.static('public'));


require('./authentication')(app,session, passport);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Import routes
require('./formService')(app, client, dbName);
require('./dblayer')(app,session, passport);


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});