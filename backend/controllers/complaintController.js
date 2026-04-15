const Complaint = require('../models/Complaint');
const connectDB = require('../config/db');

const ensureDB = async () => { await connectDB(); };


const CATEGORY_DEPARTMENT_MAP = {
    Sanitation: 'Municipal Solid Waste',
    Traffic: 'Traffic Department',
    Police: 'Police Department',
    'Civic Infrastructure': 'Public Works Department',
    Others: 'General Grievance Cell'
};

const ZONE_COUNCILLOR_MAP = [
    { zone: 'North Zone', minLat: 20.1, maxLat: 20.3, councillor: 'Councillor - North Ward' },
    { zone: 'Central Zone', minLat: 20.3, maxLat: 20.45, councillor: 'Councillor - Central Ward' },
    { zone: 'South Zone', minLat: 20.45, maxLat: 20.8, councillor: 'Councillor - South Ward' }
];

const ESCALATION_LABELS = {
    1: 'Department Senior Official',
    2: 'Councillor',
    3: 'Commissioner',
    4: 'Mayor'
};

const deriveZoneAndCouncillor = (lat) => {
    const matched = ZONE_COUNCILLOR_MAP.find((zone) => lat >= zone.minLat && lat < zone.maxLat);
    if (!matched) {
        return { zone: 'Unmapped Zone', councillor: 'Councillor - Unmapped Zone' };
    }
    return { zone: matched.zone, councillor: matched.councillor };
};

const applyEscalationIfNeeded = (complaint) => {
    if (!complaint?.deadline) return complaint;
    if (['Resolved', 'Closed'].includes(complaint.status)) return complaint;
    if (new Date(complaint.deadline) >= new Date()) return complaint;

    if (complaint.escalationLevel < 4) {
        const nextLevel = complaint.escalationLevel + 1;
        complaint.escalationLevel = nextLevel;
        complaint.escalationHistory.push({
            level: nextLevel,
            label: ESCALATION_LABELS[nextLevel]
        });
    }
    return complaint;
};

exports.createComplaint = async (req, res) => {
    try {
        await ensureDB();
        const { title, description, category, lat, lng, address } = req.body;
        
        // Build media URLs from memory-stored buffer files (base64 data URI for POC)
        let imageUrl = null;
        let videoUrl = null;

        if (req.files && req.files['image'] && req.files['image'][0]) {
            const imgFile = req.files['image'][0];
            const base64 = imgFile.buffer.toString('base64');
            imageUrl = `data:${imgFile.mimetype};base64,${base64}`;
        }

        if (req.files && req.files['video'] && req.files['video'][0]) {
            const vidFile = req.files['video'][0];
            const base64 = vidFile.buffer.toString('base64');
            videoUrl = `data:${vidFile.mimetype};base64,${base64}`;
        }

        const numericLat = Number(lat);
        const numericLng = Number(lng);

        if (isNaN(numericLat) || isNaN(numericLng)) {
            return res.status(400).json({ message: 'Invalid GPS coordinates provided.' });
        }

        const assignedToDepartment = CATEGORY_DEPARTMENT_MAP[category] || CATEGORY_DEPARTMENT_MAP.Others;
        const { zone, councillor } = deriveZoneAndCouncillor(numericLat);

        const complaint = new Complaint({
            user: req.user.userId,
            title,
            description,
            category,
            location: {
                lat: numericLat,
                lng: numericLng,
                address
            },
            media: {
                image: imageUrl,
                video: videoUrl
            },
            assignedToDepartment,
            assignedToZone: zone,
            assignedToCouncillor: councillor,
            status: 'Assigned'
        });

        await complaint.save();
        console.log(`✅ Complaint created: ${complaint.complaintId}`);
        res.status(201).json({ 
            message: 'Complaint registered successfully', 
            complaintId: complaint.complaintId,
            status: complaint.status 
        });
    } catch (error) {
        console.error('❌ Create Complaint Error:', error);
        res.status(500).json({ 
            message: 'Internal server error while saving complaint', 
            error: error.message 
        });
    }
};

exports.getCitizenComplaints = async (req, res) => {
    try {
        await ensureDB();
        const complaints = await Complaint.find({ user: req.user.userId }).sort({ createdAt: -1 });
        const updated = complaints.map((complaint) => applyEscalationIfNeeded(complaint));
        await Promise.all(updated.map((complaint) => complaint.save()));
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getDepartmentComplaints = async (req, res) => {
    try {
        await ensureDB();
        // Here we ideally filter by req.user.departmentType
        // For POC, we'll return all, or just let client filter
        const complaints = await Complaint.find().populate('user', 'name mobileNumber').sort({ createdAt: -1 });
        const updated = complaints.map((complaint) => applyEscalationIfNeeded(complaint));
        await Promise.all(updated.map((complaint) => complaint.save()));
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { complaintId } = req.params;
        const { status, remarks } = req.body;

        const complaint = await Complaint.findOne({ complaintId });
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        if (status) complaint.status = status;
        if (remarks) {
            complaint.remarks.push({
                by: req.user.userId,
                message: remarks
            });
        }

        if (req.files && req.files['resolutionProof']) {
            complaint.resolutionProof = `/uploads/${req.files['resolutionProof'][0].filename}`;
            complaint.status = 'Resolved';
        }

        await complaint.save();
        res.json({ message: 'Status updated successfully', complaint });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.processComplaint = async (req, res) => {
    try {
        const { complaintId } = req.params;
        const { action, reason, remarks } = req.body;
        const complaint = await Complaint.findOne({ complaintId });
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        if (action === 'accept') {
            complaint.status = 'In Progress';
            complaint.rejectionReason = undefined;
        } else if (action === 'reject') {
            complaint.status = 'Assigned';
            complaint.rejectionReason = reason || 'Rejected without reason';
        } else {
            return res.status(400).json({ message: 'Invalid action. Use accept or reject.' });
        }

        if (remarks) {
            complaint.remarks.push({
                by: req.user.userId,
                message: remarks
            });
        }

        await complaint.save();
        res.json({ message: 'Complaint decision recorded', complaint });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.reassignComplaint = async (req, res) => {
    try {
        const { complaintId } = req.params;
        const { assignedToDepartment, assignedToZone, assignedToCouncillor } = req.body;
        const complaint = await Complaint.findOne({ complaintId });
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        if (assignedToDepartment) complaint.assignedToDepartment = assignedToDepartment;
        if (assignedToZone) complaint.assignedToZone = assignedToZone;
        if (assignedToCouncillor) complaint.assignedToCouncillor = assignedToCouncillor;
        complaint.status = 'Assigned';

        await complaint.save();
        res.json({ message: 'Complaint reassigned successfully', complaint });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.submitCitizenFeedback = async (req, res) => {
    try {
        const { complaintId } = req.params;
        const { decision, comment } = req.body;
        const complaint = await Complaint.findOne({ complaintId, user: req.user.userId });
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        if (!['accept', 'reject'].includes(decision)) {
            return res.status(400).json({ message: 'Decision must be accept or reject' });
        }

        complaint.citizenFeedback = {
            decision: decision === 'accept' ? 'Accepted' : 'Rejected',
            comment: comment || '',
            timestamp: new Date()
        };

        complaint.status = decision === 'accept' ? 'Closed' : 'In Progress';
        await complaint.save();
        res.json({ message: 'Feedback submitted successfully', complaint });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
