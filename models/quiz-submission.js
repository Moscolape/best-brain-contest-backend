const mongoose = require("mongoose");

const quizSubmissionSchema = new mongoose.Schema({
  email: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WeeklyQuizParticipants",
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  totalPoints: {
    type: Number,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  weekIdentifier: {
    type: String,
    required: true,
  },
});

const QuizSubmissionModel = mongoose.model("QuizSubmission", quizSubmissionSchema);
module.exports = QuizSubmissionModel;