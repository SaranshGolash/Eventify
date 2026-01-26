import pool from './db.js';

const migrate = async () => {
  try {
    console.log('Starting migration...');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Add submission_deadline column
      await client.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='submission_deadline') THEN
                ALTER TABLE events ADD COLUMN submission_deadline TIMESTAMP;
            END IF;
        END
        $$;
      `);
      console.log('Added submission_deadline column.');

      // Add rules column
      await client.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='rules') THEN
                ALTER TABLE events ADD COLUMN rules TEXT;
            END IF;
        END
        $$;
      `);
      console.log('Added rules column.');

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
