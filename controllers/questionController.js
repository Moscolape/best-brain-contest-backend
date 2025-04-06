const Question = require('../models/questions');

exports.createQuestion = async (req, res) => {
  try {
    const { day, type, prompt, points, options, correctAnswers, correctAnswer } = req.body;

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
    res.status(201).json({ message: 'Question created successfully', question: newQuestion });
  } catch (error) {
    res.status(500).json({ message: 'Error creating question', error: error.message });
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
    res.status(500).json({ message: 'Error retrieving questions', error: error.message });
  }
};

exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving question', error: error.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const { day, type, prompt, points, options, correctAnswers, correctAnswer } = req.body;
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      { day, type, prompt, points, options, correctAnswers, correctAnswer },
      { new: true }
    );
    
    if (!updatedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({ message: 'Question updated successfully', question: updatedQuestion });
  } catch (error) {
    res.status(500).json({ message: 'Error updating question', error: error.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
    if (!deletedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting question', error: error.message });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;

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

        const pointsPerCorrectAnswer =
          (question.points || 10) / correctAnswers.length;
        score += pointsPerCorrectAnswer * correctCount;
      } else if (question.type === "objective") {
        if (question.correctAnswer === userAnswer) {
          score += question.points || 10;
        }
      }
    }

    const percentage = (score / totalPoints) * 100;

    res.status(200).json({
      message: "Quiz submitted successfully",
      score,
      percentage: Math.round(percentage),
      totalPoints,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error submitting quiz", error: error.message });
  }
};