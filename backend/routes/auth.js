const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  register,
  login,
  googleAuth,
  microsoftAuth,
  updateProfile,
  completeOnboarding,
  getCurrentUser
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/microsoft', microsoftAuth);

// Protected routes
router.use(auth);
router.get('/me', getCurrentUser);
router.put('/profile', updateProfile);
router.post('/onboarding', completeOnboarding);

module.exports = router; 