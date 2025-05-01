const mongoose = require('mongoose');

const PasswordResetTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 3600000) // 1 hour from now
  }
});

// Create index for token
PasswordResetTokenSchema.index({ token: 1 });

// Create index for expiration
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PasswordResetToken', PasswordResetTokenSchema); 