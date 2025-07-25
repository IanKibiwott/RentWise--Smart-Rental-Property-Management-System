const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

function isLandlord(req, res, next) {
  if (req.session.user && req.session.user.role === 'landlord') {
    return next();
  }
  res.redirect('/login');
}

router.get('/landlord/dashboard', isLandlord, propertyController.dashboard);
router.post('/properties/add', isLandlord, propertyController.addProperty);
router.post('/properties/delete/:id', isLandlord, propertyController.deleteProperty);
router.get('/properties/edit/:id', isLandlord, propertyController.showEditPropertyForm);
router.post('/properties/edit/:id', isLandlord, propertyController.editProperty);
router.get('/landlord/maintenance', isLandlord, propertyController.viewMaintenance);
router.post('/landlord/maintenance/update', isLandlord, propertyController.updateRequest);
router.get('/landlord/assign', isLandlord, propertyController.showAssignPropertyForm);
router.post('/landlord/assign', isLandlord, propertyController.assignProperty);

module.exports = router;
