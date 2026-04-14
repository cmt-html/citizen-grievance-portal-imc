const User = require('../models/User');
const jwt = require('jsonwebtoken');

// A simple mock for OTPs in memory for POC
const otpStore = new Map();

exports.sendOtp = async (req, res) => {
    try {
        const { mobileNumber, action } = req.body;
        if (!mobileNumber) return res.status(400).json({ message: 'Mobile number required' });

        // Generate 4 digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        
        // Simulating SMS Send
        console.log(`[SMS SIMULATION] Sending OTP ${otp} to ${mobileNumber}`);
        otpStore.set(mobileNumber, otp);

        res.json({ message: 'OTP sent successfully (demo mode)', demoOtp: otp, action });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.register = async (req, res) => {
    try {
        const { name, mobileNumber, email, address, otp, role, departmentType, zone } = req.body;

        if (otpStore.get(mobileNumber) !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        let user = await User.findOne({ mobileNumber });
        if (user) {
            return res.status(400).json({ message: 'User already exists, please login' });
        }

        user = new User({
            name,
            mobileNumber,
            email,
            address,
            role: role || 'citizen',
            departmentType,
            zone
        });
        await user.save();
        otpStore.delete(mobileNumber); // Cleanup OTP

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ user, token, message: 'Registration successful' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { mobileNumber, otp } = req.body;

        if (otpStore.get(mobileNumber) !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        const user = await User.findOne({ mobileNumber });
        if (!user) {
            return res.status(404).json({ message: 'User not found. Please register.' });
        }

        otpStore.delete(mobileNumber);
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ user, token, message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
