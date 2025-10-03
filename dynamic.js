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

module.exports = function (app, mongoDbUrl, dbName) {
  const checkAuthenticated = (req, res, next) => {
    //  console.log(app.passport);
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/login");
  };

  async function registerDynamicRoutes() {
    console.log("Registering dynamic routes from the database...");
    const client = new mongoClient(mongoDbUrl, {});

    try {
      await client.connect();
      const db = client.db(dbName);
      const pageCol = db.collection("pages");

      if (!pageCol) {
        console.error("Collection 'Pages' does not exist in the database.");
        return;
      }

      const pages = await pageCol.find({}).toArray();
      console.log(`Found ${pages.length} pages in the database.`);

      if (pages.length === 0) {
        console.warn("No pages found in the database.");
        return;
      }

      pages.forEach((page) => {
        const {
          slug: originalSlug,
          layout,
          content,
          title,
          header,
        } = page;
        let { meta } = page;

        let slug = originalSlug;
        console.log(`Defining route for slug: ${slug}, layout: ${layout}, title: ${title}`);

        // Evita collisioni con rotte già definite
        if (app._router.stack.some((r) => r.route?.path === slug)) {
          return;
        }

        console.log(`Registering route: ${slug}`);

        // check if the first character of the slug is a slash
        if (typeof slug === "string" && !slug.startsWith("/")) {
          slug = `/${slug}`;
        }

        // check if meta is an object
        if (typeof meta !== "object" || meta === null) {
          meta = {};
        }

        // assign meta.description if not defined
        if (!meta.description) {
          meta.description = `Page ${title}`;
        }

        // assign meta.keywords if not defined
        if (!meta.keywords && typeof title === "string") {
          meta.keywords = title.split(" ").join(", ");
        }

        app.get(slug, (req, res) => {
          res.render(`layouts/${layout}.ejs`, {
            title,
            meta,
            body: content, // verrà iniettato nella view
            description: meta.description,
            keywords: meta.keywords,
            header: header || "", // Aggiungi header se esiste
          });
        });
      });
    } catch (err) {
      console.error("Error fetching pages:", err);
    } finally {
      try {
        await client.close();
      } catch (closeErr) {
        console.error("Error closing MongoDB client:", closeErr);
      }
    }
  } // register dynamic routes from the database




  app.get("/", (req, res) => {
    res.redirect("/dashboard");
  });

  app.get("/index", (req, res) => {
    res.render("index.ejs");
  });

  app.get("admin", checkAuthenticated, (req, res) => {
    res.render("admin.ejs");
  });
  app.get("/editor", checkAuthenticated, async (req, res) => {
    res.render("editor.ejs");
  });

  // 👇 Export registerDynamicRoutes so it can be called externally
  return {
    registerDynamicRoutes
  };
}

