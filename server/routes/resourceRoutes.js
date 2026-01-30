import express from 'express';
import { 
  createResource, 
  getAllResources, 
  checkAvailability, 
  bookResource,
  createCheckoutSession
} from '../controllers/resourceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getAllResources)
  .post(protect, createResource);

router.get('/:id/availability', checkAvailability);
router.post('/book', protect, bookResource);
router.post('/create-checkout-session', protect, createCheckoutSession);

export default router;
