import pool from './db.js';
import bcrypt from 'bcryptjs';

const testInsert = async () => {
  try {
    const name = 'Test User';
    const email = 'test' + Date.now() + '@example.com';
    const password = 'password123';
    const role = 'participant';

    console.log('Attempting to connect and insert user...');
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at;
    `;
    const values = [name, email, hashedPassword, role];
    
    const result = await pool.query(query, values);
    console.log('Success! User inserted:', result.rows[0]);
    
  } catch (err) {
    console.error('FAILED:', err);
  } finally {
    pool.end();
  }
};

testInsert();
