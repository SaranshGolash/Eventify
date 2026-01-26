import * as EventModel from '../models/EventModel.js';

export const createEvent = async (req, res) => {
  try {
    const { title, start_time, end_time, location } = req.body;
    
    if (!title || !start_time || !end_time || !location) {
      return res.status(400).json({ message: 'Title, Start Time, End Time, and Location are required.' });
    }

    let banner_url = null;
    if (req.file) {
      // Create full URL (assuming server is on localhost:5000)
      banner_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const eventData = {
      ...req.body,
      organizer_id: req.user.id,
      banner_url: banner_url || req.body.banner_url || null
    };

    const newEvent = await EventModel.createEvent(eventData);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create event' });
  }
};

export const getEvents = async (req, res) => {
  try {
    const events = await EventModel.getAllEvents();
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
};

export const getEvent = async (req, res) => {
  try {
    const event = await EventModel.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const existingEvent = await EventModel.getEventById(req.params.id);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Allow Admin OR Organizer of the event
    if (existingEvent.organizer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const ALLOWED_FIELDS = [
      'title', 'description', 'start_time', 'end_time', 
      'location', 'budget', 'status', 'is_public', 'banner_url',
      'submission_deadline', 'rules'
    ];

    let updatedData = {};
    
    // Filter req.body to only allowed fields
    Object.keys(req.body).forEach(key => {
      if (ALLOWED_FIELDS.includes(key)) {
        updatedData[key] = req.body[key];
      }
    });

    if (req.file) {
      updatedData.banner_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const updatedEvent = await EventModel.updateEvent(req.params.id, updatedData);
    res.json(updatedEvent);
  } catch (error) {
    console.error('Update Event Error:', error);
    res.status(500).json({ message: 'Failed to update event', error: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const existingEvent = await EventModel.getEventById(req.params.id);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (existingEvent.organizer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await EventModel.deleteEvent(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete event' });
  }
};

export const registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    // Check if event exists
    const event = await EventModel.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if already registered
    const existingRegistration = await EventModel.checkRegistration(userId, eventId);
    if (existingRegistration) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    await EventModel.registerUserForEvent(userId, eventId);
    res.status(201).json({ message: 'Successfully registered for event' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

export const submitProjectHandler = async (req, res) => {
  try {
    const { project_link, description } = req.body;
    const submissionData = {
      event_id: req.params.id,
      user_id: req.user.id,
      project_link,
      description
    };
    const submission = await EventModel.submitProject(submissionData);
    res.status(201).json(submission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Submission failed' });
  }
};

export const getSubmissionsHandler = async (req, res) => {
  try {
    const event = await EventModel.getEventById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    // Access control: Organizer or Admin only? Or everyone?
    // User request said: "view submissions section leading to viewsubmissions page (available to everyone)"
    // So everyone can view submissions.
    
    const submissions = await EventModel.getSubmissions(req.params.id);
    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch submissions' });
  }
};

export const reportIssueHandler = async (req, res) => {
  try {
    const { title, description } = req.body;
    const reportData = {
      event_id: req.params.id,
      user_id: req.user.id,
      title,
      description
    };
    const report = await EventModel.reportIssue(reportData);
    res.status(201).json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Reporting failed' });
  }
};
