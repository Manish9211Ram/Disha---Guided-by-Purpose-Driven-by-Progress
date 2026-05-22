import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Trash2, ShieldAlert, CheckCircle2, Clock, Filter, AlertCircle } from 'lucide-react';

const TaskMonitoringTab = ({ onTaskChange }) => {
  const { apiCall } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('All');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksData, usersData] = await Promise.all([
        apiCall('/admin/tasks'),
        apiCall('/admin/users')
      ]);
      setTasks(tasksData);
      setUsers(usersData);
      setError('');
    } catch (err) {
      setError('Could not retrieve task logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteTask = async (taskId, taskTitle) => {
    if (!window.confirm(`Are you sure you want to delete task "${taskTitle}"?`)) return;

    try {
      await apiCall(`/tasks/${taskId}`, { method: 'DELETE' });
      setTasks(tasks.filter(t => t._id !== taskId));
      if (onTaskChange) onTaskChange();
    } catch (err) {
      setError('Failed to delete task.');
    }
  };

  // Filter tasks based on Search, Status, and User selection
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    
    // Safety check in case user is deleted/null
    const taskUserId = task.user ? (task.user._id || task.user) : null;
    const matchesUser = userFilter === 'All' || String(taskUserId) === String(userFilter);

    return matchesSearch && matchesStatus && matchesUser;
  });

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '4px' }}>Global Task Monitoring</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Review all user-created tasks, filter by owner or status, and moderate content.</p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ margin: 0 }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Filter Controls Grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div className="search-box" style={{ flexGrow: 2, minWidth: '240px' }}>
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="Search tasks by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', flexGrow: 1 }}>
            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1, minWidth: '140px' }}>
              <Filter size={16} style={{ color: 'var(--text-muted)' }} />
              <select
                className="filter-select"
                style={{ width: '100%', padding: '10px' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* User Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1, minWidth: '160px' }}>
              <select
                className="filter-select"
                style={{ width: '100%', padding: '10px' }}
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <option value="All">All Users</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.username} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading task directory...</div>
      ) : filteredTasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No matching tasks found.</div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Task Title & Details</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Created Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(task => {
                const ownerName = task.user ? task.user.username : 'Deleted User';
                const ownerEmail = task.user ? task.user.email : '';
                return (
                  <tr key={task._id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{task.title}</div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {task.description || 'No description provided.'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: '500' }}>{ownerName}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ownerEmail}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${task.status === 'Completed' ? 'status-completed' : 'status-pending'}`}>
                        {task.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteTask(task._id, task.title)}
                        className="btn btn-secondary btn-sm btn-icon"
                        style={{ border: 'none', background: 'rgba(239, 68, 68, 0.08)', color: '#f87171' }}
                        title="Delete task (Admin action)"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TaskMonitoringTab;
