const axios = require('axios');

module.exports = function registerAskAiRoute(app, askAIConfig = {}) {
  const { postUrl, apiKey, model = 'llama-3.3-70b-versatile', backup = {} } =
    askAIConfig;
  const {
    baseUrl: backupBaseUrl = 'https://api.openai.com/v1/chat/completions',
    apiKey: backupApiKey = process.env.OPENAI_API_KEY,
    model: backupModel = 'gpt-4o-mini',
  } = backup;

  if (!postUrl) {
    console.warn('⚠️  askAI.postUrl is not configured. The /api/ask-ai route will not be registered.');
  }

  if (!apiKey) {
    console.warn('⚠️  askAI.apiKey is not configured. The /api/ask-ai route will not be registered.');
  }

  if (postUrl && apiKey) {
    app.post('/api/ask-ai', async (req, res) => {
      try {
        const response = await fetch(postUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: req.body.messages,
          }),
        });

        if (!response.ok) {
          console.error('❌ AI API fetch failed with status:', response.status);
          return res.status(response.status).json({
            error: `AI API error: ${response.statusText}`,
          });
        }

        const result = await response.json();
        res.json(result);
      } catch (err) {
        console.error('❌ AI API fetch failed:', err.message);
        res.status(500).json({ error: 'Failed to fetch from AI API.' });
      }
    });
  }

  app.post('/api/lm', async (req, res) => {
    const { prompt, messages } = req.body || {};
    const requestMessages = Array.isArray(messages) && messages.length
      ? messages
      : prompt
        ? [{ role: 'user', content: prompt }]
        : null;

    if (!backupApiKey) {
      console.error('❌ Backup OpenAI API key is not configured.');
      return res
        .status(500)
        .json({ error: 'Backup AI service is not configured properly.' });
    }

    if (!requestMessages) {
      return res
        .status(400)
        .json({ error: 'prompt or messages must be provided.' });
    }

    try {
      const response = await axios.post(
        backupBaseUrl,
        {
          model: backupModel,
          messages: requestMessages,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${backupApiKey}`,
          },
          timeout: 2 * 60 * 1000,
        }
      );

      res.json(response.data);
    } catch (err) {
      console.error('❌ OpenAI backup fetch failed:', err.message);
      const status = err.response && err.response.status ? err.response.status : 500;
      const errorPayload = err.response && err.response.data && err.response.data.error;
      const errorMessage =
        typeof errorPayload === 'string'
          ? errorPayload
          : (errorPayload && errorPayload.message) || 'OpenAI backup request failed.';
      res.status(status).json({ error: errorMessage });
    }
  });
};
