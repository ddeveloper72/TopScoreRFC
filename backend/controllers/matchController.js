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

// ===============================================
// MATCH EVENTS CRUD OPERATIONS
// ===============================================

// Add new event to a match
exports.addMatchEvent = async (req, res) => {
  console.log('📝 ADD MATCH EVENT REQUEST');
  console.log('Match ID:', req.params.id);
  console.log('Event data:', req.body);

  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('❌ Invalid ObjectId format');
      return res.status(400).json({ message: 'Invalid match ID format' });
    }

    const match = await Match.findById(req.params.id);
    if (!match) {
      console.log('❌ Match not found');
      return res.status(404).json({ message: 'Match not found' });
    }

    // Add the event to the match's events array
    match.events.push(req.body);
    const savedMatch = await match.save();

    // Get the newly created event (last one in array)
    const newEvent = savedMatch.events[savedMatch.events.length - 1];
    
    console.log('✅ EVENT ADDED:', newEvent);
    res.status(201).json({
      message: 'Event added successfully',
      event: newEvent,
      matchId: match._id
    });

  } catch (err) {
    console.error('❌ ADD EVENT ERROR:', err.message);
    res.status(400).json({ message: 'Error adding event', error: err.message });
  }
};

// Update an existing event
exports.updateMatchEvent = async (req, res) => {
  console.log('✏️ UPDATE MATCH EVENT REQUEST');
  console.log('Match ID:', req.params.id);
  console.log('Event ID:', req.params.eventId);
  console.log('Update data:', req.body);

  try {
    // Validate ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(req.params.eventId)) {
      console.log('❌ Invalid ObjectId format');
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const match = await Match.findById(req.params.id);
    if (!match) {
      console.log('❌ Match not found');
      return res.status(404).json({ message: 'Match not found' });
    }

    // Find the event by ID
    const eventIndex = match.events.findIndex(event => event._id.toString() === req.params.eventId);
    if (eventIndex === -1) {
      console.log('❌ Event not found');
      return res.status(404).json({ message: 'Event not found' });
    }

    // Update the event with new data
    Object.assign(match.events[eventIndex], req.body);
    const savedMatch = await match.save();

    console.log('✅ EVENT UPDATED:', savedMatch.events[eventIndex]);
    res.json({
      message: 'Event updated successfully',
      event: savedMatch.events[eventIndex],
      matchId: match._id
    });

  } catch (err) {
    console.error('❌ UPDATE EVENT ERROR:', err.message);
    res.status(400).json({ message: 'Error updating event', error: err.message });
  }
};

// Delete an event from a match
exports.deleteMatchEvent = async (req, res) => {
  console.log('🗑️ DELETE MATCH EVENT REQUEST');
  console.log('Match ID:', req.params.id);
  console.log('Event ID:', req.params.eventId);

  try {
    // Validate ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(req.params.eventId)) {
      console.log('❌ Invalid ObjectId format');
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const match = await Match.findById(req.params.id);
    if (!match) {
      console.log('❌ Match not found');
      return res.status(404).json({ message: 'Match not found' });
    }

    // Find and remove the event
    const eventIndex = match.events.findIndex(event => event._id.toString() === req.params.eventId);
    if (eventIndex === -1) {
      console.log('❌ Event not found');
      return res.status(404).json({ message: 'Event not found' });
    }

    const deletedEvent = match.events[eventIndex];
    match.events.splice(eventIndex, 1);
    await match.save();

    console.log('✅ EVENT DELETED:', deletedEvent);
    res.json({
      message: 'Event deleted successfully',
      deletedEvent: deletedEvent,
      matchId: match._id
    });

  } catch (err) {
    console.error('❌ DELETE EVENT ERROR:', err.message);
    res.status(500).json({ message: 'Error deleting event', error: err.message });
  }
};

// Get all events for a match
exports.getMatchEvents = async (req, res) => {
  console.log('📋 GET MATCH EVENTS REQUEST');
  console.log('Match ID:', req.params.id);

  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('❌ Invalid ObjectId format');
      return res.status(400).json({ message: 'Invalid match ID format' });
    }

    const match = await Match.findById(req.params.id);
    if (!match) {
      console.log('❌ Match not found');
      return res.status(404).json({ message: 'Match not found' });
    }

    console.log('✅ EVENTS FOUND:', match.events.length);
    res.json({
      matchId: match._id,
      events: match.events,
      eventCount: match.events.length
    });

  } catch (err) {
    console.error('❌ GET EVENTS ERROR:', err.message);
    res.status(500).json({ message: 'Error fetching events', error: err.message });
  }
};
