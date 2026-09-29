// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Import database connection function
const connectDB = require('./config/db');

// Import the error handling middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// Middleware Configuration
// ==========================================

// 1. CORS: Allows our React frontend to make requests to this backend
app.use(cors());

// 2. JSON Parser: Allows our backend to read JSON data sent in request bodies
app.use(express.json());

// ==========================================
// Routes
// ==========================================

// Basic route for testing if the server is up
app.get('/', (req, res) => {
  res.send('AutoCare API is running...');
});

// Health-check API endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: "AutoCare Intelligence API is running"
  });
});

// We will add more routes here in future phases (e.g., auth, users)

// ==========================================
// Error Handling
// ==========================================

// 3. Error Handler: This must be the last middleware used
app.use(errorHandler);

// ==========================================
// Start Database & Server
// ==========================================

const startServer = async () => {
  try {
    // 1. Connect to MongoDB first
    await connectDB();
    
    // 2. Start the Express server only after successful connection
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();