const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/error');
const { ensureBucketExists } = require('./utils/minio');
// Import routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');
const placementTestRoutes = require('./routes/placementTest');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json({ charset: 'utf8' }));
app.use(express.urlencoded({ extended: true, charset: 'utf8' }));
app.use(
  cors({
    origin: [
      "http://localhost:3000", // Next.js
      "http://localhost:19006", // Expo/React Native web
      "https://admin.qazaqshapp.kz", // Production admin
      "https://qazaqshapp.kz", // Production API
    ],
    credentials: true,
  },
)
);
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/admin', adminRoutes)
app.use('/api/users', userRoutes);
app.use('/api/placement-test', placementTestRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Language Learning API is running');
});

// Error handler middleware
app.use(errorHandler);

// Initialize MinIO bucket
const initializeMinIO = async () => {
  try {
    const bucketName = process.env.MINIO_BUCKET_NAME || 'media';
    await ensureBucketExists(bucketName);
    console.log('MinIO bucket initialized successfully');
  } catch (error) {
    console.error('MinIO initialization error:', error);
  }
};

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Initialize MinIO
    await initializeMinIO();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  }); 