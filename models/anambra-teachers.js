const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female"], required: true },
    dob: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    schoolName: { type: String, required: true },
    schoolAddress: { type: String, required: true },
    lga: { type: String, required: true },
    contactPhone: { type: String, required: true },
    contactEmail: { type: String, required: true },

    subjectTaught: { type: String, required: true },
    yearsOfExperience: { type: Number, required: true },
    currentPosition: { type: String, required: true },

    competitionCategory: {
      type: String,
      enum: [
        "Best Teaching Practices",
        "Innovative Classroom Strategies",
        "Educational Technology Integration",
      ],
      required: true,
    },

    certifications: { type: String },
    motivation: { type: String, required: true },
    declaration: { type: Boolean, required: true },
  },
  { timestamps: true }
);

const AnambraTeacher = mongoose.model("anambraTeachers", teacherSchema);
module.exports = AnambraTeacher;
