const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./src/config/swagger.json');
const connectDB = require('./src/config/db');
const { errorHandler } = require('./src/middlewares/errorMiddleware');
const corsOptions = require('./src/config/corsOptions');

//dotenv
dotenv.config();
const app = express();
const PORT = process.env.PORT;

//helmet
app.use(helmet());

//morgan
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

//rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100 
});
app.use('/api/', limiter); 

app.use(cors(corsOptions));

//body parser
app.use(express.json());
app.use(cookieParser());

//swagger
app.use(
    '/api-docs',
    helmet({ contentSecurityPolicy: false }),
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
        customSiteTitle: 'API Sistem Pakar Nomophobia',
        swaggerOptions: { persistAuthorization: true },
        customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css',
        customJs: [
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js',
        ]
    })
);

//routes
app.get('/', (req, res) => res.send('API is running'));
app.use('/api/diagnosis', require('./src/routes/diagnosisRoutes'));
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/tingkat', require('./src/routes/tingkatRoutes'));
app.use('/api/gejala', require('./src/routes/gejalaRoutes'));
app.use('/api/knowledge-base', require('./src/routes/knowledgeBaseRoutes'));
app.use('/api/config', require('./src/routes/configRoutes'));
app.use('/api/cf-options', require('./src/routes/cfOptionRoutes'));

//error handler
app.use(errorHandler);

//connect db
connectDB();

//start server
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
