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

require('dotenv').config();

const express = require("express");
//Import the main Passport and Express-Session library
const passport = require("passport");
const session = require("express-session");
//Import the secondary "Strategy" library
const LocalStrategy = require("passport-local").Strategy;
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const fs = require("fs");
const appConfig = require('./appconfig');
const router = express.Router();


const app = express();

app.post("/register", async (req, res) => {
  // Our register logic starts here
  try {
    // Get user input
    const { first_name, last_name, email, password } = req.body;

    // Validate user input
    if (!(email && password && first_name && last_name)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;

    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});

// get the config
app.config = appConfig;

// mongodb Connection URL
const mongoDbUrl = app.config.mongoDbUrl;
// Database Name
const dbName = app.config.mongoDbName;
const port = app.config.port;
// Create a new MongoClient



app.use(express.urlencoded({ extended: false }));

// Serve static files from the 'public' folder
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// authentication
// init session

require('./authentication')(app, session, passport);
require('./authCustom')(app, session, passport);
require('./authStatic')(app, session, passport);

const dblayer = require('./dblayer');
const dbs = new dblayer(app, session, passport);
dbs.init();
try {
  dbs.generateRoutes(app, dbs);
}
catch (err) {
  console.log(err);
}
// Import routes
require('./formService')(app, mongoDbUrl, dbName);
require('./businessComponentService')(app, mongoDbUrl, dbName);
require('./GED')(app, session, passport);
const { registerDynamicRoutes } = require("./dynamic")(app, mongoDbUrl, dbName);
// Register the dynamic routes
registerDynamicRoutes();
require("./pageService")(app, mongoDbUrl, dbName, registerDynamicRoutes);
require('./askAiService')(app, app.config.askAI);

// Swagger definition
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Express API for My Application",
    version: "1.0.0",
    description: "This is a REST API application made with Express.",
  },
  servers: [
    {
      url: `http://localhost:${port}`,
      description: "Formeditor.ms lowcode api",
    },
  ],
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  definition: {},
  // Paths to files containing OpenAPI definitions
  apis: ["./*.js"], // Adjust this path to where your route files are
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

// Use swagger-ui-express for your app's documentation endpoint
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/elementsConfig", (req, res) => {
  fs.readFile("config/elements.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading file");
    } else {
      res.json(JSON.parse(data));
    }
  });
});

// add routes for send email
// require('./smtpAzureAd')(app,session, passport);

// Add process listeners BEFORE starting the server
process.on('exit', (code) => {
  console.log(`🔚 Process exiting with code: ${code}`);
});

process.on('SIGINT', () => {
  console.log('🛑 Caught SIGINT (Ctrl+C). Shutting down gracefully...');
  process.exit();
});

process.on('SIGTERM', () => {
  console.log('🔒 Caught SIGTERM (kill). Cleaning up...');
  process.exit();
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('warning', (warning) => {
  console.warn('⚠️ Warning:', warning.name, warning.message, warning.stack);
});

process.on('message', (msg) => {
  console.log('📬 Message from parent:', msg);
});

process.on('SIGUSR1', () => {
  console.log('📩 Received SIGUSR1 signal. Performing custom action...');
  // Custom action here
});

process.on('SIGUSR2', () => {
  console.log('📩 Received SIGUSR2 signal. Performing custom action...');
  // Custom action here
});

process.on('multipleResolves', (type, promise, reason) => {
  console.error('🔁 Multiple Resolves:', type, promise, reason);
});

process.on('rejectionHandled', (promise) => {
  console.warn('🔁 Rejection Handled:', promise);
});

const axios = require("axios");

app.post("/api/lm", async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post("http://localhost:1234/v1/chat/completions", {
      model: "google/gemma-3-12b",  // or whichever model you're using
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,      // low creativity
      top_p: 0.9,
      max_tokens: 512,       // or more if your responses are longer
      stop: ["}"],            // optional, helps terminate JSON
    }, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer lm-studio"
      },
      timeout: 15 * 60 * 1000  // ✅ 15 minutes
    });

    res.json(response.data);
  } catch (err) {
    console.error("❌ LM Studio fetch failed:", err.message);
    res.status(500).json({ error: "LM Studio timed out or failed." });
  }
});

try {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
} catch (e) {
  console.error("Server failed to start:", e);
}


