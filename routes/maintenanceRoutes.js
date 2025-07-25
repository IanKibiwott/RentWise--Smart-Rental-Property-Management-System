const express = require('express');
const router = express.Router();

// Example route to view maintenance requests
router.get('/maintenance', (req, res) => {
  res.send('Maintenance route is under construction.');
});

module.exports = router;
