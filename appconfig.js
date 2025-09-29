const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'appconfig.json');
let baseConfig = {};

try {
  const fileContent = fs.readFileSync(configPath, 'utf8');
  baseConfig = JSON.parse(fileContent);
} catch (err) {
  console.error('Error loading config file:', err);
}

const askAIConfig = {
  ...baseConfig.askAI,
  postUrl:
    (baseConfig.askAI && baseConfig.askAI.postUrl) ||
    'https://api.groq.com/openai/v1/chat/completions',
  apiKey:
    (baseConfig.askAI && baseConfig.askAI.apiKey) ||
    '',
  model:
    (baseConfig.askAI && baseConfig.askAI.model) ||
    'llama-3.3-70b-versatile',
};

module.exports = {
  ...baseConfig,
  askAI: askAIConfig,
};
