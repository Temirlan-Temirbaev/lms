const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema(
  {
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
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
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
      },
    ],
    passingScore: {
      type: Number,
      required: true,
    },
    timeLimit: {
      type: Number, // in minutes
      default: 30,
    },
    order: {
      type: Number,
      required: true,
    },
    isFinal: {
      type: Boolean,
      default: false,
      description: 'Indicates if this is a final test for the level that can unlock the next level'
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Test', TestSchema); 