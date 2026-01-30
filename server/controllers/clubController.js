import * as ClubModel from '../models/ClubModel.js';

export const createClub = async (req, res) => {
  try {
    const { name, description, email, logo_url } = req.body;
    const newClub = await ClubModel.createClub({ 
        name, 
        description, 
        email, 
        logo_url, 
        head_id: req.user.id // Assign creator as head
    });
    // Also add them as a member with role 'admin' or 'head'
    await ClubModel.joinClub(req.user.id, newClub.id, 'head');
    
    res.status(201).json(newClub);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create club' });
  }
};

export const getAllClubs = async (req, res) => {
  try {
    const clubs = await ClubModel.getAllClubs();
    res.json(clubs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch clubs' });
  }
};

export const getClub = async (req, res) => {
  try {
    const club = await ClubModel.getClubById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    res.json(club);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch club' });
  }
};

export const getClubMembers = async (req, res) => {
  try {
    const members = await ClubModel.getClubMembers(req.params.id);
    res.json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch members' });
  }
};

export const joinClub = async (req, res) => {
  try {
    const { role } = req.body; // optional
    const result = await ClubModel.joinClub(req.user.id, req.params.id, role);
    res.status(201).json(result);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
        return res.status(400).json({ message: 'Already a member' });
    }
    console.error(error);
    res.status(500).json({ message: 'Failed to join club' });
  }
};

export const getAnalytics = async (req, res) => {
    try {
        const stats = await ClubModel.getClubAnalytics();
        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch analytics' });
    }
}
