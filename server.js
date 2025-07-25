const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

app.use(session({
  secret: 'secretkey',
  resave: false,
  saveUninitialized: false,
  store: sessionStore
}));

// Routes
const authRoutes = require('./routes/authRoutes');
const landlordRoutes = require('./routes/landlordRoutes');
const tenantRoutes = require('./routes/tenantRoutes');

app.use('/', authRoutes);
app.use('/landlord', landlordRoutes);
app.use('/tenant', tenantRoutes);

// 🏠 Home Route
app.get('/', (req, res) => {
  res.render('homepage'); // Make sure views/home.ejs exists
});

// Catch-all (optional)
// app.get('*', (req, res) => res.redirect('/'));

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`RentWise running on http://localhost:${PORT}`);
});
