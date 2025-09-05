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
      type: {
        type: String,
        required: true,
        enum: ['multiple-choice', 'matching', 'ordering', 'fill-in-blanks', 'input', 'categories'],
      },
      question: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: false,
        // Used for fill-in-blanks questions to store the main instruction
      },
      content: {
        type: String,
        required: false,
        // Used for additional content like images, audio, markdown
      },
      options: {
        type: [String],
        required: function() {
          return ['multiple-choice', 'matching', 'ordering'].includes(this.type);
        },
      },
      correctAnswer: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        // For multiple-choice: string (the correct option)
        // For matching: array of strings (correct matches in order)
        // For ordering: array of strings (correct order)
        // For fill-in-blanks: string or array of strings (possible correct answers) for single blank
        //                     or object with keys as blank identifiers and values as possible answers for multiple blanks
        // For input: string or array of strings (possible correct answers)
        // For categories: object with category names as keys and arrays of items as values
      },
      explanation: {
        type: String,
        required: true,
      },
      points: {
        type: Number,
        default: 1,
      },
      level: {
        type: String,
        enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
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