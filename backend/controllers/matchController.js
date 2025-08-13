const Match = require('../models/Match');
const mongoose = require('mongoose');

exports.createMatch = async (req, res) => {
  console.log('🏉 CREATE MATCH REQUEST RECEIVED - Updated with new fields');
  console.log('Body:', req.body);

  try {
    const match = new Match(req.body);
    const saved = await match.save();

    console.log('✅ SAVED:', saved);
    res.status(201).json(saved);
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    res.status(400).json({ message: 'Error creating match', error: err.message });
  }
};

exports.updateMatch = async (req, res) => {
  try {
    const updated = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Match not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Error updating match', error: err.message });
  }
};

exports.getMatches = async (req, res) => {
  console.log('🔍 GET MATCHES REQUEST');
  try {
    console.log('📊 Attempting to find matches...');
    const matches = await Match.find().sort({ date: 1 });
    console.log('✅ FOUND MATCHES:', matches.length);
    console.log('📋 Matches preview:', matches.map(m => ({
      id: m._id,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      date: m.date
    })));
    res.json(matches);
  } catch (err) {
    console.error('❌ GET MATCHES ERROR:', err.message);
    res.status(500).json({ message: 'Error fetching matches', error: err.message });
  }
};

exports.getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching match', error: err.message });
  }
};

exports.deleteMatch = async (req, res) => {
  console.log('🗑️ DELETE MATCH REQUEST');
  console.log('ID:', req.params.id);
  
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('❌ Invalid ObjectId format');
      return res.status(400).json({ message: 'Invalid match ID format' });
    }
    
    console.log('🔍 Attempting to find and delete match using findOneAndDelete...');
    
    // Using findOneAndDelete with explicit _id query
    const deleted = await Match.findOneAndDelete({ 
      _id: new mongoose.Types.ObjectId(req.params.id) 
    });
    
    if (!deleted) {
      console.log('❌ Match not found for deletion');
      return res.status(404).json({ message: 'Match not found' });
    }
    
    console.log('✅ MATCH DELETED using findOneAndDelete:', {
      id: deleted._id,
      homeTeam: deleted.homeTeam,
      awayTeam: deleted.awayTeam
    });
    
    res.json({ message: 'Match deleted successfully', deletedMatch: deleted });
  } catch (err) {
    console.error('❌ DELETE MATCH ERROR:', err.message);
    res.status(500).json({ message: 'Error deleting match', error: err.message });
  }
};