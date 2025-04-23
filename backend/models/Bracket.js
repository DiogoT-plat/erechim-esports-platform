const mongoose = require('mongoose');

const BracketSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  game: {
    type: String,
    enum: ['CS2', 'LOL', 'Valorant', 'TFT'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['single_elimination', 'double_elimination', 'round_robin', 'groups'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed'],
    default: 'pending'
  },
  rounds: [{
    roundNumber: Number,
    matches: [{
      matchNumber: Number,
      participant1: {
        type: {
          type: String,
          enum: ['team', 'player'],
          required: true
        },
        id: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: 'rounds.matches.participant1.type',
          required: true
        },
        score: {
          type: Number,
          default: 0
        }
      },
      participant2: {
        type: {
          type: String,
          enum: ['team', 'player'],
          required: true
        },
        id: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: 'rounds.matches.participant2.type',
          required: true
        },
        score: {
          type: Number,
          default: 0
        }
      },
      winner: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'rounds.matches.winnerType'
      },
      winnerType: {
        type: String,
        enum: ['Team', 'Player']
      },
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending'
      },
      scheduledTime: Date,
      result: {
        submittedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        submittedAt: Date,
        notes: String
      }
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Bracket', BracketSchema);
