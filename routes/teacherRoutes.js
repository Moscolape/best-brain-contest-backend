const express = require("express");
const multer = require("multer");
const path = require("path");
const { registerTeacher, getAllTeachers } = require("../controllers/teacherController");

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const timestamp = new Date().toISOString().replace(/:/g, "-");
    cb(null, `${timestamp}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 }, // Limit file size to 1MB
}).single("uploadPassport");

// Routes
router.post("/register", upload, (req, res, next) => {
  console.log("File uploaded:", req.file); // Check if file exists
  next();
}, registerTeacher);

router.get("/teachers", getAllTeachers);

module.exports = router;