import express from 'express';
import { 
  createResource, 
  getAllResources, 
  checkAvailability, 
  bookResource 
} from '../controllers/resourceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getAllResources)
  .post(protect, createResource);

router.get('/:id/availability', checkAvailability);
router.post('/book', protect, bookResource);

export default router;
