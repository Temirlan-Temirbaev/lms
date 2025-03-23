const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    telephone: {
      type: String,
      required: [true, 'Please add a telephone number'],
    },
    gender: {
      type: String,
      required: [true, 'Please select your gender'],
      enum: ['male', 'female', 'other'],
    },
    age: {
      type: Number,
      required: [true, 'Please add your age'],
      min: [1, 'Age must be at least 1'],
      max: [120, 'Age cannot exceed 120'],
    },
    progress: {
      currentLevel: {
        type: String,
        enum: ['A1', 'A2', 'B1', 'B2'],
        default: 'A1',
      },
      availableLevels: {
        type: [String],
        enum: ['A1', 'A2', 'B1', 'B2'],
        default: ['A1'],
      },
      completedLessons: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Lesson',
        },
      ],
      completedTests: [
        {
          testId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Test',
          },
          score: {
            type: Number,
            default: 0,
          },
          completedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      placementTestTaken: {
        type: Boolean,
        default: false,
      },
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema); 