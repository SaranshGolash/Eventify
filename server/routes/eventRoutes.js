import express from 'express';
import { 
  createEvent, 
  getEvents, 
  getEvent, 
  updateEvent, 
  deleteEvent,

  registerForEvent,
  unregisterForEvent,
  submitProjectHandler,
  getSubmissionsHandler,
  reportIssueHandler
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

// Register
router.post('/:id/register', protect, registerForEvent);
// Unregister
router.delete('/:id/register', protect, unregisterForEvent);

// New Routes


router.post('/:id/submit', protect, submitProjectHandler);
router.get('/:id/submissions', getSubmissionsHandler); // Public as per request "available to everyone"
router.post('/:id/report', protect, reportIssueHandler);

export default router;
