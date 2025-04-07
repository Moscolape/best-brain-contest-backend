const express = require("express");
const {
  registerTeacher,
  getAllTeachers,
  registerAnambraTeacher,
  registerStudent,
  verifyQuizAccess
} = require("../controllers/teacherController");
const upload = require("../config/multerConfig");

const router = express.Router();


// POST /register - Upload file & Register Teacher
router.post("/register", upload.single("uploadPassport"), registerTeacher);

// POST /register - Upload file & Register Anambra Teacher
router.post("/register/anambra", upload.single("uploadPassport"), registerAnambraTeacher);

router.post("/register/weekly-quiz", registerStudent);

router.post("/verify-quiz", verifyQuizAccess);

// GET /teachers - Retrieve all teachers
router.get("/teachers", getAllTeachers);


module.exports = router;
