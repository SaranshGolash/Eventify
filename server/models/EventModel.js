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
    submission_deadline,
    rules,
  } = eventData;

  const query = `
    INSERT INTO events (
      title, description, start_time, end_time, location, 
      organizer_id, club_id, budget, banner_url, submission_deadline, rules
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *;
  `;
  
  const values = [
    title, description, start_time, end_time, location,
    organizer_id, club_id, budget || 0.00, banner_url,
    submission_deadline || null, rules || null
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const getAllEvents = async () => {
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

export const registerUserForEvent = async (userId, eventId) => {
  const query = `
    INSERT INTO event_registrations (user_id, event_id)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const result = await pool.query(query, [userId, eventId]);
  return result.rows[0];
};

export const checkRegistration = async (userId, eventId) => {
  const query = 'SELECT * FROM event_registrations WHERE user_id = $1 AND event_id = $2';
  const result = await pool.query(query, [userId, eventId]);
  return result.rows[0];
};

export const submitProject = async (submissionData) => {
  const { event_id, user_id, project_link, description } = submissionData;
  const query = `
    INSERT INTO submissions (event_id, user_id, project_link, description)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (event_id, user_id) 
    DO UPDATE SET project_link = $3, description = $4, submitted_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;
  const result = await pool.query(query, [event_id, user_id, project_link, description]);
  return result.rows[0];
};

export const getSubmissions = async (eventId) => {
  const query = `
    SELECT s.*, u.name as user_name, u.email as user_email
    FROM submissions s
    JOIN users u ON s.user_id = u.id
    WHERE s.event_id = $1
    ORDER BY s.submitted_at DESC;
  `;
  const result = await pool.query(query, [eventId]);
  return result.rows;
};

export const reportIssue = async (reportData) => {
  const { event_id, user_id, title, description } = reportData;
  const query = `
    INSERT INTO reports (event_id, user_id, title, description)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const result = await pool.query(query, [event_id, user_id, title, description]);
  return result.rows[0];
};
