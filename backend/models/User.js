const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobileNumber: { type: String, required: true, unique: true },
    email: { type: String }, // Optional
    address: { type: String }, // Optional / Auto captured
    role: { 
        type: String, 
        enum: ['citizen', 'department', 'admin', 'councillor'], 
        default: 'citizen' 
    },
    // Used for departments/councillors
    departmentType: { type: String }, 
    zone: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
