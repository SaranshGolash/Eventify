import express from 'express';
import { 
  createClub, 
  getAllClubs, 
  getClub, 
  getClubMembers, 
  joinClub,
  getAnalytics
} from '../controllers/clubController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getAllClubs)
  .post(protect, createClub);

router.get('/analytics', getAnalytics); // Specific routes before :id

router.route('/:id')
  .get(getClub);

router.get('/:id/members', getClubMembers);
router.post('/:id/join', protect, joinClub);

export default router;
