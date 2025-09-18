const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory user store (replace with DB in production)
const users = {};
const JWT_SECRET = 'your_jwt_secret_key';

// Register
app.post('/api/register', async (req, res) => {
  const { name, email, password, academicDetails = '', topicsNeeded = [] } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required.' });
  if (users[email]) return res.status(400).json({ error: 'Email already registered.' });
  const hash = await bcrypt.hash(password, 10);
  users[email] = { name, email, password: hash, academicDetails, topicsNeeded };
  res.json({ message: 'Registered successfully.' });
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users[email];
  if (!user) return res.status(400).json({ error: 'Invalid credentials.' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: 'Invalid credentials.' });
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, name: user.name, email: user.email });
});

// Auth middleware
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token.' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token.' });
  }
}

// Get profile
app.get('/api/profile', auth, (req, res) => {
  const user = users[req.user.email];
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({
    name: user.name,
    email: user.email,
    academicDetails: user.academicDetails || '',
    topicsNeeded: user.topicsNeeded || []
  });
});

// Update profile
app.put('/api/profile', auth, (req, res) => {
  const user = users[req.user.email];
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const { name, academicDetails, topicsNeeded } = req.body;
  if (name) user.name = name;
  if (typeof academicDetails === 'string') user.academicDetails = academicDetails;
  if (Array.isArray(topicsNeeded)) user.topicsNeeded = topicsNeeded;
  res.json({
    message: 'Profile updated.',
    name: user.name,
    email: user.email,
    academicDetails: user.academicDetails || '',
    topicsNeeded: user.topicsNeeded || []
  });
});

// Forgot password
app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = users[email];
  if (!user) return res.status(404).json({ error: 'No account with that email.' });
  // Generate a new password (for demo)
  const newPassword = Math.random().toString(36).slice(-8);
  bcrypt.hash(newPassword, 10).then(hash => {
    user.password = hash;
    res.json({ message: 'Password reset.', newPassword });
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Server running on port', PORT));
