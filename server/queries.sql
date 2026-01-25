-- Users Table
-- Stores all user information. Role can be 'admin', 'organizer', 'participant'.
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'participant',
  department VARCHAR(100),
  year VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clubs / Committees Table
-- Represents student bodies or groups.
CREATE TABLE IF NOT EXISTS clubs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  email VARCHAR(255),
  logo_url TEXT,
  head_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Club Memberships
-- Links users to clubs.
CREATE TABLE IF NOT EXISTS club_members (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  club_id INTEGER REFERENCES clubs(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, club_id) 
);

-- Resources Table
-- Venues and equipment available for booking.
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

-- Events Table
-- The core entity.
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location VARCHAR(255),
  organizer_id INTEGER REFERENCES users(id),
  club_id INTEGER REFERENCES clubs(id),
  status VARCHAR(20) DEFAULT 'draft',
  is_public BOOLEAN DEFAULT TRUE,
  budget DECIMAL(10, 2) DEFAULT 0.00,
  banner_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event Collaborators
-- Handles multi-club collaborations.
CREATE TABLE IF NOT EXISTS event_collaborators (
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  club_id INTEGER REFERENCES clubs(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'partner',
  PRIMARY KEY (event_id, club_id)
);

-- Resource Bookings
-- Manages resource reservations for events.
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

-- =============================================
-- 2. Sample Data Insertion (Seed)
-- =============================================

-- Insert Admin User (Password needs to be hashed in real app)
-- INSERT INTO users (name, email, password, role) VALUES ('Admin User', 'admin@eventify.com', '$2a$10$hashedpassword', 'admin');

-- Insert Sample Club
-- INSERT INTO clubs (name, description, email) VALUES ('Tech Club', 'The coding society', 'tech@college.edu');

-- Insert Sample Resource
-- INSERT INTO resources (name, type, capacity) VALUES ('Main Auditorium', 'venue', 500);

-- =============================================
-- 3. Common Queries
-- =============================================

-- Get all events with club info
-- SELECT e.*, c.name as club_name 
-- FROM events e 
-- LEFT JOIN clubs c ON e.club_id = c.id
-- WHERE e.status = 'approved' AND e.start_time > NOW()
-- ORDER BY e.start_time ASC;

-- Check resource availability
-- SELECT * FROM bookings 
-- WHERE resource_id = $1 
-- AND status = 'confirmed' 
-- AND (
--   (start_time <= $2 AND end_time > $2) OR
--   (start_time < $3 AND end_time >= $3) OR
--   (start_time >= $2 AND end_time <= $3)
-- );

-- Get user's club memberships
-- SELECT c.*, cm.role as member_role 
-- FROM clubs c 
-- JOIN club_members cm ON c.id = cm.club_id 
-- WHERE cm.user_id = $1;

-- Analytics: Count events per club
-- SELECT c.name, COUNT(e.id) as event_count 
-- FROM clubs c 
-- LEFT JOIN events e ON c.id = e.club_id 
-- GROUP BY c.id;

