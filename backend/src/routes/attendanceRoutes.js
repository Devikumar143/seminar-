const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// Student attendance history
router.get('/my', authenticate, attendanceController.getMyAttendance);

// Admin QR scanning & verification
router.post('/scan', authenticate, authorize('super_admin', 'event_admin'), attendanceController.scanAttendance);
router.get('/seminar/:id', authenticate, authorize('super_admin', 'event_admin'), attendanceController.getSeminarAttendance);
router.post('/manual-mark', authenticate, authorize('super_admin', 'event_admin'), attendanceController.manualMarkAttendance);

module.exports = router;
