import * as ResourceModel from '../models/ResourceModel.js';

export const createResource = async (req, res) => {
  try {
    const { name, type, capacity, description, image_url } = req.body;
    // Only admin usually? For now let authenticated users create resources (or restrict later)
    if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
        return res.status(403).json({ message: 'Not authorized' });
    }

    const newResource = await ResourceModel.createResource({ 
        name, type, capacity, description, image_url 
    });
    res.status(201).json(newResource);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create resource' });
  }
};

export const getAllResources = async (req, res) => {
  try {
    const resources = await ResourceModel.getAllResources();
    res.json(resources);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch resources' });
  }
};

export const checkAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { start_time, end_time } = req.query;

    if (!start_time || !end_time) {
        return res.status(400).json({ message: 'Start and end time required' });
    }

    const isAvailable = await ResourceModel.checkAvailability(id, start_time, end_time);
    res.json({ available: isAvailable });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to check availability' });
  }
};

export const bookResource = async (req, res) => {
  try {
    const { resource_id, event_id, start_time, end_time, purpose } = req.body;
    
    // Check availability first
    const isAvailable = await ResourceModel.checkAvailability(resource_id, start_time, end_time);
    if (!isAvailable) {
        return res.status(400).json({ message: 'Resource is not available at this time' });
    }

    const booking = await ResourceModel.createBooking({
        resource_id,
        user_id: req.user.id,
        event_id,
        start_time,
        end_time,
        purpose
    });
    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to book resource' });
  }
};
