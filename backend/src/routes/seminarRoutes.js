const express = require('express');
const router = express.Router();
const seminarController = require('../controllers/seminarController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// Public / student with optional personalization
router.get('/', optionalAuth, seminarController.getSeminars);
router.get('/:id', optionalAuth, seminarController.getSeminarById);

// Admin-only management endpoints
router.post('/', authenticate, authorize('super_admin', 'event_admin'), seminarController.createSeminar);
router.put('/:id', authenticate, authorize('super_admin', 'event_admin'), seminarController.updateSeminar);
router.delete('/:id', authenticate, authorize('super_admin', 'event_admin'), seminarController.deleteSeminar);
router.patch('/:id/status', authenticate, authorize('super_admin', 'event_admin'), seminarController.updateSeminarStatus);

module.exports = router;
