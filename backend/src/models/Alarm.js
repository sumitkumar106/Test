const mongoose = require('mongoose');

const alarmSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  bus_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: [true, 'Bus ID is required']
  },
  stoppage_name: {
    type: String,
    required: [true, 'Stoppage name is required'],
    trim: true
  },
  minutes_before: {
    type: Number,
    required: [true, 'Minutes before is required'],
    enum: {
      values: [10, 20, 30],
      message: 'Minutes before must be 10, 20, or 30'
    }
  },
  is_active: {
    type: Boolean,
    default: true
  },
  triggered_at: {
    type: Date,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

// Indexes
alarmSchema.index({ user_id: 1, is_active: 1 });
alarmSchema.index({ bus_id: 1, stoppage_name: 1 });
alarmSchema.index({ created_at: 1 }, { expireAfterSeconds: 604800 }); // TTL: 7 days

module.exports = mongoose.model('Alarm', alarmSchema);
