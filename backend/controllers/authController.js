const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_key_123_456', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide username, email, and password.' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      username,
      email,
      password: passwordHash,
      role: 'User', // default role
      status: 'Active' // default status
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data provided.' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Log login failure
      await ActivityLog.create({
        userId: null,
        username: email || 'unknown',
        action: 'Login Failure',
        details: `Failed login attempt: Email does not exist`
      });
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check if account is active
    if (user.status === 'Inactive') {
      await ActivityLog.create({
        userId: user._id,
        username: user.username,
        action: 'Login Failure',
        details: `Blocked login attempt: Account status is Inactive`
      });
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact an admin.' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // Log login success
      await ActivityLog.create({
        userId: user._id,
        username: user.username,
        action: 'Login Success',
        details: 'User logged in successfully'
      });

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        token: generateToken(user._id)
      });
    } else {
      // Log login failure
      await ActivityLog.create({
        userId: user._id,
        username: user.username,
        action: 'Login Failure',
        details: 'Failed login attempt: Invalid password'
      });

      res.status(401).json({ message: 'Invalid email or password.' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};
