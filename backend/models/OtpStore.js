const mongoose = require('mongoose');

const otpStoreSchema = new mongoose.Schema({
    mobileNumber: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 } // TTL: auto-delete after 5 minutes
});

module.exports = mongoose.model('OtpStore', otpStoreSchema);
