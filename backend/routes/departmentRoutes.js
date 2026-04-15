const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const connectDB = require('../config/db');

const ensureDB = async () => { await connectDB(); };

const masterConfig = {
    categories: ['Sanitation', 'Traffic', 'Police', 'Civic Infrastructure', 'Others'],
    departments: ['Municipal Solid Waste', 'Traffic Department', 'Police Department', 'Public Works Department', 'General Grievance Cell'],
    zones: ['North Zone', 'Central Zone', 'South Zone'],
    councillors: ['Councillor - North Ward', 'Councillor - Central Ward', 'Councillor - South Ward']
};

// Simple dashboard metrics route
router.get('/dashboard-metrics', authMiddleware(['department', 'admin']), async (req, res) => {
    try {
        await ensureDB();
        const total = await Complaint.countDocuments();
        const pending = await Complaint.countDocuments({ status: { $in: ['Submitted', 'Assigned', 'In Progress'] } });
        const resolved = await Complaint.countDocuments({ status: 'Resolved' });
        
        const slaBreached = await Complaint.countDocuments({ 
            deadline: { $lt: new Date() },
            status: { $nin: ['Resolved', 'Closed'] }
        });

        res.json({ total, pending, resolved, slaBreached });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/master-config', authMiddleware(['admin', 'department', 'councillor']), async (req, res) => {
    res.json(masterConfig);
});

router.post('/users', authMiddleware(['admin']), async (req, res) => {
    try {
        await ensureDB();
        const { name, mobileNumber, email, role, departmentType, zone } = req.body;
        const user = new User({ name, mobileNumber, email, role, departmentType, zone });
        await user.save();
        res.status(201).json({ message: 'Department user created successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/reports/summary', authMiddleware(['admin']), async (req, res) => {
    try {
        await ensureDB();
        const complaints = await Complaint.find();
        const byDepartment = {};
        const byCategory = {};
        const byLocation = {};
        let slaBreached = 0;

        complaints.forEach((complaint) => {
            byDepartment[complaint.assignedToDepartment] = (byDepartment[complaint.assignedToDepartment] || 0) + 1;
            byCategory[complaint.category] = (byCategory[complaint.category] || 0) + 1;
            byLocation[complaint.assignedToZone] = (byLocation[complaint.assignedToZone] || 0) + 1;

            if (new Date(complaint.deadline) < new Date() && !['Resolved', 'Closed'].includes(complaint.status)) {
                slaBreached += 1;
            }
        });

        res.json({
            byDepartment,
            byCategory,
            byLocation,
            slaCompliance: {
                total: complaints.length,
                breached: slaBreached,
                compliant: complaints.length - slaBreached
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
