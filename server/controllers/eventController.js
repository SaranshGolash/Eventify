import * as EventModel from '../models/EventModel.js';

export const createEvent = async (req, res) => {
  try {
    const { title, start_time, end_time, location } = req.body;
    
    if (!title || !start_time || !end_time || !location) {
      return res.status(400).json({ message: 'Title, Start Time, End Time, and Location are required.' });
    }

    const eventData = {
      ...req.body,
      organizer_id: req.user.id
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
    
    // Check if user is registered if logged in? 
    // Usually this is done in a separate endpoint or added to response if auth is passed.
    // simpler to have a separate call or simple check.
    
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

    const updatedEvent = await EventModel.updateEvent(req.params.id, req.body);
    res.json(updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update event' });
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
