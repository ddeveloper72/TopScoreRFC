const Match = require('../models/Match');

exports.createMatch = async (req, res) => {
  console.log('🏉 CREATE MATCH REQUEST RECEIVED');
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
  try {
    const matches = await Match.find().sort({ date: 1 });
    res.json(matches);
  } catch (err) {
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
  try {
    const deleted = await Match.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Match not found' });
    res.json({ message: 'Match deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting match', error: err.message });
  }
};
