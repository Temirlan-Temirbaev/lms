const mongoose = require('mongoose');

const PlacementTestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  timeLimit: {
    type: Number,
    default: 60 // Time limit in minutes
  },
  questions: [
    {
      question: {
        type: String,
        required: [true, 'Please add a question']
      },
      type: {
        type: String,
        enum: ['multiple-choice', 'fill-in-the-blank', 'matching', 'ordering', 'categories'],
        required: [true, 'Please specify question type']
      },
      options: {
        type: mongoose.Schema.Types.Mixed,
        default: null
      },
      correctAnswer: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Please provide the correct answer']
      },
      explanation: {
        type: String,
        default: ''
      },
      points: {
        type: Number,
        default: 1
      },
      level: {
        type: String,
        enum: ['A1', 'A2', 'B1', 'B2'],
        required: [true, 'Please specify the question level']
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PlacementTest', PlacementTestSchema); 