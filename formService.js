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

const multer = require('multer');
const fs = require('fs');
const path = require('path');

module.exports = function (app, client, dbName) {
  const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/login");
  };

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'public/img'); // Replace with your target directory
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/bmp'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only images are allowed.'));
      }
    }
  });

  app.get("/dashboard", checkAuthenticated, (req, res) => {
    res.render("dashboard.ejs", { name: req.user.name });
  });

  app.post("/store-json", checkAuthenticated, async (req, res) => {
    try {
      await client.connect();
      const db = client.db(dbName);
      const col = db.collection("forms");

      // Construct form data with metadata
      const formData = {
        formId: req.body.formId,
        formName: req.body.formName,
        formPath: req.body.formPath,
        userCreated: req.body.userCreated,
        userModified: req.body.userModified,
        modificationDate: new Date(),
        creationDate: new Date(),
        formData: req.body.formData,
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

  app.get("/list-forms", checkAuthenticated, async (req, res) => {
    try {
      await client.connect();
      const db = client.db(dbName);
      const col = db.collection("forms");

      const forms = await col.find({}).toArray();

      res.send(forms);
    } catch (err) {
      console.log(err.stack);
      res.status(500).send("Error retrieving forms");
    } finally {
      await client.close();
    }
  });

  app.get("/get-form/:formId", checkAuthenticated, async (req, res) => {
    try {
      await client.connect();
      const db = client.db(dbName);
      const col = db.collection("forms");

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
  });

  app.put("/update-form/:formId", checkAuthenticated, async (req, res) => {
    try {
      await client.connect();
      const db = client.db(dbName);
      const col = db.collection("forms");

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
  });

  app.delete("/delete-form/:formId", checkAuthenticated, async (req, res) => {
    try {
      await client.connect();
      const db = client.db(dbName);
      const col = db.collection("forms");

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
  });

  // Web service to return all images
  app.get('/images', checkAuthenticated, (req, res) => {
    const imgDir = path.join(__dirname, 'public/img'); // Replace with your target directory

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

    try {
      const imagePaths = getAllImages(imgDir);
      res.json({ images: imagePaths });
    } catch (error) {
      console.error('Error reading directory:', error);
      res.status(500).json({ error: 'Unable to retrieve images' });
    }
  });

  // Web service to upload images
  app.post('/upload-image', checkAuthenticated, upload.single('image'), (req, res) => {
    try {
      // save the image in public/img
      res.json({ imagePath: `${req.file.filename}` });

      
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ error: 'Unable to upload image' });
    }
  });

  // Frontend functions for media library
  app.get('/media-library', checkAuthenticated, (req, res) => {
    res.render('media-library.ejs');
  });
};
