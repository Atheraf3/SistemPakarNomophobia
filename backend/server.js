const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/db');
const { errorHandler } = require('./src/middlewares/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

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
    credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// Basic route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// API Routes
app.use('/api/diagnosis', require('./src/routes/diagnosisRoutes'));
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/tingkat', require('./src/routes/tingkatRoutes'));
app.use('/api/gejala', require('./src/routes/gejalaRoutes'));
app.use('/api/knowledge-base', require('./src/routes/knowledgeBaseRoutes'));
app.use('/api/config', require('./src/routes/configRoutes'));
app.use('/api/cf-options', require('./src/routes/cfOptionRoutes'));

// Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5151;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
