import pool from '../db.js';

export const createUser = async (name, email, password, role = 'participant', googleId = null, avatar = null) => {
  const query = `
    INSERT INTO users (name, email, password, role, google_id, avatar)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, name, email, role, created_at, avatar;
  `;
  const values = [name, email, password, role, googleId, avatar];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

export const findUserById = async (id) => {
  const query = 'SELECT id, name, email, role, created_at FROM users WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};
