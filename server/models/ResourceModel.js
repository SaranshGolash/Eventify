import pool from '../db.js';

export const createResource = async (resourceData) => {
  const { name, type, capacity, description, image_url } = resourceData;
  const result = await pool.query(
    'INSERT INTO resources (name, type, capacity, description, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [name, type, capacity, description, image_url]
  );
  return result.rows[0];
};

export const getAllResources = async () => {
  const result = await pool.query('SELECT * FROM resources ORDER BY name ASC');
  return result.rows;
};

export const getResourceById = async (id) => {
  const result = await pool.query('SELECT * FROM resources WHERE id = $1', [id]);
  return result.rows[0];
};

export const createBooking = async (bookingData) => {
  const { resource_id, user_id, event_id, start_time, end_time, purpose } = bookingData;
  const result = await pool.query(
    'INSERT INTO bookings (resource_id, user_id, event_id, start_time, end_time, purpose) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [resource_id, user_id, event_id, start_time, end_time, purpose]
  );
  return result.rows[0];
};

export const checkAvailability = async (resourceId, startTime, endTime) => {
  const query = `
    SELECT * FROM bookings 
    WHERE resource_id = $1 
    AND status = 'confirmed' 
    AND (
      (start_time <= $2 AND end_time > $2) OR
      (start_time < $3 AND end_time >= $3) OR
      (start_time >= $2 AND end_time <= $3)
    )
  `;
  const result = await pool.query(query, [resourceId, startTime, endTime]);
  return result.rows.length === 0; // True if available (no conflicts)
};

export const getBookingsForResource = async (resourceId) => {
    const result = await pool.query('SELECT * FROM bookings WHERE resource_id = $1', [resourceId]);
    return result.rows;
};
