require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { lookupRouter } = require('./routes/lookup');
const { healthRouter } = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);

// Routes
app.use('/health', healthRouter);
app.use('/lookup', lookupRouter);

// Root route for Vercel
app.get('/', (req, res) => {
  res.json({ 
    message: 'StreamWise API',
    endpoints: {
      health: '/health',
      lookup: '/lookup'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    error: 'INTERNAL_ERROR',
    message: 'An internal error occurred',
  });
});

// Export for Vercel serverless functions
// Vercel will use this as the handler
module.exports = app;

// Run as standalone server for local development (when not on Vercel)
// Check if we're running directly (not imported) and not on Vercel
if (process.env.VERCEL) {
  // On Vercel, just export the app - no need to listen
  console.log('Running on Vercel');
} else if (require.main === module) {
  // Local development - start the server
  app.listen(PORT, () => {
    console.log(`🚀 StreamWise API running on http://localhost:${PORT}`);
  });
}
