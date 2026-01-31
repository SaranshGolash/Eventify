import * as ResourceModel from '../models/ResourceModel.js';
import pool from '../db.js';
import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createResource = async (req, res) => {
  try {
    const name = req.body.name;
    const type = req.body.type;
    const capacity = parseInt(req.body.capacity) || 0;
    const description = req.body.description;
    const image_url = req.body.image_url || '';
    const price_per_hour = parseFloat(req.body.price_per_hour) || 0.00;

    // User request: let all the users add resources
    // if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
    //     return res.status(403).json({ message: 'Not authorized' });
    // }

    const newResource = await ResourceModel.createResource({ 
        name, type, capacity, description, image_url, price_per_hour 
    });
    res.status(201).json(newResource);
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ message: 'Failed to create resource', error: error.message });
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

export const fixSchema = async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`
        ALTER TABLE resources ADD COLUMN IF NOT EXISTS price_per_hour DECIMAL(10, 2) DEFAULT 0.00;
      `);
      await client.query(`
        ALTER TABLE resources ADD COLUMN IF NOT EXISTS image_url TEXT;
      `);
      await client.query(`
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';
      `);
      await client.query(`
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255);
      `);
      await client.query('COMMIT');
      res.json({ message: 'Schema fixed successfully' });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Manual schema fix failed:', error);
    res.status(500).json({ error: error.message });
  }
};
