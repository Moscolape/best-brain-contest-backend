const Teacher = require("../models/teachers");
const { validationResult } = require("express-validator");

// Register a new teacher
exports.registerTeacher = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation Errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
  
    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file);
  
    if (!req.file) {
      return res.status(400).json({ message: "Passport file is missing!" });
    }
  
    try {
      const uploadPassport = req.file.path.replace("\\", "/");
  
      const newTeacher = new Teacher({
        ...req.body, // Include all form fields
        uploadPassport, // Add passport URL
      });
  
      await newTeacher.save();
      res.status(201).json({ message: "Teacher registered successfully", teacher: newTeacher });
    } catch (error) {
      console.error("Server Error:", error);
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