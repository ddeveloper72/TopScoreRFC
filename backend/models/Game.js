const mongoose = require('mongoose');

// Game Data Schema - matches your existing GameData interface
const gameSchema = new mongoose.Schema({
  homeTeam: {
    name: { type: String, required: true },
    score: { type: Number, default: 0 }
  },
  awayTeam: {
    name: { type: String, required: true },
    score: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active'
  },
  gameTime: {
    type: String,
    default: '00:00'
  },
  scoreHistory: [{
    team: { type: String, enum: ['home', 'away'], required: true },
    points: { type: Number, required: true },
    type: {
      type: String,
      enum: ['Try', 'Conversion', 'Penalty', 'Drop Goal', 'Penalty Try'],
      required: true
    },
    timestamp: { type: Date, default: Date.now },
    gameTime: { type: String, required: true }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
gameSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Add indexes for better query performance
gameSchema.index({ createdAt: -1 });
gameSchema.index({ status: 1 });
gameSchema.index({ 'homeTeam.name': 1, 'awayTeam.name': 1 });

module.exports = mongoose.model('Game', gameSchema);
