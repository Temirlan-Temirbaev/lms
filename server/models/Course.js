const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      required: [true, 'Please add a level'],
      enum: ['A1', 'A2', 'B1', 'B2'],
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
      },
    ],
    tests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Course', CourseSchema); 