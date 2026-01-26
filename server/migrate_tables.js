import pool from './db.js';

const migrate = async () => {
  try {
    console.log('Starting migration for tables...');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create submissions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS submissions (
          id SERIAL PRIMARY KEY,
          event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          project_link TEXT,
          description TEXT,
          submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(event_id, user_id)
        );
      `);
      console.log('Created submissions table.');

      // Create reports table
      await client.query(`
        CREATE TABLE IF NOT EXISTS reports (
          id SERIAL PRIMARY KEY,
          event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255),
          description TEXT,
          status VARCHAR(20) DEFAULT 'open',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Created reports table.');

      await client.query('COMMIT');
      console.log('Migration completed successfully.');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    pool.end();
  }
};

migrate();
