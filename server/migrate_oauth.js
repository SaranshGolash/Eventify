import pool from './db.js';

const migrateCallback = async () => {
  try {
    // 1. Add google_id column if it doesn't exist
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='google_id') THEN
          ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
        END IF;
      END
      $$;
    `);
    console.log('google_id column added or already exists');

    // 2. Add avatar column if it doesn't exist
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='avatar') THEN
          ALTER TABLE users ADD COLUMN avatar VARCHAR(255);
        END IF;
      END
      $$;
    `);
    console.log('avatar column added or already exists');
    
    // 3. Make password nullable
    await pool.query(`
      ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
    `);
    console.log('password column altered to be nullable');

  } catch (err) {
    console.error('Error running migration:', err);
  } finally {
    pool.end();
  }
};

migrateCallback();
