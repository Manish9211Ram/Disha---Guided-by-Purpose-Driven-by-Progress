const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Can be null for failed login attempts with non-existent users
  },
  username: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['Login Success', 'Login Failure', 'Task Creation', 'Task Update', 'Task Deletion', 'Status Change']
  },
  details: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;

