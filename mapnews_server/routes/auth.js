const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Step 1: Initiate registration and send 6-digit email confirmation code
router.post('/register', authController.register);

// Step 2: Verify 6-digit confirmation code and complete registration
router.post('/verify-code', authController.verifyCode);

// Resend 6-digit verification code with 60s cooldown
router.post('/resend-code', authController.resendCode);

router.post('/login', authController.login);
router.get('/account', authController.account);

// Password reset
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
