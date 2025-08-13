const mongoose = require('mongoose');

// MatchEvent subdocument schema for CRUD operations on individual events
const matchEventSchema = new mongoose.Schema({
  time: {
    type: String,
    required: true,
    match: /^[0-9]{1,2}:[0-5][0-9]$/ // Format: "15:30" (minute:second)
  },
  period: {
    type: String,
    enum: ['first', 'second', 'extra'],
    required: true
  },
  eventType: {
    type: String,
    enum: ['try', 'conversion', 'penalty', 'drop_goal', 'injury', 'card', 'substitution', 'other'],
    required: true
  },
  team: {
    type: String,
    enum: ['home', 'away'],
    required: true
  },
  ourPlayer: {
    type: String,
    required: false // Focus on OUR team's player performance
  },
  description: {
    type: String,
    required: true,
    maxlength: 500 // Reasonable limit for event descriptions
  },
  pointsSnapshot: {
    type: Number,
    required: false // Current match score when event occurred
  },
  notes: {
    type: String,
    required: false,
    maxlength: 1000 // Additional context, editable for careful wording
  }
}, {
  timestamps: true // Provides createdAt and updatedAt for audit trail
});

const matchSchema = new mongoose.Schema({
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  date: { type: Date, required: true },
  venue: { type: String, required: true },
  venueDetails: {
    name: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
    placeId: String,
    formattedAddress: String,
  },
  competition: { type: String },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  homeScore: { type: Number, default: 0 },
  awayScore: { type: Number, default: 0 },

  // New match type and team categorization fields
  matchType: {
    type: String,
    enum: ['boys', 'girls', 'mixed'],
    required: false
  },
  homeTeamCategory: {
    type: String,
    enum: ['minis', 'youths-boys', 'girls', 'seniors', 'womens-tag'],
    required: false
  },
  homeTeamAgeLevel: {
    type: String,
    required: false
  },
  awayTeamAgeLevel: {
    type: String,
    required: false
  },

  // Match Events - CRUD-enabled event logging system
  events: [matchEventSchema], // Array of match events for detailed game tracking

}, { timestamps: true });

matchSchema.index({ date: 1 });
matchSchema.index({ status: 1 });

module.exports = mongoose.model('Match', matchSchema);
