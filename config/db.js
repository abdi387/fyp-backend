const { Sequelize } = require('sequelize');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const parseDatabaseUrl = () => {
  const rawUrl = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.DB_URL;
  if (!rawUrl) return {};

  try {
    const url = new URL(rawUrl);
    return {
      database: url.pathname.replace(/^\//, ''),
      username: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      host: url.hostname,
      port: url.port,
      ssl:
        url.searchParams.get('ssl') === 'true' ||
        url.searchParams.get('ssl-mode') === 'REQUIRED' ||
        url.searchParams.get('sslmode') === 'require'
    };
  } catch (error) {
    console.warn('[db] DATABASE_URL/MYSQL_URL is invalid:', error.message);
    return {};
  }
};

const databaseUrlConfig = parseDatabaseUrl();
const dbName = process.env.DB_NAME || databaseUrlConfig.database;
const dbUser = process.env.DB_USER || databaseUrlConfig.username;
const dbPassword = process.env.DB_PASSWORD ?? databaseUrlConfig.password ?? '';
const dbHost = process.env.DB_HOST || databaseUrlConfig.host || 'localhost';
const dbPort = Number(process.env.DB_PORT || databaseUrlConfig.port || 3306);
const dbSslEnabled = process.env.DB_SSL === 'true' || databaseUrlConfig.ssl;
const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true';

if (!dbName || !dbUser) {
  throw new Error(
    'Missing database configuration. Set DB_NAME, DB_USER, DB_PASSWORD, DB_HOST and DB_PORT, or set DATABASE_URL.'
  );
}

console.log('[db] Configuration loaded:', {
  host: dbHost,
  port: dbPort,
  database: dbName,
  user: dbUser ? 'set' : 'missing',
  ssl: dbSslEnabled ? 'enabled' : 'disabled'
});

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
    evict: 10000
  },
  dialectOptions: dbSslEnabled
    ? {
        ssl: {
          require: true,
          rejectUnauthorized
        }
      }
    : {}
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('[db] MySQL connected successfully');

    if (process.env.NODE_ENV === 'development') {
      // Sync with alter in development so newly added model fields are created automatically.
      await sequelize.sync({ alter: true });
      console.log('[db] Database synced with model changes (alter applied)');
    }
  } catch (error) {
    console.error('[db] Unable to connect to database:', {
      name: error.name,
      message: error.message,
      parent: error.parent?.message
    });
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
