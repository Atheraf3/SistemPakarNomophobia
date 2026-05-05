// Fix: Force Node.js to use Google DNS & IPv4 (fixes querySrv ECONNREFUSED on MongoDB Atlas)
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

// Routes imports
const diagnosisRoutes = require('./src/routes/diagnosisRoutes');
const authRoutes = require('./src/routes/authRoutes');
const { errorHandler } = require('./src/middlewares/errorMiddleware');

// Load environment variables
dotenv.config();

const app = express();

// Security middlewares
app.use(helmet());

// Logging
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Basic Middlewares
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
    origin: clientUrl,
    credentials: true // to allow cookies
}));
app.use(express.json());
app.use(cookieParser());

// Database connection
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/skripsi_db';
        const conn = await mongoose.connect(mongoUri, {
            family: 4,                      // Force IPv4
            serverSelectionTimeoutMS: 10000, // Timeout 10 detik
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

connectDB();

// Basic route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// API Routes
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tingkat', require('./src/routes/tingkatRoutes'));
app.use('/api/gejala', require('./src/routes/gejalaRoutes'));
app.use('/api/knowledge-base', require('./src/routes/knowledgeBaseRoutes'));

// Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5151;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// Trigger nodemon restart 2
