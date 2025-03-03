const Teacher = require("../models/teachers");
const { validationResult } = require("express-validator");

// Register a new teacher
exports.registerTeacher = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  console.log("Uploaded File:", req.file);

  try {
    const {
      name,
      gender,
      dob,
      phoneNumber,
      email,
      schoolName,
      schoolAddress,
      lga,
      contactPhone,
      contactEmail,
      subjectTaught,
      yearsOfExperience,
      currentPosition,
      competitionCategory,
      certifications,
      motivation,
      declaration,
    } = req.body;

    const uploadPassport = req.file ? req.file.path.replace("\\", "/") : null;

    const newTeacher = new Teacher({
      name,
      gender,
      dob,
      phoneNumber,
      email,
      schoolName,
      schoolAddress,
      lga,
      contactPhone,
      contactEmail,
      subjectTaught,
      yearsOfExperience,
      currentPosition,
      competitionCategory,
      certifications,
      motivation,
      declaration,
      uploadPassport,
    });

    await newTeacher.save();
    res.status(201).json({ message: "Teacher registered successfully", teacher: newTeacher });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all registered teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};