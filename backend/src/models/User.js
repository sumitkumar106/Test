const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  password_hash: {
    type: String,
    required: [true, 'Password is required']
  },
  role: {
    type: String,
    enum: ['passenger', 'driver'],
    default: 'passenger'
  },
  fcm_token: {
    type: String,
    default: null
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

// Index for faster email lookups
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

// Don't return password in queries by default
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password_hash;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
