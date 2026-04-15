const User = require('../models/User');
const OtpStore = require('../models/OtpStore');
const jwt = require('jsonwebtoken');
const connectDB = require('../config/db');

// Ensure DB is connected before each controller call
const ensureDB = async () => { await connectDB(); };

exports.sendOtp = async (req, res) => {
    try {
        await ensureDB();
        const { mobileNumber, action } = req.body;
        if (!mobileNumber) return res.status(400).json({ message: 'Mobile number required' });

        // Generate 4 digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        
        // Persist OTP in MongoDB (TTL index auto-deletes after 5 mins)
        await OtpStore.findOneAndUpdate(
            { mobileNumber },
            { otp, createdAt: new Date() },
            { upsert: true, new: true }
        );

        console.log(`[SMS SIMULATION] OTP ${otp} for ${mobileNumber}`);
        res.json({ message: 'OTP sent successfully (demo mode)', demoOtp: otp, action });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.register = async (req, res) => {
    try {
        await ensureDB();
        const { name, mobileNumber, email, address, otp, role, departmentType, zone } = req.body;

        // Verify OTP from MongoDB
        const stored = await OtpStore.findOne({ mobileNumber });
        if (!stored || stored.otp !== otp) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        let user = await User.findOne({ mobileNumber });
        if (user) {
            return res.status(400).json({ message: 'User already exists, please login' });
        }

        user = new User({ name, mobileNumber, email, address, role: role || 'citizen', departmentType, zone });
        await user.save();
        await OtpStore.deleteOne({ mobileNumber }); // Cleanup OTP

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ user, token, message: 'Registration successful' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        await ensureDB();
        const { mobileNumber, otp } = req.body;

        // Verify OTP from MongoDB
        const stored = await OtpStore.findOne({ mobileNumber });
        if (!stored || stored.otp !== otp) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const user = await User.findOne({ mobileNumber });
        if (!user) {
            return res.status(404).json({ message: 'User not found. Please register.' });
        }

        await OtpStore.deleteOne({ mobileNumber });
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ user, token, message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        await ensureDB();
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

