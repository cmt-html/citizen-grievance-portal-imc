const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment config
dotenv.config();

const app = express();

// CORS — allow the frontend Vercel domain and localhost for dev
const allowedOrigins = [
    'https://citizen-grievance-portal-imc.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, Postman, mobile apps)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS policy blocked origin: ${origin}`), false);
    },
    credentials: true,
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(morgan('dev'));

// Health probe (useful for debugging Vercel deployments)
app.get('/api/health', async (req, res) => {
    try {
        await connectDB();
        res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
    } catch (err) {
        res.status(500).json({ status: 'error', db: 'disconnected', error: err.message });
    }
});

// Routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const departmentRoutes = require('./routes/departmentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/departments', departmentRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Citizen Grievance Portal API is running!', version: '1.0.0' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Start Server (Only for local development — Vercel exports the app directly)
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}

module.exports = app;
