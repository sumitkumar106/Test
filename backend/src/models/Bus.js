const mongoose = require('mongoose');

const stoppageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Stoppage name is required'],
    trim: true
  },
  arrival_time: {
    type: String,
    required: [true, 'Arrival time is required'],
    match: [/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i, 'Invalid time format. Use HH:MM AM/PM']
  },
  distance_km: {
    type: Number,
    required: [true, 'Distance is required'],
    min: [0, 'Distance must be positive']
  },
  sequence_order: {
    type: Number,
    required: [true, 'Sequence order is required'],
    min: 1
  },
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
}, { _id: false });

const busSchema = new mongoose.Schema({
  driver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Driver ID is required']
  },
  bus_name: {
    type: String,
    required: [true, 'Bus name is required'],
    trim: true,
    minlength: [2, 'Bus name must be at least 2 characters'],
    maxlength: [100, 'Bus name cannot exceed 100 characters']
  },
  bus_number: {
    type: String,
    required: [true, 'Bus number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  start_stand: {
    type: String,
    required: [true, 'Start stand is required'],
    trim: true,
    minlength: [2, 'Start stand must be at least 2 characters'],
    maxlength: [100, 'Start stand cannot exceed 100 characters']
  },
  end_stand: {
    type: String,
    required: [true, 'End stand is required'],
    trim: true,
    minlength: [2, 'End stand must be at least 2 characters'],
    maxlength: [100, 'End stand cannot exceed 100 characters']
  },
  start_time: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i, 'Invalid time format. Use HH:MM AM/PM']
  },
  end_time: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i, 'Invalid time format. Use HH:MM AM/PM']
  },
  run_days: {
    type: [String],
    required: [true, 'Run days are required'],
    validate: {
      validator: function(days) {
        const validDays = ['S', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
        return days.length > 0 && days.every(day => validDays.includes(day));
      },
      message: 'Invalid run days. Use: S, M, T, W, Th, F, Sa'
    }
  },
  stoppages: {
    type: [stoppageSchema],
    required: [true, 'At least one stoppage is required'],
    validate: {
      validator: function(stoppages) {
        return stoppages.length >= 1;
      },
      message: 'Add at least one stoppage'
    }
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for fast searches
busSchema.index({ driver_id: 1 });
busSchema.index({ bus_number: 1 }, { unique: true });
busSchema.index({ start_stand: 1, end_stand: 1 });
busSchema.index({ 'stoppages.name': 1 });

module.exports = mongoose.model('Bus', busSchema);
