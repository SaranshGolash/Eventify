import pool from '../db.js';

export const createEvent = async (eventData) => {
  const {
    title,
    description,
    start_time,
    end_time,
    location,
    organizer_id,
    club_id,
    budget,
    banner_url,
  } = eventData;

  const query = `
    INSERT INTO events (
      title, description, start_time, end_time, location, 
      organizer_id, club_id, budget, banner_url
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `;
  
  const values = [
    title, description, start_time, end_time, location,
    organizer_id, club_id, budget || 0.00, banner_url
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const getAllEvents = async () => {
  // Join with clubs to get club name if available
  const query = `
    SELECT e.*, c.name as club_name, u.name as organizer_name
    FROM events e
    LEFT JOIN clubs c ON e.club_id = c.id
    LEFT JOIN users u ON e.organizer_id = u.id
    ORDER BY e.start_time ASC;
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const getEventById = async (id) => {
  const query = `
    SELECT e.*, c.name as club_name, u.name as organizer_name
    FROM events e
    LEFT JOIN clubs c ON e.club_id = c.id
    LEFT JOIN users u ON e.organizer_id = u.id
    WHERE e.id = $1;
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

export const updateEvent = async (id, eventData) => {
  const fields = Object.keys(eventData);
  const values = Object.values(eventData);
  
  if (fields.length === 0) return null;

  const setString = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
  
  const query = `
    UPDATE events
    SET ${setString}
    WHERE id = $${fields.length + 1}
    RETURNING *;
  `;

  const result = await pool.query(query, [...values, id]);
  return result.rows[0];
};

export const deleteEvent = async (id) => {
  const query = 'DELETE FROM events WHERE id = $1 RETURNING id;';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};
