const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Task = require('./models/Task');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Root Endpoint
app.get('/', (req, res) => {
  res.send('RBAC & User Activity Tracking API is running...');
});

// Database seeding function
const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments({});
    if (userCount === 0) {
      console.log('No users found. Seeding initial accounts...');
      
      const salt = await bcrypt.genSalt(10);
      const adminPassword = await bcrypt.hash('admin123', salt);
      const userPassword = await bcrypt.hash('user123', salt);

      // Create Admin
      const admin = await User.create({
        username: 'System Admin',
        email: 'admin@example.com',
        password: adminPassword,
        role: 'Admin',
        status: 'Active'
      });

      // Create User
      const user = await User.create({
        username: 'John Doe',
        email: 'user@example.com',
        password: userPassword,
        role: 'User',
        status: 'Active'
      });

      console.log('Seeded accounts:');
      console.log('  Admin -> admin@example.com / admin123');
      console.log('  User  -> user@example.com / user123');

      // Seed a few tasks for John Doe
      await Task.create({
        title: 'Implement Authorization Middleware',
        description: 'Create protect and admin middlewares to verify JWT tokens and restrict paths based on roles.',
        status: 'Completed',
        user: user._id
      });

      await Task.create({
        title: 'Design Admin Dashboard UI',
        description: 'Draft the layout for user management, task monitoring, activity logging, and analytics.',
        status: 'Pending',
        user: user._id
      });

      await Task.create({
        title: 'Conduct Performance Testing',
        description: 'Verify server performance and query execution speeds under mock databases.',
        status: 'Pending',
        user: user._id
      });

      console.log('Seeded sample tasks for John Doe.');
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to DB (Mongo or fallback to JSON)
  await connectDB();
  
  // Seed database
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
