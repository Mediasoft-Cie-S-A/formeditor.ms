const axios = require('axios');

module.exports = function registerAskAiRoute(app, askAIConfig = {}) {
  const { postUrl, apiKey, model = 'llama-3.3-70b-versatile' } = askAIConfig;

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
    const { prompt } = req.body;

    try {
      const response = await axios.post(
        'http://localhost:1234/v1/chat/completions',
        {
          model: 'google/gemma-3-12b',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          top_p: 0.9,
          max_tokens: 512,
          stop: ['}'],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer lm-studio',
          },
          timeout: 15 * 60 * 1000,
        }
      );

      res.json(response.data);
    } catch (err) {
      console.error('❌ LM Studio fetch failed:', err.message);
      res.status(500).json({ error: 'LM Studio timed out or failed.' });
    }
  });
};
