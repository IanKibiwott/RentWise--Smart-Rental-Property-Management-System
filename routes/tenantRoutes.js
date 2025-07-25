const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');

// GET tenant dashboard page
router.get('/dashboard', tenantController.showDashboard);

// POST maintenance request submission
router.post('/maintenance-request', tenantController.submitMaintenanceRequest);

module.exports = router;
