const express = require('express');
const viewController = require('../controllers/viewController');
const router = express.Router();

router.get('/login', viewController.getLoginForm);
router.get('/forgot-password', viewController.getForgotPasswordForm);
router.get('/registration', viewController.getRegistrationForm);
router.get('/reset-password', viewController.getResetPasswordForm);
router.get('/verify-otp', viewController.getVerifyOTPForm);
router.get('/privacy-policy', viewController.getPrivacyPolicy);
router.get('/terms-of-service', viewController.getTermsOfService);
router.get('/dashboard', viewController.getDashboard);
router.get('/profile', viewController.getUserProfile);
router.get('/profile/edit', viewController.getEditProfileForm);
router.get('/notifications', viewController.getNotifications);


module.exports = router;
