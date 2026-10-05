const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, registrationController.registerForSeminar);
router.get('/my', authenticate, registrationController.getMyRegistrations);
router.get('/my-waitlist', authenticate, registrationController.getMyWaitlist);
router.get('/:id', authenticate, registrationController.getRegistrationById);
router.get('/:id/pass-pdf', authenticate, registrationController.downloadPassPDF);
router.delete('/:id', authenticate, registrationController.cancelRegistration);

module.exports = router;
