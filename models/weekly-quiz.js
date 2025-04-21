const mongoose = require("mongoose");

const weeklyQuizSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female"], required: true },
    dob: { type: String, required: true },
    myClass: { type: String, enum: ["SS1", "SS2", "SS3"], required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    facebookName: { type: String },
    schoolName: { type: String, required: true },
    stateOfSchool: { type: String, required: true },
    townOfSchool: { type: String, required: true },
    lgaOfSchool: { type: String, required: true },
    schoolNumber: { type: String, required: true },
    quizCode: { type: String, unique: true, required: true },
    declaration: { type: Boolean, required: true },
    followed: { type: Boolean, required: true },
  },
  { timestamps: true }
);

weeklyQuizSchema.index({ email: 1, quizCode: 1 }); 

const WeeklyQuizModel = mongoose.model("WeeklyQuizParticipants", weeklyQuizSchema);
module.exports = WeeklyQuizModel;