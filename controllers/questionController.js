const Question = require("../models/questions");
const QuizSubmissionModel = require("../models/quiz-submission");
const nodemailer = require("nodemailer");
const WeeklyQuizModel = require("../models/weekly-quiz");

exports.createQuestion = async (req, res) => {
  try {
    const {
      day,
      type,
      prompt,
      points,
      options,
      correctAnswers,
      correctAnswer,
    } = req.body;

    const newQuestion = new Question({
      day,
      type,
      prompt,
      points,
      options,
      correctAnswers,
      correctAnswer,
    });

    await newQuestion.save();
    res.status(201).json({
      message: "Question created successfully",
      question: newQuestion,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating question", error: error.message });
  }
};

exports.getAllQuestions = async (req, res) => {
  try {
    const { day } = req.query;

    const filter = {};
    if (day) {
      filter.day = day;
    }

    const questions = await Question.find(filter);
    res.status(200).json(questions);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving questions", error: error.message });
  }
};

exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json(question);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving question", error: error.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const {
      day,
      type,
      prompt,
      points,
      options,
      correctAnswers,
      correctAnswer,
    } = req.body;
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      { day, type, prompt, points, options, correctAnswers, correctAnswer },
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({
      message: "Question updated successfully",
      question: updatedQuestion,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating question", error: error.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
    if (!deletedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting question", error: error.message });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { answers, email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await WeeklyQuizModel.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with this email" });
    }

    const questionIds = Object.keys(answers);

    const questions = await Question.find({ _id: { $in: questionIds } });

    let score = 0;
    let totalPoints = 0;

    for (const question of questions) {
      const userAnswer = answers[question._id];
      totalPoints += question.points || 10;

      if (question.type === "multiple-choice") {
        const correctAnswers = question.correctAnswers.sort();
        const userAnswers = (userAnswer || []).sort();
        const correctCount = userAnswers.filter((ans) =>
          correctAnswers.includes(ans)
        ).length;
        const pointsPerCorrect =
          (question.points || 10) / correctAnswers.length;
        score += pointsPerCorrect * correctCount;
      } else if (question.type === "objective") {
        if (question.correctAnswer === userAnswer) {
          score += question.points || 10;
        }
      }
    }

    const percentage = (score / totalPoints) * 100;
    const now = new Date();
    const weekIdentifier = now.toISOString().split("T")[0];

    const submission = new QuizSubmissionModel({
      email: user._id,
      score: Math.round(score),
      percentage: Math.round(percentage),
      totalPoints,
      weekIdentifier,
    });

    await submission.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let breakdownHtml = "<h4>BBC Quiz Breakdown:</h4><ul>";
    for (const question of questions) {
      const userAnswer = answers[question._id];
      const isCorrect =
        question.type === "multiple-choice"
          ? JSON.stringify((userAnswer || []).sort()) ===
            JSON.stringify((question.correctAnswers || []).sort())
          : question.correctAnswer === userAnswer;

      breakdownHtml += `<li style="margin-bottom: 1em;">
    <strong>Q:</strong> ${question.prompt}<br/>
    <strong>Your Answer:</strong> ${
      question.type === "multiple-choice"
        ? (userAnswer || []).join(", ")
        : userAnswer || "No answer"
    }<br/>
    <strong>Correct Answer:</strong> ${
      question.type === "multiple-choice"
        ? (question.correctAnswers || []).join(", ")
        : question.correctAnswer
    }<br/>
    <strong>Result:</strong> ${
      isCorrect
        ? "<span style='color: green;'>Correct ✅</span>"
        : "<span style='color: red;'>Incorrect ❌</span>"
    }
  </li>`;
    }
    breakdownHtml += "</ul>";

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Quiz Score – Weekly Challenge",
      html: ` 
        <h3>Hi ${user.fullName},</h3>
        <p>Thank you for taking this week's quiz!</p>
        <p>You scored <strong>${Math.round(
          score
        )} out of ${totalPoints}</strong> points.</p>
        ${breakdownHtml}
        <p>Want to see if you're the champion for this week? <a href="https://bestbraincontest.org/programs">Check the weekly champions page</a> to find out!</p>
        <p>Keep learning and competing 🚀</p>
        <p>Best regards,<br/>The BBC Quiz Team</p>
    
        <hr style="margin-top: 30px;"/>
        <p style="font-size: 14px; color: #666;">Proudly sponsored by AKPOAZAA FOUNDATION</p>
        <img src="https://akpoazaafoundation.org/assets/Akpoazaa%20Foundation%20Logo-CKIMWbzR.png" alt="Akpoazaa Foundation" style="height: 40px;"/>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Quiz submitted successfully and email sent!",
      score: Math.round(score),
      percentage: Math.round(percentage),
      totalPoints,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error submitting quiz", error: error.message });
  }
};

exports.getQuizSubmissions = async (req, res) => {
  try {
    const { weekIdentifier, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum <= 0) {
      return res.status(400).json({ message: "Invalid page number" });
    }
    if (isNaN(limitNum) || limitNum <= 0) {
      return res.status(400).json({ message: "Invalid limit number" });
    }

    const filter = {};
    if (weekIdentifier) {
      filter.weekIdentifier = weekIdentifier;
    }

    const skip = (pageNum - 1) * limitNum;

    const submissions = await QuizSubmissionModel.find(filter)
      .populate(
        "email",
        "fullName gender dob myClass phoneNumber schoolName stateOfSchool townOfSchool lgaOfSchool schoolNumber"
      )
      .skip(skip)
      .limit(limitNum)
      .exec();

    const totalCount = await QuizSubmissionModel.countDocuments(filter).exec();

    if (!submissions || submissions.length === 0) {
      return res.status(404).json({ message: "No quiz submissions found" });
    }

    res.status(200).json({
      submissions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error retrieving quiz submissions",
      error: error.message,
    });
  }
};

exports.getAllParticipants = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await WeeklyQuizModel.countDocuments();
    const participants = await WeeklyQuizModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalParticipants: total,
      participants,
    });
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({ message: "Server error" });
  }
};
