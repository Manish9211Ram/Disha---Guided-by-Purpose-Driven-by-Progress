const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanager';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI);
    
    // Explicitly verify the connection is active by pinging the database
    if (!mongoose.connection.db) {
      throw new Error('Connection failed - DB object undefined');
    }
    await mongoose.connection.db.admin().ping();
    
    console.log('MongoDB connected successfully!');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = {
  connectDB
};

