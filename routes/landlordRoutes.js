const express = require('express');
const router = express.Router();
const landlordController = require('../controllers/landlordController');

router.get('/dashboard', landlordController.showDashboard);

router.get('/add-property', landlordController.showAddProperty);
router.post('/add-property', landlordController.addProperty);

router.get('/edit-property/:id', landlordController.showEditProperty);
router.post('/edit-property/:id', landlordController.updateProperty);

router.post('/delete-property/:id', landlordController.deleteProperty);

router.get('/assign-tenant', landlordController.showAssignTenant);
router.post('/assign-tenant', landlordController.assignTenant);

module.exports = router;
