const mongoose = require('mongoose');

// Cache the connection across serverless invocations
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    // Return cached connection if already connected
    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    // Reset if a bad state
    if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
        cached.conn = null;
        cached.promise = null;
    }

    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not set. Please add it to Vercel Environment Variables.');
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000, // 10s is plenty for MongoDB Atlas
            socketTimeoutMS: 45000,
            heartbeatFrequencyMS: 10000,
        };
        console.log('🔄 Attempting new MongoDB connection...');
        cached.promise = mongoose.connect(process.env.MONGODB_URI, opts)
            .then((mongooseInstance) => {
                console.log('✅ MongoDB Connected Successfully');
                return mongooseInstance;
            })
            .catch((err) => {
                console.error('❌ MongoDB Connection Failed:', err.message);
                cached.promise = null; // Reset for retry on next request
                throw err;
            });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        cached.promise = null;
        cached.conn = null;
        throw error;
    }
};

module.exports = connectDB;
