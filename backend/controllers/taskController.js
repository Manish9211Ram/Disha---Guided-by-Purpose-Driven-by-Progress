const Task = require('../models/Task');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// Helper to populate user details in tasks (works for both Mongoose and Mock DB)
const populateTasks = async (tasks) => {
  if (Array.isArray(tasks)) {
    return Promise.all(tasks.map(t => populateSingleTask(t)));
  }
  return populateSingleTask(tasks);
};

const populateSingleTask = async (task) => {
  if (!task) return null;
  // If it's a mongoose object, convert to plain JSON
  const taskObj = task.toObject ? task.toObject() : { ...task };
  
  if (taskObj.user && typeof taskObj.user === 'object' && taskObj.user.username) {
    // Already populated by Mongoose
    return taskObj;
  }
  
  const user = await User.findById(taskObj.user);
  taskObj.user = user ? { _id: user._id, username: user.username, email: user.email } : null;
  return taskObj;
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Task title is required.' });
    }

    const task = await Task.create({
      title,
      description: description || '',
      status: 'Pending',
      user: req.user._id
    });

    // Log Activity
    await ActivityLog.create({
      userId: req.user._id,
      username: req.user.username,
      action: 'Task Creation',
      details: `Created task: "${title}"`
    });

    const populatedTask = await populateTasks(task);
    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({ message: 'Server error creating task.', error: error.message });
  }
};

// @desc    Get user's tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    // Always return only the logged in user's tasks
    const tasks = await Task.find({ user: req.user._id });
    const populatedTasks = await populateTasks(tasks);
    res.json(populatedTasks);
  } catch (error) {
    console.error('Fetch tasks error:', error);
    res.status(500).json({ message: 'Server error fetching tasks.' });
  }
};

// @desc    Update task status or text
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify task ownership (only owner can update tasks)
    if (String(task.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this task.' });
    }

    const previousStatus = task.status;
    const previousTitle = task.title;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title: title !== undefined ? title : task.title,
        description: description !== undefined ? description : task.description,
        status: status !== undefined ? status : task.status
      },
      { new: true }
    );

    // Track status/details changes
    let changeDetails = `Updated task "${updatedTask.title}"`;
    if (previousStatus !== updatedTask.status) {
      changeDetails += ` status from "${previousStatus}" to "${updatedTask.status}"`;
    }
    if (previousTitle !== updatedTask.title) {
      changeDetails += ` title from "${previousTitle}" to "${updatedTask.title}"`;
    }

    // Log Activity
    await ActivityLog.create({
      userId: req.user._id,
      username: req.user.username,
      action: 'Task Update',
      details: changeDetails
    });

    const populatedTask = await populateTasks(updatedTask);
    res.json(populatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error updating task.', error: error.message });
  }
};

// @desc    Delete task (User deletes own, Admin deletes any)
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isAdmin = req.user.role === 'Admin';
    const isOwner = String(task.user) === String(req.user._id);

    // Enforce authorization: Admin or Owner only
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to delete this task.' });
    }

    // Get owner details for activity logs
    const owner = await User.findById(task.user);
    const ownerUsername = owner ? owner.username : 'Unknown User';

    await Task.findByIdAndDelete(req.params.id);

    // Log Activity
    const details = isAdmin && !isOwner
      ? `Admin deleted task "${task.title}" (created by: ${ownerUsername})`
      : `Deleted own task: "${task.title}"`;

    await ActivityLog.create({
      userId: req.user._id,
      username: req.user.username,
      action: 'Task Deletion',
      details
    });

    res.json({ message: 'Task removed successfully.' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error deleting task.' });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  populateTasks // Exported to be shared with admin controller
};
