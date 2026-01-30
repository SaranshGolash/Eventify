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

    // 3. Create Clubs Table
    const clubsTableQuery = `
      CREATE TABLE IF NOT EXISTS clubs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        email VARCHAR(255),
        logo_url TEXT,
        head_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(clubsTableQuery);
    console.log('Clubs table check complete.');

    // 4. Create Club Members Table
    const clubMembersTableQuery = `
      CREATE TABLE IF NOT EXISTS club_members (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        club_id INTEGER REFERENCES clubs(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, club_id) 
      );
    `;
    await pool.query(clubMembersTableQuery);
    console.log('Club Members table check complete.');

    // 5. Create Resources Table
    const resourcesTableQuery = `
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
    `;
    await pool.query(resourcesTableQuery);
    console.log('Resources table check complete.');

    // 6. Create Event Collaborators Table
    const eventCollaboratorsTableQuery = `
      CREATE TABLE IF NOT EXISTS event_collaborators (
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        club_id INTEGER REFERENCES clubs(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'partner',
        PRIMARY KEY (event_id, club_id)
      );
    `;
    await pool.query(eventCollaboratorsTableQuery);
    console.log('Event Collaborators table check complete.');

    // 7. Create Resource Bookings Table
    const bookingsTableQuery = `
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
    `;
    await pool.query(bookingsTableQuery);
    console.log('Bookings table check complete.');

    // 8. Add club_id to events if not exists
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='club_id') THEN
          ALTER TABLE events ADD COLUMN club_id INTEGER REFERENCES clubs(id);
        END IF;
      END
      $$;
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
