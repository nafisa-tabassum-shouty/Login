const express = require('express');
const viewController = require('../controllers/viewController');
const router = express.Router();

router.get('/login', viewController.getLoginForm);
router.get('/forgot-password', viewController.getForgotPasswordForm);
router.get('/registration', viewController.getRegistrationForm);
router.get('/reset-password', viewController.getResetPasswordForm);

module.exports = router;
