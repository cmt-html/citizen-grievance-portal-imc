const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMedia');

// Citizen Routes
router.post(
    '/', 
    authMiddleware(['citizen']), 
    upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), 
    complaintController.createComplaint
);

router.get('/my-history', authMiddleware(['citizen']), complaintController.getCitizenComplaints);

// Department / Admin Routes
router.get('/all', authMiddleware(['department', 'admin', 'councillor']), complaintController.getDepartmentComplaints);

router.put(
    '/:complaintId/status', 
    authMiddleware(['department', 'admin', 'councillor']), 
    upload.fields([{ name: 'resolutionProof', maxCount: 1 }]), 
    complaintController.updateStatus
);

router.put(
    '/:complaintId/decision',
    authMiddleware(['department', 'admin', 'councillor']),
    complaintController.processComplaint
);

router.put(
    '/:complaintId/reassign',
    authMiddleware(['admin']),
    complaintController.reassignComplaint
);

router.put(
    '/:complaintId/feedback',
    authMiddleware(['citizen']),
    complaintController.submitCitizenFeedback
);

module.exports = router;
