const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://sikar-nmp.vercel.app',
    'https://nomophobiacek.online',
    'https://www.nomophobiacek.online',
    ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(o => o.trim()) : []),
];

module.exports = allowedOrigins;
