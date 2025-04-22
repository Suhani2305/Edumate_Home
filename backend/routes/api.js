const express = require('express');
const router = express.Router();
const { generateQuiz } = require('../controllers/quizController');
const { exportToPDF } = require('../controllers/exportController');

// Quiz generation route
router.post('/generate-quiz', generateQuiz);

// PDF export route
router.post('/export-pdf', exportToPDF);

module.exports = router; 