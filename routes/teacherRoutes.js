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

router.post("/register", upload.single("uploadPassport"), registerTeacher);

router.post("/register/anambra", upload.single("uploadPassport"), registerAnambraTeacher);

router.post("/register/weekly-quiz", registerStudent);

router.post("/verify-quiz", verifyQuizAccess);

router.get("/teachers", getAllTeachers);


module.exports = router;