const mongoose = require('mongoose');

// Cache the connection across serverless invocations
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGODB_URI, {
            bufferCommands: false,
        }).then((mongoose) => mongoose);
    }
    try {
        cached.conn = await cached.promise;
        console.log(`MongoDB Connected: ${cached.conn.connection.host}`);
        return cached.conn;
    } catch (error) {
        cached.promise = null;
        console.error(`MongoDB Connection Error: ${error.message}`);
        throw error; // Let the route handler return 500, don't crash the process
    }
};

module.exports = connectDB;
