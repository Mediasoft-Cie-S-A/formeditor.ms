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
const { MongoClient } = require("mongodb");

module.exports = function (app, mongoDbUrl, dbName) {
  const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/login");
  };
  app.get("/dashboard", checkAuthenticated, (req, res) => {
    res.render("dashboard.ejs", { name: req.user.name });
  });
  app.post("/store-business-json", checkAuthenticated, async (req, res) => {
    try {
      await client.connect();
      const db = client.db(dbName);
      const col = db.collection("businessComponent");

      // Construct form data with metadata
      const formData = {
        formId: req.body.formId, // Assuming formId is provided in the request
        formName: req.body.formName,
        formPath: req.body.formPath,
        userCreated: req.body.userCreated,
        userModified: req.body.userModified,
        modificationDate: new Date(),
        creationDate: new Date(),
        formData: req.body.formData, // The actual form data
      };

      // Insert the form data
      const result = await col.insertOne(formData);

      res.send({ message: "Form stored successfully", _id: result.insertedId });
    } catch (err) {
      console.log(err.stack);
      res.status(500).send("Error storing form");
    } finally {
      await client.close();
    }
  });

  app.get("/list-business-component", checkAuthenticated, async (req, res) => {
        // create a new MongoClient
        const client = new MongoClient(mongoDbUrl, {});
    try {
  
      await client.connect();
      const db = client.db(dbName);
      const col = db.collection("businessComponent");
      const forms = await col.find({}).toArray();
      res.send(forms);
    } catch (err) {
      console.log(err.stack);
      res.status(500).send("Error retrieving forms");
    } finally {
      await client.close();
    }
  });

  app.get(
    "/get-business-component/:componentId",
    checkAuthenticated,
    async (req, res) => {
          // create a new MongoClient
          const client = new MongoClient(mongoDbUrl, {});
      try {
     
        await client.connect();
        const db = client.db(dbName);
        const col = db.collection("businessComponent");
        const form = await col.findOne({ formId: req.params.formId });
        if (form) {
          res.send(form);
        } else {
          res.status(404).send("Form not found");
        }
      } catch (err) {
        console.log(err.stack);
        res.status(500).send("Error retrieving form");
      } finally {
        await client.close();
      }
    }
  );

  app.put(
    "/update-business-component/:componentId",
    checkAuthenticated,
    async (req, res) => {
         // create a new MongoClient
         const client = new MongoClient(mongoDbUrl, {});
      try {
       
        await client.connect();
        const db = client.db(dbName);
        const col = db.collection("businessComponent");
        const updateData = {
          formName: req.body.formName,
          formPath: req.body.formPath,
          userModified: req.body.userModified,
          modificationDate: new Date(),
          formData: req.body.formData,
        };
        const result = await col.updateOne(
          { formId: req.params.formId },
          { $set: updateData }
        );
        if (result.matchedCount === 0) {
          res.status(404).send("Form not found");
        } else {
          res.send({ message: "Form updated successfully" });
        }
      } catch (err) {
        console.log(err.stack);
        res.status(500).send("Error updating form");
      } finally {
        await client.close();
      }
    }
  );

  app.delete(
    "/delete-business-component/:componentId",
    checkAuthenticated,
    async (req, res) => {
          // create a new MongoClient
          const client = new MongoClient(mongoDbUrl, {});
      try {

        await client.connect();
        const db = client.db(dbName);
        const col = db.collection("businessComponent");

        const result = await col.deleteOne({ formId: req.params.formId });

        if (result.deletedCount === 0) {
          res.status(404).send("Form not found");
        } else {
          res.send({ message: "Form deleted successfully" });
        }
      } catch (err) {
        console.log(err.stack);
        res.status(500).send("Error deleting form");
      } finally {
        await client.close();
      }
    }
  );

  // Other form routes...
};
