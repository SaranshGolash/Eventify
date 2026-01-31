import pool from './db.js';

const updateSchema = async () => {
  try {
    console.log('Starting schema update for Resources and Bookings...');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Ensure resources table exists and has price_per_hour
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


      // 2. Ensure bookings table exists and has payment columns
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
    process.exit(1);
  } finally {
    pool.end();
  }
};

updateSchema();
