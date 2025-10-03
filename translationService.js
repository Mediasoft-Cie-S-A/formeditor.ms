/*!
 * Copyright (c) 2024 Mediasoft & Cie S.A.
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

const { MongoClient } = require('mongodb');

const COLLECTION_NAME = 'translationDictionaries';
const DOCUMENT_ID = 'system';

function createMongoClient(mongoDbUrl) {
  return new MongoClient(mongoDbUrl, {});
}

async function loadDictionary(db) {
  const collection = db.collection(COLLECTION_NAME);
  const document = await collection.findOne({ _id: DOCUMENT_ID });
  return (document && document.dictionary) || {};
}

async function saveDictionary(db, dictionary) {
  const collection = db.collection(COLLECTION_NAME);
  await collection.updateOne(
    { _id: DOCUMENT_ID },
    {
      $set: {
        dictionary,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function parseDictionaryFromAIResponse(content) {
  if (!content || typeof content !== 'string') {
    return null;
  }

  let jsonContent = content.trim();

  if (jsonContent.startsWith('```')) {
    const match = jsonContent.match(/```(?:json)?\n([\s\S]*?)```/i);
    if (match) {
      jsonContent = match[1].trim();
    }
  }

  try {
    const parsed = JSON.parse(jsonContent);
    return isPlainObject(parsed) ? parsed : null;
  } catch (err) {
    return null;
  }
}

module.exports = function registerTranslationService(app, mongoDbUrl, dbName) {
  const checkAuthenticated = (req, res, next) => {
    if (typeof req.isAuthenticated === 'function' && req.isAuthenticated()) {
      return next();
    }
    if (typeof req.isAuthenticated !== 'function') {
      return next();
    }
    res.status(401).json({ error: 'Authentication required.' });
  };

  app.get('/api/translations', checkAuthenticated, async (req, res) => {
    const client = createMongoClient(mongoDbUrl);
    try {
      await client.connect();
      const db = client.db(dbName);
      const dictionary = await loadDictionary(db);
      res.json({ dictionary });
    } catch (err) {
      console.error('❌ Failed to load translation dictionary:', err);
      res.status(500).json({ error: 'Unable to load translation dictionary.' });
    } finally {
      await client.close();
    }
  });

  app.put('/api/translations', checkAuthenticated, async (req, res) => {
    const { dictionary } = req.body || {};

    if (!isPlainObject(dictionary)) {
      return res.status(400).json({ error: 'Invalid dictionary payload. Expected an object.' });
    }

    const client = createMongoClient(mongoDbUrl);
    try {
      await client.connect();
      const db = client.db(dbName);
      await saveDictionary(db, dictionary);
      res.json({ dictionary });
    } catch (err) {
      console.error('❌ Failed to save translation dictionary:', err);
      res.status(500).json({ error: 'Unable to save translation dictionary.' });
    } finally {
      await client.close();
    }
  });

  app.post('/api/translations/import', checkAuthenticated, async (req, res) => {
    const { dictionary } = req.body || {};

    if (!isPlainObject(dictionary)) {
      return res.status(400).json({ error: 'Invalid dictionary payload. Expected an object.' });
    }

    const client = createMongoClient(mongoDbUrl);
    try {
      await client.connect();
      const db = client.db(dbName);
      await saveDictionary(db, dictionary);
      res.json({ dictionary });
    } catch (err) {
      console.error('❌ Failed to import translation dictionary:', err);
      res.status(500).json({ error: 'Unable to import translation dictionary.' });
    } finally {
      await client.close();
    }
  });

  app.post('/api/translations/ai-generate', checkAuthenticated, async (req, res) => {
    const { prompt, baseDictionary = {} } = req.body || {};

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'A prompt is required to generate translations with AI.' });
    }

    const aiConfig = (app.config && app.config.askAI) || {};
    const { postUrl, apiKey, model } = aiConfig;

    if (!postUrl || !apiKey || !model) {
      return res.status(503).json({ error: 'AI service is not configured.' });
    }

    try {
      const response = await fetch(postUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content:
                'You generate translation dictionaries. Return valid JSON where keys are language codes and values are key/value translation pairs.',
            },
            {
              role: 'user',
              content: `${prompt}\nExisting dictionary:${JSON.stringify(baseDictionary)}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        console.error('❌ AI API error status:', response.status, response.statusText);
        return res.status(response.status).json({
          error: 'AI service returned an error.',
        });
      }

      const payload = await response.json();
      const aiContent =
        payload?.choices?.[0]?.message?.content ||
        payload?.message?.content ||
        payload?.content;

      const generatedDictionary = parseDictionaryFromAIResponse(aiContent);

      if (!generatedDictionary) {
        console.error('❌ Unable to parse AI response as dictionary:', aiContent);
        return res.status(500).json({ error: 'AI response could not be parsed as a dictionary.' });
      }

      const client = createMongoClient(mongoDbUrl);
      try {
        await client.connect();
        const db = client.db(dbName);
        await saveDictionary(db, generatedDictionary);
      } finally {
        await client.close();
      }

      res.json({ dictionary: generatedDictionary });
    } catch (err) {
      console.error('❌ Failed to generate translation dictionary with AI:', err);
      res.status(500).json({ error: 'Unable to generate translation dictionary with AI.' });
    }
  });
};
