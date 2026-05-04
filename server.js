const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { connectDB } = require('./config/db');
const backupService = require('./services/backupService');

dotenv.config({ path: path.resolve(__dirname, '.env') });

connectDB();

backupService.initialize().catch((err) => {
  console.error('Failed to initialize backup service:', err);
});

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const academicRoutes = require('./routes/academicRoutes');
const groupRoutes = require('./routes/groupRoutes');
const proposalRoutes = require('./routes/proposalRoutes');
const progressRoutes = require('./routes/progressRoutes');
const finalDraftRoutes = require('./routes/finalDraftRoutes');
const defenseRoutes = require('./routes/defenseRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const sectionRoutes = require('./routes/sectionRoutes');

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const normalizeOrigin = (origin) => origin?.replace(/\/$/, '');

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://fyp-frontend-9ey8.onrender.com',
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map((url) => url.trim()) : [])
]
  .filter(Boolean)
  .map(normalizeOrigin);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(normalizeOrigin(origin))) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    optionsSuccessStatus: 200
  })
);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/final-drafts', finalDraftRoutes);
app.use('/api/defense', defenseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/sections', sectionRoutes);

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'FYP Backend API is running!',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/auth',
      '/api/users',
      '/api/academic',
      '/api/groups',
      '/api/proposals',
      '/api/progress',
      '/api/final-drafts',
      '/api/defense',
      '/api/notifications',
      '/api/inquiries',
      '/api/upload',
      '/api/sections',
      '/api/health'
    ]
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const { sequelize } = require('./config/db');
    await sequelize.authenticate();

    res.json({
      success: true,
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'error',
      database: 'disconnected',
      error: error.message
    });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot find ${req.originalUrl} on this server!`
  });
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`Health endpoint: http://localhost:${PORT}/api/health`);
});

process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
