// models/Question.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const questionSchema = new Schema(
  {
    week: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['multiple-choice', 'objective', 'subjective'],
    },
    prompt: { type: String, required: true },
    points: { type: Number, default: 10 },

    options: {
      type: [String],
      default: undefined,
    },
    correctAnswers: {
      type: [String],
      default: undefined,
    },

    correctAnswer: {
      type: String,
      default: undefined,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);