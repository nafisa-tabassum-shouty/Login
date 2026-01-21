const User = require('../models/User');

// @desc    Register user
// @route   POST /register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).send('User already exists');
        }

        // Create user
        const user = await User.create({
            fullName,
            email,
            password
        });

        if (user) {
            res.redirect('/login');
        } else {
            res.status(400).send('Invalid user data');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Login user
// @route   POST /login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).send('Invalid credentials');
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).send('Invalid credentials');
        }

        // Login successful (In a real app, you'd set a session or JWT here)
        res.send('Login Successful! Welcome ' + user.fullName);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Forgot Password
// @route   POST /forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // In a real app, you'd send an email with a reset link here
        res.send('Instructions sent to ' + email);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
