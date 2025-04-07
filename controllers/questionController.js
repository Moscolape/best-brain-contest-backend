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

    // Validate that email is provided
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find the user in the WeeklyQuizParticipants collection using the email
    const user = await WeeklyQuizModel.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with this email" });
    }

    // Get the question IDs from the answers object
    const questionIds = Object.keys(answers);
    // Fetch the question details from the Question collection
    const questions = await Question.find({ _id: { $in: questionIds } });

    let score = 0;
    let totalPoints = 0;

    // Loop through each question to calculate score and total points
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

    // Calculate the percentage
    const percentage = (score / totalPoints) * 100;
    const now = new Date();
    const weekIdentifier = now.toISOString().split("T")[0];

    // Create a new quiz submission object
    const submission = new QuizSubmissionModel({
      email: user._id, // Store the user's ObjectId instead of email
      score: Math.round(score),
      percentage: Math.round(percentage),
      totalPoints,
      weekIdentifier,
    });

    // Save the quiz submission to the database
    await submission.save();

    // Set up nodemailer transporter for sending the results email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Build the detailed breakdown for the quiz result
    let breakdownHtml = "<h4>Quiz Breakdown:</h4><ul>";
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

    // Set up the email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Quiz Score – Weekly Challenge",
      html: ` 
    <h3>Hi ${user.fullName},</h3>
    <p>Thank you for taking this week's quiz!</p>
    <p><strong>Your Score:</strong> ${Math.round(
      score
    )} / ${totalPoints} (${Math.round(percentage)}%)</p>
    ${breakdownHtml}
    <p>Want to see if you're the champion for this week? <a href="https://bestbraincontest.org/programs">Check the weekly champions page</a> to find out!</p>
    <p>Keep learning and competing 🚀</p>
    <p>Best regards,<br/>The BBC Quiz Team</p>
  `,
    };

    // Send the result email to the user
    await transporter.sendMail(mailOptions);

    // Respond with the quiz submission result
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
