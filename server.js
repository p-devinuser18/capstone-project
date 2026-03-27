const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors());

// Response compression
app.use(compression());

// Rate limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// JSON body parser
app.use(express.json({ limit: '100kb' }));

/**
 * Root endpoint
 * @route GET /
 * @returns {object} Welcome message
 */
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Express server' });
});

// Product routes
app.use('/api', productRoutes);

/**
 * Global error handling middleware
 * Catches unhandled errors and returns a consistent JSON response.
 */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? undefined : err.message,
    });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
