require('dotenv').config(); // Load environment variables
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());

// Rate-Limiting Middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verificationCode: String,
    isVerified: { type: Boolean, default: false },
    codeExpiresAt: Date,
});
const User = mongoose.model('User', userSchema);

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Use environment variables
        pass: process.env.EMAIL_PASS, // Use environment variables
    },
});

// Generate verification code
const generateCode = () => crypto.randomBytes(3).toString('hex'); // 6-character code

// Routes
// 1. Signup and send verification code
app.post(
    '/api/signup',
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const verificationCode = generateCode();
            const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // Code valid for 10 minutes

            // Save user to database
            let user = await User.findOne({ email });
            if (!user) {
                user = new User({ email, password: hashedPassword, verificationCode, codeExpiresAt });
            } else {
                return res.status(400).json({ success: false, message: 'Email is already registered. Please log in.' });
            }
            await user.save();

            // Send email
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Your Verification Code',
                text: `Your verification code is: ${verificationCode}`,
            };

            await transporter.sendMail(mailOptions);

            res.status(200).json({ success: true, message: 'Verification code sent to your email' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }
);

// 2. Verify the code
app.post(
    '/api/verify',
    body('email').isEmail().withMessage('Invalid email format'),
    body('code').notEmpty().withMessage('Verification code is required'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, code } = req.body;

        try {
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            if (user.isVerified) {
                return res.status(400).json({ success: false, message: 'User already verified' });
            }

            if (user.verificationCode !== code) {
                return res.status(400).json({ success: false, message: 'Invalid verification code' });
            }

            if (new Date() > user.codeExpiresAt) {
                return res.status(400).json({ success: false, message: 'Verification code has expired' });
            }

            user.isVerified = true;
            user.verificationCode = null; // Clear the code
            user.codeExpiresAt = null; // Clear the expiration
            await user.save();

            res.status(200).json({ success: true, message: 'User verified successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }
);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});