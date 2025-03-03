const express = require("express");
const { registerTeacher, getAllTeachers } = require("../controllers/teacherController");
const upload = require("../config/multerConfig"); // Cloudinary Multer config

const router = express.Router();

// Routes
router.post("/register", upload.single("uploadPassport"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded!" });
    }

    console.log("Uploaded File to Cloudinary:", req.file.path); // Cloudinary URL
    req.body.passportUrl = req.file.path; // Attach Cloudinary URL to req.body

    next(); // Proceed to registerTeacher
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ success: false, message: "Upload failed" });
  }
});

router.get("/teachers", getAllTeachers);

module.exports = router;