import * as EventModel from '../models/EventModel.js';

export const createEvent = async (req, res) => {
  try {
    const { title, start_time, end_time, location } = req.body;
    
    // Basic Validation
    if (!title || !start_time || !end_time || !location) {
      return res.status(400).json({ message: 'Title, Start Time, End Time, and Location are required.' });
    }

    const eventData = {
      ...req.body,
      organizer_id: req.user.id // From auth middleware
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
    // Check ownership or admin status before updating
    const existingEvent = await EventModel.getEventById(req.params.id);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

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
    // Check ownership or admin status before deleting
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
