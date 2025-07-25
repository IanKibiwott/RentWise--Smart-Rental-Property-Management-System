const db = require('../models/db');

exports.showDashboard = (req, res) => {
  const user = req.session?.user;
  if (!user || user.role !== 'tenant') {
    return res.redirect('/login');
  }

  const tenantId = user.id;

  const propertyQuery = `
    SELECT p.*
    FROM tenant_property tp
    JOIN properties p ON tp.property_id = p.id
    WHERE tp.tenant_id = ?
  `;

  const requestQuery = `
    SELECT * FROM maintenance_requests
    WHERE tenant_id = ?
  `;

  db.query(propertyQuery, [tenantId], (err, propertyResults) => {
    if (err) {
      console.error('Error fetching property:', err);
      return res.status(500).send('Error loading dashboard');
    }

    db.query(requestQuery, [tenantId], (err, requestResults) => {
      if (err) {
        console.error('Error fetching requests:', err);
        return res.status(500).send('Error loading requests');
      }

      const property = propertyResults.length > 0 ? propertyResults[0] : null;
      const requests = requestResults || [];

      res.render('tenant-dashboard', { user, property, requests });
    });
  });
};

exports.submitMaintenanceRequest = (req, res) => {
  const user = req.session?.user;
  if (!user || user.role !== 'tenant') {
    return res.redirect('/login');
  }

  const tenantId = user.id;
  const { description } = req.body;

  if (!description) return res.redirect('/tenant/dashboard');

  db.query(
    'SELECT property_id FROM tenant_property WHERE tenant_id = ?',
    [tenantId],
    (err, result) => {
      if (err) {
        console.error('DB error fetching property:', err);
        return res.status(500).send('Property lookup failed');
      }

      if (!result || result.length === 0) {
        console.error('No property assigned to tenant');
        return res.status(400).send('No assigned property found');
      }

      const propertyId = result[0].property_id;

      db.query(
        'INSERT INTO maintenance_requests (tenant_id, property_id, description, status) VALUES (?, ?, ?, ?)',
        [tenantId, propertyId, description, 'Pending'],
        (err) => {
          if (err) {
            console.error('Error submitting request:', err);
            return res.status(500).send('Error submitting request');
          }
          res.redirect('/tenant/dashboard');
        }
      );
    }
  );
};
