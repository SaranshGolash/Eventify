import pool from './db.js';
import bcrypt from 'bcryptjs';

const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');
    
    // 1. Create Users Table if not exists
    // We include OAuth fields directly here for new tables
    const userTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        role VARCHAR(50) DEFAULT 'participant',
        google_id VARCHAR(255) UNIQUE,
        avatar VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(userTableQuery);
    console.log('Users table check complete.');

    // 1.5 Create Events Table if not exists
    const eventsTableQuery = `
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        location VARCHAR(255) NOT NULL,
        organizer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        budget VARCHAR(100),
        status VARCHAR(50) DEFAULT 'upcoming',
        is_public BOOLEAN DEFAULT true,
        banner_url VARCHAR(500),
        submission_deadline TIMESTAMP,
        rules TEXT,
        registration_deadline TIMESTAMP
      );
    `;
    await pool.query(eventsTableQuery);
    console.log('Events table check complete.');
    
    // Create other dependent tables (registrations, submissions, issues)
    await pool.query(`
        CREATE TABLE IF NOT EXISTS registrations (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
            registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, event_id)
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS submissions (
            id SERIAL PRIMARY KEY,
            event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            project_link VARCHAR(500) NOT NULL,
            description TEXT,
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS issues (
            id SERIAL PRIMARY KEY,
            event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            status VARCHAR(50) DEFAULT 'open',
            reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // 2. Safe-guard Migrations (in case table existed but columns didn't)
    // Add google_id if missing
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='google_id') THEN
          ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
        END IF;
      END
      $$;
    `);

    // Add avatar if missing
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='avatar') THEN
          ALTER TABLE users ADD COLUMN avatar VARCHAR(255);
        END IF;
      END
      $$;
    `);
    
    // Ensure password is nullable
    await pool.query(`
      ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
    `);

    // 3. Create Admin if not exists
    const adminCheck = await pool.query("SELECT * FROM users WHERE role = 'admin'");
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
        ['System Admin', 'admin@eventify.com', hashedPassword, 'admin']
      );
      console.log('Default admin created');
    }

    console.log('Database initialization successful.');
  } catch (err) {
    console.error('Error initializing database:', err);
    // Continue execution even if this fails, so valid requests might still work
  }
};

export default initializeDatabase;
