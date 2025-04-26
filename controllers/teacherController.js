const Teacher = require("../models/southeast-teachers");
const AnambraTeacher = require("../models/anambra-teachers");
const { validationResult } = require("express-validator");
const WeeklyQuizModel = require("../models/weekly-quiz");
const QuizSubmissionModel = require("../models/quiz-submission");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

exports.registerStudent = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { fullName, email } = req.body;

    const quizCode = crypto.randomBytes(4).toString("hex").toUpperCase();

    const newStudent = new WeeklyQuizModel({
      ...req.body,
      quizCode,
    });

    await newStudent.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "BBC Weekly Online Quiz Details",
      html: `
        <div style="font-family: Calibri, sans-serif;">
          <img src="https://www.bestbraincontest.org/BBC%20LOGO.png" alt="Company Logo" width="150" />
          <div style="font-size: 16">
            <h3>Hello ${fullName},</h3>
            <p>Thank you for registering for the weekly online quiz.</p>
            <p><strong>Quiz Date:</strong> Every Saturday starting from April 12, 2025.</p>
            <p><strong>Quiz Time:</strong> 6pm every Saturday</p>
            <p><strong>Your Access Code:</strong> <span style="font-size: 18px; font-weight: bold; color: #007bff;">${quizCode}</span></p>
            <p>Click the link below to access the quiz:</p>
            <a href="${process.env.QUIZ_PAGE_URL}" style="display: inline-block; padding: 10px 15px; background: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Go to Quiz</a>
            <p>Best of luck!</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message:
        "You have successfully been registered. Quiz details sent via email (check spam folder also).",
      student: newStudent,
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await WeeklyQuizModel.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await WeeklyQuizModel.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.verifyQuizAccess = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, quizCode } = req.body;

  try {
    const student = await WeeklyQuizModel.findOne({ email, quizCode });

    if (!student) {
      return res.status(400).json({ message: "Invalid email or quiz code." });
    }

    const today = new Date().toISOString().split("T")[0];

    const alreadySubmitted = await QuizSubmissionModel.findOne({
      email: student._id,
      weekIdentifier: today,
    });

    if (alreadySubmitted) {
      return res
        .status(400)
        .json({ message: "You have already taken this week's quiz!" });
    }

    res.status(200).json({
      message: "Access granted. Proceeding to the quiz...",
      student: {
        fullName: student.fullName,
        gender: student.gender,
        dob: student.dob,
        myClass: student.myClass,
        phoneNumber: student.phoneNumber,
        schoolName: student.schoolName,
        stateOfSchool: student.stateOfSchool,
        townOfSchool: student.townOfSchool,
        lgaOfSchool: student.lgaOfSchool,
        schoolNumber: student.schoolNumber,
        email: student.email,
      },
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.registerTeacher = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Passport file is missing!" });
  }

  try {
    const uploadPassport = req.file.path.replace("\\", "/");

    const newTeacher = new Teacher({
      ...req.body,
      uploadPassport
    });

    await newTeacher.save();
    res.status(201).json({
      message: "Teacher registered successfully",
      teacher: newTeacher,
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.registerAnambraTeacher = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Passport file is missing!" });
  }

  try {
    const uploadPassport = req.file.path.replace("\\", "/");

    const newTeacher = new AnambraTeacher({
      ...req.body,
      uploadPassport,
    });

    await newTeacher.save();
    res.status(201).json({
      message: "Teacher registered successfully",
      teacher: newTeacher,
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
