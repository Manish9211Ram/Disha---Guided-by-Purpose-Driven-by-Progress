const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_123_456');

      // Get user from the database
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Check if user status is Inactive
      if (user.status === 'Inactive') {
        return res.status(403).json({ message: 'Your account is deactivated. Please contact your system administrator.' });
      }

      // Attach user to the request object
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin permissions required.' });
  }
};

module.exports = { protect, admin };
