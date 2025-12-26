// ⚠️ DEPRECATED - This file is no longer used
// The backend has been restructured for the health monitoring platform
// Please use server.js instead

console.log('\n⚠️  WARNING: index.js is deprecated!\n');
console.log('The backend has been completely restructured.');
console.log('Please use the new entry point:\n');
console.log('  npm run dev  (for development)');
console.log('  npm start    (for production)\n');
console.log('See README.md for complete documentation.\n');

process.exit(1);

const app = express();
const PORT = process.env.PORT || 3000;
const PYTHON_SERVER_URL = process.env.PYTHON_SERVER_URL || 'http://localhost:5000';

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for memory storage (to get base64)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Node.js Backend',
    timestamp: new Date().toISOString(),
  });
});

// Check Python server health
app.get('/api/python-health', async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_SERVER_URL}/health`, {
      timeout: 5000,
    });
    res.json({
      status: 'connected',
      python_server: response.data,
    });
  } catch (error) {
    res.status(503).json({
      status: 'disconnected',
      error: 'Cannot connect to Python server',
      message: error.message,
    });
  }
});

// Prediction endpoint
app.post('/api/predict', upload.single('image'), async (req, res) => {
  console.log("enter process")
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided',
      });
    }

    console.log('📸 Image received:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: `${(req.file.size / 1024).toFixed(2)} KB`,
    });

    // Convert buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    
    console.log('🔄 Sending to Python server...');

    // Send to Python server
    const response = await axios.post(
      `${PYTHON_SERVER_URL}/predict`,
      {
        image: base64Image,
        mimetype: req.file.mimetype,
        filename: req.file.originalname,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    console.log('✅ Prediction received:', response.data);

    // Return prediction result
    res.json(response.data);
  } catch (error) {
    console.error('❌ Error during prediction:', error.message);
    console.error('Error details:', {
      code: error.code,
      response: error.response?.data,
      stack: error.stack
    });

    if (error.response) {
      // Python server responded with error
      return res.status(error.response.status).json({
        success: false,
        error: 'Prediction failed',
        message: error.response.data.message || error.response.data.error,
        details: error.response.data,
      });
    } else if (error.code === 'ECONNREFUSED') {
      // Cannot connect to Python server
      return res.status(503).json({
        success: false,
        error: 'Python server unavailable',
        message: 'Cannot connect to Python server. Make sure it is running on port 5000.',
      });
    } else if (error.code === 'ETIMEDOUT') {
      // Request timeout
      return res.status(504).json({
        success: false,
        error: 'Request timeout',
        message: 'Python server is taking too long to respond.',
      });
    } else {
      // Other errors
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
      });
    }
  }
});

// Batch prediction endpoint (optional)
app.post('/api/predict/batch', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No image files provided',
      });
    }

    console.log(`📸 ${req.files.length} images received for batch prediction`);

    // Convert all files to base64
    const images = req.files.map((file) => ({
      image: file.buffer.toString('base64'),
      mimetype: file.mimetype,
      filename: file.originalname,
    }));

    console.log('🔄 Sending batch to Python server...');

    // Send to Python server
    const response = await axios.post(
      `${PYTHON_SERVER_URL}/predict/batch`,
      { images },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 60000, // 60 second timeout for batch
      }
    );

    console.log('✅ Batch predictions received');

    res.json(response.data);
  } catch (error) {
    console.error('❌ Error during batch prediction:', error.message);

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: 'Batch prediction failed',
        message: error.response.data.message || error.response.data.error,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
      });
    }
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        message: 'Image size should not exceed 10MB',
      });
    }
    return res.status(400).json({
      success: false,
      error: 'Upload error',
      message: error.message,
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Node.js Backend Server Started');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🐍 Python server URL: ${PYTHON_SERVER_URL}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('Available endpoints:');
  console.log(`  GET  /api/health          - Backend health check`);
  console.log(`  GET  /api/python-health   - Python server health check`);
  console.log(`  POST /api/predict         - Single image prediction`);
  console.log(`  POST /api/predict/batch   - Batch image prediction`);
  console.log('');
});
