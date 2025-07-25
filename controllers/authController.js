const bcrypt = require('bcryptjs');
const db = require('../models/db');

exports.showRegister = (req, res) => {
  res.render('register');
};

exports.registerUser = (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, role], (err) => {
      if (err) throw err;
      res.redirect('/login');
    });
};

exports.showLogin = (req, res) => {
  res.render('login');
};

exports.loginUser = (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) throw err;
    if (results.length === 0) return res.send('User not found');

    const user = results[0];
    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) return res.send('Invalid password');

    req.session.user = user;
    if (user.role === 'landlord') {
      res.redirect('/landlord/dashboard');
    } else {
      res.redirect('/tenant/dashboard');
    }
  });
};

exports.logoutUser = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};
