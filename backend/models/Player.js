const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  nickname: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  cpf: {
    type: String,
    required: true,
    trim: true
  },
  game: {
    type: String,
    enum: ['CS2', 'LOL', 'Valorant', 'TFT'],
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: function() { return this.game !== 'TFT'; }
  },
  // Campos específicos para CS2
  steamId: {
    type: String,
    required: function() { return this.game === 'CS2'; },
    trim: true
  },
  gamersClubId: {
    type: String,
    required: function() { return this.game === 'CS2'; },
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Player', PlayerSchema);
