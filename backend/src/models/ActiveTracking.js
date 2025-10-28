const mongoose = require('mongoose');

const activeTrackingSchema = new mongoose.Schema({
  bus_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: [true, 'Bus ID is required']
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  current_location: {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Invalid latitude'],
      max: [90, 'Invalid latitude']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Invalid longitude'],
      max: [180, 'Invalid longitude']
    }
  },
  last_updated: {
    type: Date,
    default: Date.now
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

// Indexes for fast queries
activeTrackingSchema.index({ bus_id: 1, is_active: 1 });
activeTrackingSchema.index({ user_id: 1 });
activeTrackingSchema.index({ last_updated: 1 }, { expireAfterSeconds: 86400 }); // TTL: 24 hours

// Update last_updated on every save
activeTrackingSchema.pre('save', function(next) {
  this.last_updated = new Date();
  next();
});

module.exports = mongoose.model('ActiveTracking', activeTrackingSchema);
