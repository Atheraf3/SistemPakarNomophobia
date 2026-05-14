const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
    try {
        // Fix: Force Node.js to use Google DNS & IPv4 (fixes querySrv ECONNREFUSED on MongoDB Atlas)
        dns.setDefaultResultOrder('ipv4first');
        dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

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

module.exports = connectDB;
