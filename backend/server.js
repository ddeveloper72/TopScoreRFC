const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');
const gameRoutes = require('./routes/games');
const matchRoutes = require('./routes/matches');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});

// Security middleware
app.use(helmet());
app.use(compression());
app.use(limiter);

// CORS configuration (supports multiple origins)
const parseOrigins = () => {
    const list = process.env.CLIENT_URLS || process.env.CLIENT_URL || '';
    const items = list
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    // Always include localhost defaults for dev convenience
    const defaults = ['http://localhost:4200', 'http://127.0.0.1:4200'];
    for (const d of defaults) {
        if (!items.includes(d)) items.push(d);
    }
    return items;
};

const allowedOrigins = new Set(parseOrigins());

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true); // non-browser or same-origin
            if (allowedOrigins.has(origin)) return callback(null, true);
            return callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API routes
app.use('/api/games', gameRoutes);
app.use('/api/matches', matchRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({
        message: 'Rugby Score Tracker API',
        version: '1.0.0',
        endpoints: {
            games: '/api/games',
            health: '/health'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        message: 'Route not found',
        path: req.originalUrl
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🏉 Rugby Score Tracker API running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}`);
    console.log(`📊 Health Check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});
