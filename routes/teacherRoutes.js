const express = require("express");
const {
  registerTeacher,
  getAllTeachers,
  registerAnambraTeacher
} = require("../controllers/teacherController");
const upload = require("../config/multerConfig"); // Cloudinary Multer config

const router = express.Router();

// POST /register - Upload file & Register Teacher
router.post("/register", upload.single("uploadPassport"), registerTeacher);

// POST /register - Upload file & Register Anambra Teacher
router.post("/register/anambra", upload.single("uploadPassport"), registerAnambraTeacher);

// GET /teachers - Retrieve all teachers
router.get("/teachers", getAllTeachers);

module.exports = router;
