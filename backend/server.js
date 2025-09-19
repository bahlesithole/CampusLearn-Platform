require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const { Readable } = require('stream');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// -------------------- MongoDB + GridFS --------------------
const MONGO_URI = process.env.MONGO_URI;
let gfsBucket;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

mongoose.connection.once('open', () => {
  gfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
  console.log('✅ GridFSBucket ready');
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// -------------------- In-memory users --------------------
const users = {}; // Replace with DB in production
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
// -------------------- In-memory notifications --------------------
const notifications = [];

// -------------------- Auth routes --------------------

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
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = users[email];
  if (!user) return res.status(404).json({ error: 'No account with that email.' });
  const newPassword = Math.random().toString(36).slice(-8);
  const hash = await bcrypt.hash(newPassword, 10);
  user.password = hash;
  res.json({ message: 'Password reset.', newPassword });
});

// -------------------- File routes --------------------

// Upload a file (authenticated)
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { originalname, mimetype, buffer } = req.file;
    const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);

    const uploadStream = gfsBucket.openUploadStream(originalname, {
      contentType: mimetype,
      metadata: metadata
    });

    readable.pipe(uploadStream)
      .on('error', (err) => {
        console.error(err);
        res.status(500).json({ error: 'Upload failed' });
      })
      .on('finish', () => {
        res.json({ message: 'Upload successful', id: uploadStream.id });
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// List all files
app.get('/api/files', async (req, res) => {
  if (!gfsBucket) return res.status(503).json({ error: 'MongoDB not ready' });
  try {
    const files = await gfsBucket.find().toArray();
    if (!files.length) return res.status(404).json({ message: 'No files found' });
    res.json(files);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Download a file
app.get('/api/files/:id/download', async (req, res) => {
  if (!gfsBucket) return res.status(503).json({ error: 'MongoDB not ready' });
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const files = await gfsBucket.find({ _id: fileId }).toArray();
    if (!files.length) return res.status(404).json({ error: 'File not found' });
    const file = files[0];
    res.set('Content-Type', file.contentType);
    res.set('Content-Disposition', `attachment; filename="${file.filename}"`);
    gfsBucket.openDownloadStream(fileId).pipe(res);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Stream a file
app.get('/api/files/:id/stream', async (req, res) => {
  if (!gfsBucket) return res.status(503).json({ error: 'MongoDB not ready' });
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const files = await gfsBucket.find({ _id: fileId }).toArray();
    if (!files.length) return res.status(404).json({ error: 'File not found' });
    const file = files[0];
    res.set('Content-Type', file.contentType);
    gfsBucket.openDownloadStream(fileId).pipe(res);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// -------------------- Start server --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// -------------------- Topic CRUD routes --------------------
const Topic = require('./models/Topic');

// Create a topic (student)
app.post('/api/topics', auth, async (req, res) => {
  try {
    const { title, description, module } = req.body;
    if (!title || !description || !module) return res.status(400).json({ error: 'All fields required.' });
    const topic = await Topic.create({
      title,
      description,
      module,
      createdBy: req.user.email // or user id if available
    });
    // TODO: Trigger notification to tutors here
      // Add notification for tutors of this module
      Object.values(users).forEach(user => {
        if (user.role === 'tutor' && user.modules && user.modules.includes(module)) {
          notifications.push({
            to: user.email,
            message: `New topic created in module ${module}: ${title}`,
            topicId: topic._id,
            createdAt: new Date()
          });
        }
      });
      res.json(topic);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all topics
app.get('/api/topics', auth, async (req, res) => {
  try {
    const topics = await Topic.find();
    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single topic
app.get('/api/topics/:id', auth, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    res.json(topic);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update topic (student or tutor)
app.put('/api/topics/:id', auth, async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    res.json(topic);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get notifications for current user (tutor)
app.get('/api/notifications', auth, (req, res) => {
  const user = users[req.user.email];
  if (!user || user.role !== 'tutor') return res.status(403).json({ error: 'Only tutors can view notifications.' });
  const userNotifications = notifications.filter(n => n.to === user.email);
  res.json(userNotifications);
});
// Delete topic (student)
app.delete('/api/topics/:id', auth, async (req, res) => {
  try {
    const topic = await Topic.findByIdAndDelete(req.params.id);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    res.json({ message: 'Topic deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Tutor responds to a topic (restricted by module)
app.post('/api/topics/:id/respond', auth, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    const user = users[req.user.email];
    // Check if user is a tutor and has access to the module
    if (!user || user.role !== 'tutor') {
      return res.status(403).json({ error: 'Only tutors can respond.' });
    }
    if (!user.modules || !user.modules.includes(topic.module)) {
      return res.status(403).json({ error: 'Tutor not assigned to this module.' });
    }
    const { response, resources = [] } = req.body;
    if (!response) return res.status(400).json({ error: 'Response required.' });
    topic.responses.push({ tutor: req.user.email, response, resources });
    await topic.save();
    res.json(topic);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Tutor uploads resource for a topic response
app.post('/api/topics/:id/upload-resource', auth, upload.single('file'), async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    const user = users[req.user.email];
    if (!user || user.role !== 'tutor') {
      return res.status(403).json({ error: 'Only tutors can upload resources.' });
    }
    if (!user.modules || !user.modules.includes(topic.module)) {
      return res.status(403).json({ error: 'Tutor not assigned to this module.' });
    }
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    // Accept only videos, PDFs, audios
    const allowedTypes = ['video/', 'application/pdf', 'audio/'];
    if (!allowedTypes.some(type => req.file.mimetype.startsWith(type))) {
      return res.status(400).json({ error: 'Invalid file type.' });
    }
    const { originalname, mimetype, buffer } = req.file;
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    const uploadStream = gfsBucket.openUploadStream(originalname, {
      contentType: mimetype,
      metadata: { topicId: topic._id, uploadedBy: user.email }
    });
    readable.pipe(uploadStream)
      .on('error', (err) => {
        console.error(err);
        res.status(500).json({ error: 'Upload failed' });
      })
      .on('finish', async () => {
        // Attach resource to the latest response by this tutor
        const lastResponse = topic.responses.filter(r => r.tutor === user.email).slice(-1)[0];
        if (lastResponse) {
          lastResponse.resources.push(uploadStream.id.toString());
          await topic.save();
        }
        res.json({ message: 'Resource uploaded', id: uploadStream.id });
      });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

