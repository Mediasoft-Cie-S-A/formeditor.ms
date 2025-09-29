module.exports = function registerAskGroqRoute(app, askGroqConfig = {}) {
  const { postUrl } = askGroqConfig;

  if (!postUrl) {
    console.warn('⚠️  askGroq.postUrl is not configured. The /api/ask-groq route will not be registered.');
    return;
  }

  app.post('/api/ask-groq', async (req, res) => {
    try {
      const response = await fetch(postUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
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
};
