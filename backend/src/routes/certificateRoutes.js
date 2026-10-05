const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// Public verification route (Accessible to anyone with certificate ID or QR code)
router.get('/verify/:certificateId', certificateController.verifyCertificate);

// Student certificate management
router.get('/my', authenticate, certificateController.getMyCertificates);
router.get('/:id', authenticate, certificateController.getCertificateById);
router.get('/:id/pdf', authenticate, certificateController.downloadCertificatePDF);

// Admin bulk certificate generation
router.post('/generate', authenticate, authorize('super_admin', 'event_admin'), certificateController.generateCertificatesForSeminar);

module.exports = router;
