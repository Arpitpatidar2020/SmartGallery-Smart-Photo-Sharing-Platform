const express = require('express');
const router = express.Router();
const {
  register,
  login,
  googleLogin,
  getMe,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', auth, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
