const db = require('../models/db');

// Show Landlord Dashboard
exports.showDashboard = (req, res) => {
  const landlordId = req.session?.user?.id;
  if (!landlordId) {
    return res.redirect('/login');
  }

  const propertyQuery = 'SELECT * FROM properties WHERE landlord_id = ?';
  const maintenanceQuery = `
    SELECT mr.*, u.name AS tenant_name 
    FROM maintenance_requests mr 
    JOIN tenant_property tp ON mr.tenant_id = tp.tenant_id 
    JOIN users u ON mr.tenant_id = u.id 
    WHERE tp.landlord_id = ?`;

  db.query(propertyQuery, [landlordId], (err, properties) => {
    if (err) {
      console.error('Error fetching properties:', err);
      return res.status(500).send('Error loading properties');
    }

    db.query(maintenanceQuery, [landlordId], (err, maintenanceRequests) => {
      if (err) {
        console.error('Error fetching maintenance requests:', err);
        return res.status(500).send('Error loading maintenance requests');
      }

      res.render('landlord-dashboard', {
        user: req.session.user, // ✅ fixed: pass user to view
        properties,
        maintenanceRequests
      });
    });
  });
};

// Show Add Property Form
exports.showAddProperty = (req, res) => {
  res.render('add-property');
};

// Add Property
exports.addProperty = (req, res) => {
  const landlordId = req.session?.user?.id;
  const { name, location, rent } = req.body;

  if (!landlordId || !name || !location || !rent) {
    return res.status(400).send('Missing required fields');
  }

  const insertQuery = 'INSERT INTO properties (landlord_id, name, location, rent) VALUES (?, ?, ?, ?)';
  db.query(insertQuery, [landlordId, name, location, rent], (err) => {
    if (err) {
      console.error('Error adding property:', err);
      return res.status(500).send('Error adding property');
    }
    res.redirect('/landlord/dashboard');
  });
};

// Show Edit Property Form
exports.showEditProperty = (req, res) => {
  const propertyId = req.params.id;

  db.query('SELECT * FROM properties WHERE id = ?', [propertyId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).send('Property not found');
    }
    res.render('edit-property', { property: results[0] });
  });
};

// Update Property
exports.updateProperty = (req, res) => {
  const propertyId = req.params.id;
  const { name, location, rent } = req.body;

  const updateQuery = 'UPDATE properties SET name = ?, location = ?, rent = ? WHERE id = ?';
  db.query(updateQuery, [name, location, rent, propertyId], (err) => {
    if (err) {
      console.error('Error updating property:', err);
      return res.status(500).send('Error updating property');
    }
    res.redirect('/landlord/dashboard');
  });
};

// Delete Property
exports.deleteProperty = (req, res) => {
  const propertyId = req.params.id;

  db.query('DELETE FROM properties WHERE id = ?', [propertyId], (err) => {
    if (err) {
      console.error('Error deleting property:', err);
      return res.status(500).send('Error deleting property');
    }
    res.redirect('/landlord/dashboard');
  });
};

// Show Assign Tenant Form
exports.showAssignTenant = (req, res) => {
  const landlordId = req.session?.user?.id;

  const tenantsQuery = 'SELECT id, name FROM users WHERE role = "tenant"';
  const propertiesQuery = 'SELECT id, name FROM properties WHERE landlord_id = ?';

  db.query(tenantsQuery, (err, tenants) => {
    if (err) {
      console.error('Error fetching tenants:', err);
      return res.status(500).send('Error loading tenants');
    }

    db.query(propertiesQuery, [landlordId], (err, properties) => {
      if (err) {
        console.error('Error fetching properties:', err);
        return res.status(500).send('Error loading properties');
      }

      res.render('assign-tenant', {
        tenants,
        properties
      });
    });
  });
};

// Assign Tenant to Property
exports.assignTenant = (req, res) => {
  const landlordId = req.session?.user?.id;
  const { tenant_id, property_id } = req.body;

  if (!tenant_id || !property_id) {
    return res.status(400).send('Missing required fields');
  }

  const insertQuery = 'INSERT INTO tenant_property (tenant_id, property_id, landlord_id) VALUES (?, ?, ?)';
  db.query(insertQuery, [tenant_id, property_id, landlordId], (err) => {
    if (err) {
      console.error('Error assigning tenant:', err);
      return res.status(500).send('Error assigning tenant');
    }
    res.redirect('/landlord/dashboard');
  });
};
