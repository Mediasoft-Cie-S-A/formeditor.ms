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

const askGroqConfig = {
  ...baseConfig.askGroq,
  postUrl:
    (baseConfig.askGroq && baseConfig.askGroq.postUrl) ||
    'https://api.groq.com/openai/v1/chat/completions',
  apiKey:
    (baseConfig.askGroq && baseConfig.askGroq.apiKey) ||
    '',
};

module.exports = {
  ...baseConfig,
  askGroq: askGroqConfig,
};
