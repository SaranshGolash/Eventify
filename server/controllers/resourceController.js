import * as ResourceModel from '../models/ResourceModel.js';
import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createResource = async (req, res) => {
  try {
    const { name, type, capacity, description, image_url, price_per_hour } = req.body;
    // User request: let all the users add resources
    // if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
    //     return res.status(403).json({ message: 'Not authorized' });
    // }

    const newResource = await ResourceModel.createResource({ 
        name, type, capacity, description, image_url, price_per_hour 
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
        purpose,
        payment_status: 'pending' // Default
    });
    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to book resource' });
  }
};

export const createCheckoutSession = async (req, res) => {
  try {
    const { resource, bookingDetails } = req.body;
    
    // Calculate duration in hours
    const start = new Date(bookingDetails.start_time);
    const end = new Date(bookingDetails.end_time);
    const durationHours = Math.abs(end - start) / 36e5;
    
    // Calculate total amount (cent multiplier)
    const unitAmount = Math.round(resource.price_per_hour * 100); 

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd', // Adjust as needed
            product_data: {
              name: `Booking: ${resource.name}`,
              description: `Booking from ${start.toLocaleString()} to ${end.toLocaleString()}`,
              images: resource.image_url ? [resource.image_url] : [],
            },
            unit_amount: unitAmount,
          },
          quantity: Math.ceil(durationHours),
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/resources?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/resources?canceled=true`,
      metadata: {
        resource_id: resource.id,
        user_id: req.user.id,
        start_time: bookingDetails.start_time,
        end_time: bookingDetails.end_time,
        purpose: bookingDetails.purpose
      }
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};
