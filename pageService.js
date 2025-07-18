

const mongoClient = require("mongodb").MongoClient;

function isValidSlug(slug) {
  return /^\/[a-z0-9\-\/]*$/.test(slug);
}

module.exports = async function (app, mongoDbUrl, dbName, dynamic) {


  // Middleware d'authentification
  const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
      return next();
    }
    res.redirect("/login");
  };

  // Crée une nouvelle page
  app.post("/pages", checkAuthenticated, async (req, res) => {
    const { objectId,
      slug,
      title,
      layout = "raw",
      content = "",
      meta = {},
      userCreated = "",
      userModified = "",
      header = "" } = req.body;
    const client = new mongoClient(mongoDbUrl, {});
    try {
      if (!title) throw new Error("Le titre est requis");
      await client.connect();
      const db = client.db(dbName);
      const pageCol = db.collection("pages");
      const id = objectId;
      const existing = await pageCol.findOne({ objectId: id });
      //if existi update 
      if (existing) {
        // update the existing page
        const update = {

          title,
          layout,
          content,
          meta,
          updatedAt: new Date(),
          userCreated,
          userModified,
          header,
        };
        // update
        const result = await pageCol.updateOne(
          { objectId: id },         // critère de sélection
          { $set: update }          // données à mettre à jour
        );
        res.json({ msg: "update" });
        return result;
      }

      const now = new Date();

      const page = { objectId, slug, title, layout, content, meta, createdAt: now, updatedAt: now };


      const result = await pageCol.insertOne(page);
      res.json({ insertedId: result.insertedId });
    } catch (err) {
      res.status(400).json({ error: err.message });
    } finally {
      await client.close();
      dynamic(); // Re-register dynamic routes after creating a page
    }
  });



  // Supprime une page
  app.delete("/pages/:id", checkAuthenticated, async (req, res) => {
    const id = req.params.id;
    const client = new mongoClient(mongoDbUrl, {});
    try {

      await client.connect();
      const db = client.db(dbName);
      const pageCol = db.collection("pages");
      const result = await pageCol.deleteOne({ objectId: id });

      if (result.deletedCount === 0) throw new Error("Page non trouvée ou déjà supprimée");

      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    } finally {
      await client.close();
    }
  });



  // Récupère une page par ID
  app.get("/pages/:id", async (req, res) => {
    const id = req.params.id;
    const client = new mongoClient(mongoDbUrl, {});
    try {

      await client.connect();
      const db = client.db(dbName);
      const pageCol = db.collection("pages");
      const page = await pageCol.findOne({ objectId: id });
      console.log(page);
      if (!page) return res.status(404).json({ error: "Page non trouvée" });
      res.json(page);
    } catch (err) {
      res.status(400).json({ error: err.message });
    } finally {
      await client.close();
    }
  });

  // Liste les pages
  app.get("/pages", async (req, res) => {
    const { limit = 20, skip = 0, sortBy = "updatedAt", order = -1 } = req.query;
    const client = new mongoClient(mongoDbUrl, {});
    try {
      await client.connect();
      const db = client.db(dbName);
      const pageCol = db.collection("pages");
      if (!["slug", "title", "createdAt", "updatedAt"].includes(sortBy)) {
        throw new Error("Champ de tri invalide");
      }
      const pages = await pageCol
        .find({})
        .sort({ [sortBy]: parseInt(order) })
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .toArray();

      res.json(pages);
    } catch (err) {
      res.status(400).json({ error: err.message });
    } finally {
      await client.close();
    }
  });

};
