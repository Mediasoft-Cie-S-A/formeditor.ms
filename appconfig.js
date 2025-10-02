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

function ensurePrismaEnvironmentVariables(config) {
  if (!config || typeof config !== 'object') {
    return;
  }

  const { dbtype, dblist } = config;
  if (dbtype !== 'prisma' || !dblist || typeof dblist !== 'object') {
    return;
  }

  for (const [name, dbConfig] of Object.entries(dblist)) {
    if (!dbConfig || typeof dbConfig !== 'object') {
      continue;
    }

    const connectionString = dbConfig.ConnectionString || dbConfig.connectionString || dbConfig.url;
    if (!connectionString) {
      continue;
    }

    const envKey = `PRISMA_${name.toUpperCase()}_URL`;
    if (!process.env[envKey]) {
      process.env[envKey] = connectionString;
    }

    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = connectionString;
    }
  }
}

ensurePrismaEnvironmentVariables(baseConfig);

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
