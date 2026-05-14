const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        
        if (mongoUri && mongoUri.includes('+srv')) {
            dns.setDefaultResultOrder('ipv4first');
            dns.setServers(['8.8.8.8', '1.1.1.1']);
        }

        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000, 
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
    }
};

module.exports = connectDB;