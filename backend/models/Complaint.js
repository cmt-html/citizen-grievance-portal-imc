const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    complaintId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { 
        type: String, 
        required: true,
        enum: ['Sanitation', 'Traffic', 'Police', 'Civic Infrastructure', 'Others']
    },
    media: {
        image: { type: String, required: true }, // URL/path to image (mandatory)
        video: { type: String } // URL/path to video (optional)
    },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        address: { type: String }
    },
    status: {
        type: String,
        enum: ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed'],
        default: 'Submitted'
    },
    assignedToDepartment: { type: String },
    assignedToZone: { type: String },
    assignedToCouncillor: { type: String },
    rejectionReason: { type: String },
    remarks: [{
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],
    resolutionProof: { type: String }, // Optional image for resolution
    escalationLevel: { type: Number, default: 0 },
    escalationHistory: [{
        level: { type: Number },
        label: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],
    citizenFeedback: {
        decision: { type: String, enum: ['Accepted', 'Rejected'] },
        comment: { type: String },
        timestamp: { type: Date }
    },
    deadline: { type: Date } // Expected resolution time (+48 hours)
}, { timestamps: true });

// Pre-save hook to generate complaintId and deadline
complaintSchema.pre('validate', function(next) {
    if (!this.complaintId) {
        const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.complaintId = `CMP-${Date.now().toString().slice(-4)}-${randomString}`;
    }
    if (!this.deadline) {
        this.deadline = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours SLA
    }
    next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
