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

const mongoClient = require("mongodb").MongoClient;
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { deletedComponents } = require('./utils/deletedStore');
const {
  normalizeFormPayload,
  validateFormPayload,
  formatValidationErrors,
} = require('./model/formSchema');



module.exports = function (app, mongoDbUrl, dbName) {
  const checkAuthenticated = (req, res, next) => {
    //  console.log(app.passport);
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/login");
  };

  const requireCheckpoint = (requiredCheckPoint) => {
    return (req, res, next) => {
      if (!req.isAuthenticated()) {
        res.redirect("/login");
      }
      console.log(req.user.checkPoints);
      const userCheckpoints = req.user.checkPoints || [];

      if (userCheckpoints.includes('*') || userCheckpoints.includes(requiredCheckPoint)) {
        return next(); // User has access
      } else {
        return res.status(403).json({ message: 'Access Denied. Insufficient privileges.' });
      }
    };
  };

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        if (file.mimetype.startsWith("image"))
          uploadDir = path.join(__dirname, 'public/media/img'); // Replace with your target directory
        else if (file.mimetype.startsWith("video"))
          uploadDir = path.join(__dirname, 'public/media/video');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${Buffer.from(file.originalname, 'latin1').toString('utf8')}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/bmp', 'video/mp4'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only images are allowed.'));
      }
    }
  });


  const formatFormResponse = (form = null) => {
    if (!form) {
      return form;
    }

    const formatted = { ...form };

    if (formatted.modificationDate instanceof Date) {
      formatted.modificationDate = formatted.modificationDate.toISOString();
    }
    if (formatted.creationDate instanceof Date) {
      formatted.creationDate = formatted.creationDate.toISOString();
    }

    formatted.version = formatted.version ?? 1;
    formatted.modifiedBy = formatted.modifiedBy
      ?? formatted.userModified
      ?? formatted.userCreated
      ?? 'system';

    return formatted;
  };

  app.get("/dashboard", checkAuthenticated, (req, res) => {
    console.log(req.user.username);
    res.render("dashboard.ejs", { userName: req.user.username, checkPoints: req.user.checkPoints });
  });
  app.post("/store-json", checkAuthenticated, async (req, res) => {
    // create a new MongoClient
    const client = new mongoClient(mongoDbUrl, {});
    try {
      const normalizedPayload = normalizeFormPayload(req.body);
      const validation = validateFormPayload(normalizedPayload, req.body);
      if (!validation.valid) {
        const formattedErrors = formatValidationErrors(validation.errors);
        console.error('Form payload validation failed on /store-json', formattedErrors);
        return res.status(400).json({
          message: 'Invalid form payload',
          errors: formattedErrors,
        });
      }

      await client.connect();
      const db = client.db(dbName);
      const col = db.collection("forms");

      // Construct form data with metadata
      const now = new Date();
      const isoNow = now.toISOString();

      const formData = {
        objectId: normalizedPayload.objectId,
        objectName: normalizedPayload.objectName,
        objectSlug: normalizedPayload.objectSlug,
        userCreated: normalizedPayload.userCreated,
        userModified: normalizedPayload.userModified,
        modifiedBy: normalizedPayload.userModified || normalizedPayload.userCreated || 'system',
        modificationDate: isoNow,
        creationDate: isoNow,
        version: 1,
        formData: normalizedPayload.formData,
      };

      // Insert the form data
      const result = await col.insertOne(formData);

      res.send({
        message: "Form stored successfully",
        _id: result.insertedId,
        form: formatFormResponse({ ...formData, _id: result.insertedId })
      });
    } catch (err) {
      if (err instanceof SyntaxError && err.message.includes('formData')) {
        console.error('Form payload parsing failed on /store-json', err);
        return res.status(400).json({
          message: 'Invalid JSON for formData',
        });
      }
      console.log(err.stack);
      res.status(500).send("Error storing form");
    } finally {
      await client.close();
    }
  });

  app.get("/list-forms",
    requireCheckpoint("0001100001"), // Require specific checkpoint
    async (req, res) => {
      const client = new mongoClient(mongoDbUrl, {});
      try {
        // create a new MongoClient

        await client.connect();

        const db = client.db(dbName);
        const col = db.collection("forms");
        const forms = await col.find({}).toArray();

        res.send(forms.map(formatFormResponse));
      } catch (err) {
        console.log(err.stack);
        res.status(500).send("Error retrieving forms");
      } finally {
        await client.close();
      }
    });


  app.post("/create-form",
    requireCheckpoint("0001100002"), // Adjust checkpoint if needed
    async (req, res) => {
      const client = new mongoClient(mongoDbUrl, {});
      try {
        await client.connect();
        const db = client.db(dbName);
        const col = db.collection("forms");

        const normalizedPayload = normalizeFormPayload(req.body);
        const validation = validateFormPayload(normalizedPayload, req.body);
        if (!validation.valid) {
          const formattedErrors = formatValidationErrors(validation.errors);
          console.error('Form payload validation failed on /create-form', formattedErrors);
          return res.status(400).json({
            message: 'Invalid form payload',
            errors: formattedErrors,
          });
        }

        const { objectId, objectName, objectSlug, formData, userCreated } = normalizedPayload;

        // Check if form already exists
        const existing = await col.findOne({ objectId });
        if (existing) {
          return res.status(409).send("Form with this objectId already exists");
        }

        const now = new Date();
        const isoNow = now.toISOString();

        const newForm = {
          objectId,
          objectName,
          objectSlug,
          formData,
          creationDate: isoNow,
          modificationDate: isoNow,
          userCreated: userCreated || "system",
          userModified: userCreated || "system",
          modifiedBy: userCreated || "system",
          version: 1,
        };

        await col.insertOne(newForm);

        res.status(201).send({ message: "Form created successfully", form: formatFormResponse(newForm) });
      } catch (err) {
        if (err instanceof SyntaxError && err.message.includes('formData')) {
          console.error('Form payload parsing failed on /create-form', err);
          return res.status(400).json({
            message: 'Invalid JSON for formData',
          });
        }
        console.error(err.stack);
        res.status(500).send("Error creating form");
      } finally {
        await client.close();
      }
    });



  app.get("/get-form/:objectId",
    requireCheckpoint("0001100002"), // Require specific checkpoint 
    async (req, res) => {
      // create a new MongoClient
      const client = new mongoClient(mongoDbUrl, {});
      try {

        await client.connect();
        const db = client.db(dbName);
        const col = db.collection("forms");

        const form = await col.findOne({ objectId: req.params.objectId });

        if (form) {
          res.send(formatFormResponse(form));
        } else {
          res.status(404).send("Form not found");
        }
      } catch (err) {
        console.log(err.stack);
        res.status(500).send("Error retrieving form");
      } finally {
        await client.close();
      }
    });

  app.post('/api/delete-component', (req, res) => {
    const { id } = req.body;
    if (id) {
      deletedComponents.add(id);
      console.log('Component deleted:', id);
      res.sendStatus(200);
    } else {
      res.status(400).send('Missing id');
    }
  });

  app.put("/update-form/:objectId", checkAuthenticated, async (req, res) => {
    // create a new MongoClient
    const client = new mongoClient(mongoDbUrl, {});
    try {
      const normalizedPayload = normalizeFormPayload(req.body, { objectId: req.params.objectId });
      const validation = validateFormPayload(normalizedPayload, req.body);
      if (!validation.valid) {
        const formattedErrors = formatValidationErrors(validation.errors);
        console.error('Form payload validation failed on /update-form', formattedErrors);
        return res.status(400).json({
          message: 'Invalid form payload',
          errors: formattedErrors,
        });
      }

      await client.connect();
      const db = client.db(dbName);
      const col = db.collection("forms");

      const existingForm = await col.findOne({ objectId: req.params.objectId });

      if (!existingForm) {
        return res.status(404).send("Form not found");
      }

      const revisionsCollection = db.collection("formRevisions");
      const { _id: existingId, ...snapshot } = existingForm;
      const revisionPayload = {
        objectId: existingForm.objectId,
        version: existingForm.version ?? 1,
        archivedAt: new Date(),
        archivedBy: normalizedPayload.userModified || existingForm.modifiedBy || existingForm.userModified || 'system',
        formId: existingId,
        snapshot,
      };
      await revisionsCollection.insertOne(revisionPayload);

      const nextVersion = (existingForm.version ?? 1) + 1;
      const modificationDate = new Date().toISOString();
      const updatedUser = normalizedPayload.userModified || existingForm.userModified || existingForm.modifiedBy || 'system';
      const modifiedBy = normalizedPayload.userModified || existingForm.modifiedBy || existingForm.userModified || 'system';

      const updateData = {
        objectName: normalizedPayload.objectName,
        objectSlug: normalizedPayload.objectSlug,
        userModified: updatedUser,
        modifiedBy,
        modificationDate,
        version: nextVersion,
        formData: normalizedPayload.formData,
      };

      await col.updateOne(
        { objectId: req.params.objectId },
        { $set: updateData }
      );

      const updatedForm = await col.findOne({ objectId: req.params.objectId });

      res.send({ message: "Form updated successfully", form: formatFormResponse(updatedForm) });
    } catch (err) {
      if (err instanceof SyntaxError && err.message.includes('formData')) {
        console.error('Form payload parsing failed on /update-form', err);
        return res.status(400).json({
          message: 'Invalid JSON for formData',
        });
      }
      console.log(err.stack);
      res.status(500).send("Error updating form");
    } finally {
      await client.close();
    }
  });

  app.delete("/delete-form/:objectId", checkAuthenticated, async (req, res) => {
    // create a new MongoClient
    const client = new mongoClient(mongoDbUrl, {});
    try {

      await client.connect();
      const db = client.db(dbName);
      const col = db.collection("forms");

      const result = await col.deleteOne({ objectId: req.params.objectId });

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
  });

  app.get("/form-history/:objectId",
    requireCheckpoint("0001100002"),
    async (req, res) => {
      const client = new mongoClient(mongoDbUrl, {});
      try {
        await client.connect();
        const db = client.db(dbName);
        const revisionsCollection = db.collection("formRevisions");

        const history = await revisionsCollection
          .find({ objectId: req.params.objectId })
          .sort({ version: -1, archivedAt: -1 })
          .toArray();

        const formattedHistory = history.map((entry) => {
          const formattedEntry = { ...entry };
          if (formattedEntry.archivedAt instanceof Date) {
            formattedEntry.archivedAt = formattedEntry.archivedAt.toISOString();
          }
          formattedEntry.version = formattedEntry.version ?? 1;
          formattedEntry.archivedBy = formattedEntry.archivedBy || 'system';
          if (formattedEntry.snapshot) {
            formattedEntry.snapshot = formatFormResponse(formattedEntry.snapshot);
          }
          return formattedEntry;
        });

        res.send({ objectId: req.params.objectId, history: formattedHistory });
      } catch (err) {
        console.log(err.stack);
        res.status(500).send("Error retrieving form history");
      } finally {
        await client.close();
      }
    });

  // Web service to return all images
  app.get('/media', checkAuthenticated, (req, res) => {
    const imgDir = path.join(__dirname, 'public/media/img'); // Replace with your target directory
    const videoDir = path.join(__dirname, 'public/media/video');

    const getAllImages = (dir, baseDir = dir) => {
      const images = [];
      const supportedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']; // Add supported image extensions here

      // Read directory contents
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      entries.forEach(entry => {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Recursively process subdirectories
          images.push(...getAllImages(fullPath, baseDir));
        } else if (entry.isFile() && supportedExtensions.includes(path.extname(entry.name).toLowerCase())) {
          // Add relative path to images array
          images.push(path.relative(baseDir, fullPath));
        }
      });

      return images;
    };

    const getAllVideos = (dir, baseDir = dir) => {
      const videos = [];
      const supportedExtensions = ['.mp4']; // Add supported video extensions here

      // Read directory contents
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      entries.forEach(entry => {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Recursively process subdirectories
          videos.push(...getAllVideos(fullPath, baseDir));
        } else if (entry.isFile() && supportedExtensions.includes(path.extname(entry.name).toLowerCase())) {
          // Add relative path to images array
          videos.push(path.relative(baseDir, fullPath));
        }
      });

      return videos;
    };


    try {

      const imagePaths = getAllImages(imgDir);
      const videoPaths = getAllVideos(videoDir);
      res.json({ images: imagePaths, videos: videoPaths });
    } catch (error) {
      console.error('Error reading directory:', error);
      res.status(500).json({ error: 'Unable to retrieve images/videosformData' });
    }
  });

  // Web service to upload images
  app.post('/upload-media', checkAuthenticated, upload.single('media'), (req, res) => {
    console.log(req.file.mimetype)
    try {
      // save the image in public/media/img and video in public/media/video
      console.log(req.file.filename)
      res.json({ imagePath: `${req.file.filename}` });


    } catch (error) {
      console.error('Error uploading image/video:', error);
      res.status(500).json({ error: 'Unable to upload mediaformData' });
    }
  });

  // Frontend functions for media library
  app.get('/media-library', checkAuthenticated, (req, res) => {
    res.render('media-library.ejs');
  });
};
