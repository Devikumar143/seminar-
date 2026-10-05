const fs = require('fs');
const path = require('path');
const db = require('../src/config/db');

async function migrate() {
  console.log('🔄 Running database migrations...');
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await db.query(schemaSql);
    console.log('✅ Migrations completed successfully! All tables created.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await db.pool.end();
  }
}

migrate();
