const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, updateUserStatus, getAllTasks, getActivityLogs } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// All admin routes require authentication and admin privileges
router.use(protect);
router.use(admin);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/status', updateUserStatus);
router.get('/tasks', getAllTasks);
router.get('/logs', getActivityLogs);

module.exports = router;
