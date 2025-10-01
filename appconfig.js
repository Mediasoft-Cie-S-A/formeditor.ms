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
    '',
  apiKey:
    (baseConfig.askAI && baseConfig.askAI.apiKey) ||
    '',
  model:
    (baseConfig.askAI && baseConfig.askAI.model) ||
    '',
};

const prismaConfig = {
  ...baseConfig.prisma,
  log: (baseConfig.prisma && baseConfig.prisma.log) || ['error'],
  defaultSchema: (baseConfig.prisma && baseConfig.prisma.defaultSchema) || {},
  rowId: (baseConfig.prisma && baseConfig.prisma.rowId) || 'rowid',
};

module.exports = {
  ...baseConfig,
  askAI: askAIConfig,
  prisma: prismaConfig,
};
