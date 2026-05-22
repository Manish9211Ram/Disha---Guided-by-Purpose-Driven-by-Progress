const User = require('../models/User');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const { populateTasks } = require('./taskController');

// @desc    Get all users (excluding passwords)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    // Exclude password from the response
    const sanitizedUsers = users.map(user => {
      const u = user.toObject ? user.toObject() : { ...user };
      delete u.password;
      return u;
    });
    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Admin fetch users error:', error);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
};

// @desc    Delete user and their tasks
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const userIdToDelete = req.params.id;

    // Safety check: Admin cannot delete themselves
    if (String(userIdToDelete) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    const user = await User.findById(userIdToDelete);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user
    await User.findByIdAndDelete(userIdToDelete);

    // Delete all tasks associated with this user
    const tasksDeleted = await Task.find({ user: userIdToDelete });
    for (const task of tasksDeleted) {
      await Task.findByIdAndDelete(task._id);
    }

    // Log Activity
    await ActivityLog.create({
      userId: req.user._id,
      username: req.user.username,
      action: 'Status Change',
      details: `Admin deleted user account: "${user.username}" (email: ${user.email}) along with ${tasksDeleted.length} tasks`
    });

    res.json({ message: `User "${user.username}" and their tasks have been deleted successfully.` });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ message: 'Server error deleting user.' });
  }
};

// @desc    Update user status (Active/Inactive)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const userIdToUpdate = req.params.id;
    const { status } = req.body;

    if (!status || !['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ message: 'Please provide a valid status: Active or Inactive' });
    }

    // Safety check: Admin cannot deactivate themselves
    if (String(userIdToUpdate) === String(req.user._id) && status === 'Inactive') {
      return res.status(400).json({ message: 'You cannot deactivate your own admin account.' });
    }

    const user = await User.findById(userIdToUpdate);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const previousStatus = user.status;
    const updatedUser = await User.findByIdAndUpdate(
      userIdToUpdate,
      { status },
      { new: true }
    );

    // Log Activity
    await ActivityLog.create({
      userId: req.user._id,
      username: req.user.username,
      action: 'Status Change',
      details: `Admin updated status of user "${user.username}" from "${previousStatus}" to "${status}"`
    });

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status
    });
  } catch (error) {
    console.error('Admin update user status error:', error);
    res.status(500).json({ message: 'Server error updating user status.' });
  }
};

// @desc    Get all tasks in the system
// @route   GET /api/admin/tasks
// @access  Private/Admin
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({});
    const populatedTasks = await populateTasks(tasks);
    res.json(populatedTasks);
  } catch (error) {
    console.error('Admin fetch tasks error:', error);
    res.status(500).json({ message: 'Server error fetching all tasks.' });
  }
};

// @desc    Get all activity logs
// @route   GET /api/admin/logs
// @access  Private/Admin
const getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find({});
    
    // Sort logs manually or via mongo query: newest first
    const sortedLogs = logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(sortedLogs);
  } catch (error) {
    console.error('Admin fetch logs error:', error);
    res.status(500).json({ message: 'Server error fetching activity logs.' });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  updateUserStatus,
  getAllTasks,
  getActivityLogs
};
