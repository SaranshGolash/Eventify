import pool from './db.js';
import { fileURLToPath } from 'url';

export const updateSchema = async () => {
  // Use a separate client for transaction safety if needed, 
  // but existing pool usage is fine if we release correctly.
  // However, the original code used pool.connect() and client.query().
  
  let client; 
  try {
    console.log('Starting schema update for Resources and Bookings...');
    client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Ensure resources table exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS resources (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL,
          capacity INTEGER,
          description TEXT,
          status VARCHAR(20) DEFAULT 'available',
          image_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Add price_per_hour column if it doesn't exist
      await client.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='price_per_hour') THEN
                ALTER TABLE resources ADD COLUMN price_per_hour DECIMAL(10, 2) DEFAULT 0.00;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='image_url') THEN
                ALTER TABLE resources ADD COLUMN image_url TEXT;
            END IF;
        END
        $$;
      `);
      console.log('Updated resources table.');

      // 1.5 Ensure events table has new columns
      await client.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='registration_deadline') THEN
                ALTER TABLE events ADD COLUMN registration_deadline TIMESTAMP;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='submission_deadline') THEN
                ALTER TABLE events ADD COLUMN submission_deadline TIMESTAMP;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='rules') THEN
                ALTER TABLE events ADD COLUMN rules TEXT;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='banner_url') THEN
                ALTER TABLE events ADD COLUMN banner_url VARCHAR(500);
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='club_id') THEN
                ALTER TABLE events ADD COLUMN club_id INTEGER REFERENCES clubs(id);
            END IF;
        END
        $$;
      `);
      console.log('Updated events table.');


      // 2. Ensure bookings table exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS bookings (
          id SERIAL PRIMARY KEY,
          resource_id INTEGER REFERENCES resources(id),
          user_id INTEGER REFERENCES users(id),
          event_id INTEGER REFERENCES events(id),
          start_time TIMESTAMP NOT NULL,
          end_time TIMESTAMP NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          purpose TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Add payment_status and payment_intent_id columns if they don't exist
      await client.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='payment_status') THEN
                ALTER TABLE bookings ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending';
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='payment_intent_id') THEN
                ALTER TABLE bookings ADD COLUMN payment_intent_id VARCHAR(255);
            END IF;
        END
        $$;
      `);
      console.log('Updated bookings table.');

      await client.query('COMMIT');
      console.log('Schema update completed successfully.');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Schema update failed:', err);
    // Do not exit if called from index.js, but maybe throw so index.js knows?
    // For now, just log. index.js continues.
    if (process.argv[1] === fileURLToPath(import.meta.url)) {
       process.exit(1);
    }
  } finally {
    // Only close pool if running directly script, not if imported in app
    if (process.argv[1] === fileURLToPath(import.meta.url)) {
      pool.end();
    }
  }
};

// If run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  updateSchema();
}
