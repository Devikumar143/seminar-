const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// Protect all admin endpoints
router.use(authenticate, authorize('super_admin', 'event_admin'));

router.get('/dashboard', adminController.getAdminDashboard);
router.get('/analytics', adminController.getAdminAnalytics);
router.get('/registrations', adminController.getAdminRegistrations);
router.get('/export/registrations-csv', adminController.exportRegistrationsCSV);
router.get('/users', adminController.getAdminUsers);

// Super admin only route
router.put('/users/:id/role', authorize('super_admin'), adminController.updateUserRole);

module.exports = router;
