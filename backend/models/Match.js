const mongoose = require('mongoose');

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
}, { timestamps: true });

matchSchema.index({ date: 1 });
matchSchema.index({ status: 1 });

module.exports = mongoose.model('Match', matchSchema);
