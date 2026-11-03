const { Pool } = require('pg');
require('dotenv').config();

const isLocalhost = (str) => typeof str === 'string' && (str.includes('localhost') || str.includes('127.0.0.1'));

let sslOption = false;
if (process.env.DB_SSL === 'true') {
  sslOption = { rejectUnauthorized: false };
} else if (process.env.DB_SSL === 'false') {
  sslOption = false;
} else if (process.env.DATABASE_URL && !isLocalhost(process.env.DATABASE_URL)) {
  // Remote cloud databases (Neon, Supabase, Render, Aiven) require SSL
  sslOption = { rejectUnauthorized: false };
}

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: sslOption,
    }
  : {
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'kumar1234@',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'seminar_system_db',
      ssl: sslOption,
    };

const pool = new Pool({
  ...poolConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool,
};

