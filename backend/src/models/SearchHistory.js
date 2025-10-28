const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Nullable for guest users
  },
  from_stand: {
    type: String,
    required: [true, 'From stand is required'],
    trim: true
  },
  to_stand: {
    type: String,
    required: [true, 'To stand is required'],
    trim: true
  },
  searched_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'searched_at', updatedAt: false }
});

// Index for fast user search history retrieval
searchHistorySchema.index({ user_id: 1, searched_at: -1 });

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
