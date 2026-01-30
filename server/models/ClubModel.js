import pool from '../db.js';

export const createClub = async (clubData) => {
  const { name, description, email, logo_url, head_id } = clubData;
  const result = await pool.query(
    'INSERT INTO clubs (name, description, email, logo_url, head_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [name, description, email, logo_url, head_id]
  );
  return result.rows[0];
};

export const getAllClubs = async () => {
  const result = await pool.query('SELECT * FROM clubs ORDER BY name ASC');
  return result.rows;
};

export const getClubById = async (id) => {
  const result = await pool.query('SELECT * FROM clubs WHERE id = $1', [id]);
  return result.rows[0];
};

export const getClubMembers = async (clubId) => {
  const query = `
    SELECT c.*, cm.role as member_role, u.name as user_name, u.email as user_email
    FROM clubs c 
    JOIN club_members cm ON c.id = cm.club_id 
    JOIN users u ON cm.user_id = u.id
    WHERE cm.club_id = $1
  `;
  const result = await pool.query(query, [clubId]);
  return result.rows;
};

export const joinClub = async (userId, clubId, role = 'member') => {
  const result = await pool.query(
    'INSERT INTO club_members (user_id, club_id, role) VALUES ($1, $2, $3) RETURNING *',
    [userId, clubId, role]
  );
  return result.rows[0];
};

export const getClubAnalytics = async () => {
  const query = `
    SELECT c.name, COUNT(e.id) as event_count 
    FROM clubs c 
    LEFT JOIN events e ON c.id = e.club_id 
    GROUP BY c.id
  `;
  const result = await pool.query(query);
  return result.rows;
};
