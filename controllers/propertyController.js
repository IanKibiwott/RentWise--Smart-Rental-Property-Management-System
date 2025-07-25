const db = require('../models/db');

// Show landlord dashboard
exports.dashboard = (req, res) => {
  const landlordId = req.session.user.id;

  const propertyQuery = `SELECT * FROM properties WHERE landlord_id = ?`;
  const maintenanceQuery = `
    SELECT mr.id, mr.description, mr.status, u.name AS tenant_name, p.name AS property_name
    FROM maintenance_requests mr
    JOIN users u ON mr.tenant_id = u.id
    JOIN properties p ON mr.property_id = p.id
    WHERE p.landlord_id = ?
  `;

  db.query(propertyQuery, [landlordId], (err, properties) => {
    if (err) return res.send('Error fetching properties.');

    db.query(maintenanceQuery, [landlordId], (err2, maintenanceRequests) => {
      if (err2) return res.send('Error fetching maintenance requests.');

      res.render('landlord-dashboard', {
        user: req.session.user,
        properties,
        maintenanceRequests
      });
    });
  });
};

// Add new property
exports.addProperty = (req, res) => {
  const { name, location } = req.body;
  const landlordId = req.session.user.id;

  const insertQuery = 'INSERT INTO properties (name, location, landlord_id) VALUES (?, ?, ?)';
  db.query(insertQuery, [name, location, landlordId], (err) => {
    if (err) return res.send('Error adding property.');
    res.redirect('/landlord/dashboard');
  });
};

// Delete property
exports.deleteProperty = (req, res) => {
  const propertyId = req.params.id;
  db.query('DELETE FROM properties WHERE id = ?', [propertyId], (err) => {
    if (err) return res.send('Error deleting property.');
    res.redirect('/landlord/dashboard');
  });
};

// Show edit property form
exports.showEditPropertyForm = (req, res) => {
  const propertyId = req.params.id;
  db.query('SELECT * FROM properties WHERE id = ?', [propertyId], (err, results) => {
    if (err) return res.send('Error fetching property.');
    res.render('edit-property', { property: results[0] });
  });
};

// Handle edit property
exports.editProperty = (req, res) => {
  const { name, location } = req.body;
  const propertyId = req.params.id;
  db.query(
    'UPDATE properties SET name = ?, location = ? WHERE id = ?',
    [name, location, propertyId],
    (err) => {
      if (err) return res.send('Error updating property.');
      res.redirect('/landlord/dashboard');
    }
  );
};

// Show maintenance requests
exports.viewMaintenance = (req, res) => {
  const landlordId = req.session.user.id;
  const query = `
    SELECT mr.id, mr.description, mr.status, u.name AS tenant_name, p.name AS property_name
    FROM maintenance_requests mr
    JOIN users u ON mr.tenant_id = u.id
    JOIN properties p ON mr.property_id = p.id
    WHERE p.landlord_id = ?
  `;
  db.query(query, [landlordId], (err, requests) => {
    if (err) return res.send('Error loading requests.');
    res.render('maintenance-requests', { requests });
  });
};

// Update request status
exports.updateRequest = (req, res) => {
  const { id, status } = req.body;
  db.query('UPDATE maintenance_requests SET status = ? WHERE id = ?', [status, id], (err) => {
    if (err) return res.send('Error updating request.');
    res.redirect('/landlord/maintenance');
  });
};

// Assign tenant to property
exports.showAssignPropertyForm = (req, res) => {
  const tenantQuery = `SELECT id, name FROM users WHERE role = 'tenant'`;
  const propertyQuery = `SELECT id, name FROM properties`;

  db.query(tenantQuery, (err, tenants) => {
    if (err) return res.send('Error fetching tenants.');
    db.query(propertyQuery, (err2, properties) => {
      if (err2) return res.send('Error fetching properties.');
      res.render('assign-property', { tenants, properties, user: req.session.user });
    });
  });
};

exports.assignProperty = (req, res) => {
  const { tenant_id, property_id } = req.body;
  const checkQuery = `SELECT * FROM tenant_property WHERE tenant_id = ?`;
  db.query(checkQuery, [tenant_id], (err, results) => {
    if (err) return res.send('Error checking assignment.');
    if (results.length > 0) return res.send('Tenant already assigned.');

    const insertQuery = `INSERT INTO tenant_property (tenant_id, property_id) VALUES (?, ?)`;
    db.query(insertQuery, [tenant_id, property_id], (err2) => {
      if (err2) return res.send('Error assigning tenant.');
      res.redirect('/landlord/dashboard');
    });
  });
};
