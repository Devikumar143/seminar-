const db = require('../src/config/db');

async function updateDb() {
  try {
    console.log('Connecting to database...');
    
    // Update seminars venue and organizer_info
    const r1 = await db.query(`
      UPDATE seminars 
      SET venue = REPLACE(venue, 'Apex', 'Joy'),
          organizer_info = REPLACE(organizer_info, 'Apex', 'Joy')
      WHERE venue ILIKE '%Apex%' OR organizer_info ILIKE '%Apex%';
    `);
    console.log(`Updated ${r1.rowCount} seminars.`);

    // Update notifications
    const r2 = await db.query(`
      UPDATE notifications 
      SET title = REPLACE(title, 'Apex', 'Joy'),
          message = REPLACE(message, 'Apex', 'Joy')
      WHERE title ILIKE '%Apex%' OR message ILIKE '%Apex%';
    `);
    console.log(`Updated ${r2.rowCount} notifications.`);

    // Check users department
    const r3 = await db.query(`
      UPDATE users 
      SET department = REPLACE(department, 'Apex', 'Joy')
      WHERE department ILIKE '%Apex%';
    `);
    console.log(`Updated ${r3.rowCount} users.`);

    console.log('Database Joy University update complete!');
  } catch (err) {
    console.error('Error updating database:', err);
  } finally {
    await db.pool.end();
  }
}

updateDb();
