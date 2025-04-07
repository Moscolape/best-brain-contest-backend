const express = require('express');
const router = express.Router();
const {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  submitQuiz,
  getQuizSubmissions
} = require('../controllers/questionController');


router.post('/admin/questions', createQuestion);

router.get('/admin/questions', getAllQuestions);

router.post('/quiz/submit', submitQuiz);

router.post('/quiz-submissions', getQuizSubmissions);

router.get('/admin/questions/:id', getQuestionById);

router.put('/admin/questions/:id', updateQuestion);

router.delete('/admin/questions/:id', deleteQuestion);

module.exports = router;