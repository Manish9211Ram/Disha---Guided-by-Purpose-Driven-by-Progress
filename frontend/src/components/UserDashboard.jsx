import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, CheckCircle2, Clock, Trash2, Calendar, FileText, CheckSquare, AlertCircle, Pencil, Check, X } from 'lucide-react';

const UserDashboard = () => {
  const { apiCall } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  // Editing state
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const handleStartEdit = (task) => {
    setEditingTaskId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditTitle('');
    setEditDescription('');
  };

  const handleSaveEdit = async (taskId) => {
    if (!editTitle.trim()) return;

    try {
      const updatedTask = await apiCall(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ title: editTitle, description: editDescription })
      });
      setTasks(tasks.map(t => t._id === taskId ? updatedTask : t));
      setEditingTaskId(null);
    } catch (err) {
      setError('Failed to update task.');
    }
  };

  // New Task Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/tasks');
      setTasks(data);
      setError('');
    } catch (err) {
      setError('Could not retrieve tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const newTask = await apiCall('/tasks', {
        method: 'POST',
        body: JSON.stringify({ title, description })
      });
      setTasks([newTask, ...tasks]);
      setTitle('');
      setDescription('');
      setError('');
    } catch (err) {
      setError('Failed to create task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    try {
      const updatedTask = await apiCall(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus })
      });
      setTasks(tasks.map(t => t._id === taskId ? updatedTask : t));
    } catch (err) {
      setError('Failed to update task status.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await apiCall(`/tasks/${taskId}`, { method: 'DELETE' });
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (err) {
      setError('Failed to delete task.');
    }
  };

  // Compute stats for personal view
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const pending = tasks.filter(t => t.status === 'Pending').length;

  // Filter and search
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || 
                          task.description.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'All') return matchesSearch;
    return task.status === filter && matchesSearch;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* User Stats Grid */}
      <div className="analytics-grid">
        <div className="stat-card glass-panel">
          <div className="stat-info">
            <span className="stat-label">My Total Tasks</span>
            <span className="stat-value">{total}</span>
          </div>
          <div className="stat-icon bg-purple">
            <CheckSquare size={24} />
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-info">
            <span className="stat-label">Tasks Completed</span>
            <span className="stat-value">{completed}</span>
          </div>
          <div className="stat-icon bg-emerald">
            <CheckCircle2 size={24} />
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-info">
            <span className="stat-label">Tasks Pending</span>
            <span className="stat-value">{pending}</span>
          </div>
          <div className="stat-icon bg-amber">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Task Dashboard Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }} className="user-dashboard-split">
        {/* Left Column: Create Task Form */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} className="text-primary" />
            <span>Create New Task</span>
          </h2>
          <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="task-title">Task Title</label>
              <input
                type="text"
                id="task-title"
                className="form-input"
                placeholder="e.g. Design app workflows"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="task-desc">Task Description</label>
              <textarea
                id="task-desc"
                className="form-input"
                style={{ minHeight: '80px', resize: 'vertical' }}
                placeholder="Details about the task..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={isSubmitting}>
              <span>{isSubmitting ? 'Creating...' : 'Create Task'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Task List */}
        <div>
          {/* Controls */}
          <div className="controls-row">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="form-input"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filter:</span>
              <select 
                className="filter-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="All">All Tasks</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* List Display */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading your tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <FileText size={48} style={{ color: 'var(--text-muted)' }} />
              <div style={{ fontWeight: '600' }}>No tasks found</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {search || filter !== 'All' ? 'Try adjusting your filters or search query.' : 'Get started by creating your first task above.'}
              </div>
            </div>
          ) : (
            <div className="tasks-grid">
              {filteredTasks.map(task => {
                const isEditing = task._id === editingTaskId;
                return (
                  <div key={task._id} className="task-card glass-panel glass-card-glow">
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <input
                            type="text"
                            className="form-input"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Task Title"
                            required
                          />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <textarea
                            className="form-input"
                            style={{ minHeight: '60px', resize: 'vertical' }}
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Task Description"
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                          <button
                            onClick={handleCancelEdit}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', border: '1px solid var(--card-border)' }}
                          >
                            <X size={14} />
                            <span>Cancel</span>
                          </button>
                          <button
                            onClick={() => handleSaveEdit(task._id)}
                            className="btn btn-primary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px' }}
                          >
                            <Check size={14} />
                            <span>Save</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <div className="task-card-header">
                            <h3 style={{ textDecoration: task.status === 'Completed' ? 'line-through' : 'none', color: task.status === 'Completed' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                              {task.title}
                            </h3>
                            <button 
                              onClick={() => handleToggleStatus(task._id, task.status)}
                              className={`status-badge ${task.status === 'Completed' ? 'status-completed' : 'status-pending'}`}
                              style={{ border: 'none', cursor: 'pointer' }}
                              title="Toggle task completion"
                            >
                              {task.status}
                            </button>
                          </div>
                          <p className="task-desc" style={{ color: task.status === 'Completed' ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                            {task.description || 'No description provided.'}
                          </p>
                        </div>
                        
                        <div className="task-card-footer">
                          <span className="task-owner-info" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} />
                            <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                          </span>
                          <div className="task-actions" style={{ display: 'flex', gap: '6px' }}>
                            <button 
                              onClick={() => handleStartEdit(task)}
                              className="btn btn-secondary btn-sm"
                              style={{ border: 'none', background: 'rgba(99, 102, 241, 0.08)', color: '#818cf8', padding: '6px' }}
                              title="Edit task"
                            >
                              <Pencil size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteTask(task._id)}
                              className="btn btn-secondary btn-sm"
                              style={{ border: 'none', background: 'rgba(239, 68, 68, 0.08)', color: '#f87171', padding: '6px' }}
                              title="Delete task"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @media (min-width: 1024px) {
          .user-dashboard-split {
            grid-template-columns: 1fr 2fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;
