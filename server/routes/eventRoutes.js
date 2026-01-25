import express from 'express';
import { 
  createEvent, 
  getEvents, 
  getEvent, 
  updateEvent, 
  deleteEvent,
  registerForEvent
} from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';

import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getEvents)
  .post(protect, upload.single('image'), createEvent);

router.route('/:id')
  .get(getEvent)
  .put(protect, upload.single('image'), updateEvent)
  .delete(protect, deleteEvent);

router.post('/:id/register', protect, registerForEvent);

export default router;
