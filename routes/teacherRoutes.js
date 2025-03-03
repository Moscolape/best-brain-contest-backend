const express = require("express");
const {
  registerTeacher,
  getAllTeachers,
} = require("../controllers/teacherController");
const upload = require("../config/multerConfig"); // Cloudinary Multer config

const router = express.Router();

// POST /register - Upload file & Register Teacher
router.post("/register", upload.single("uploadPassport"), registerTeacher);


// GET /teachers - Retrieve all teachers
router.get("/teachers", getAllTeachers);

module.exports = router;
