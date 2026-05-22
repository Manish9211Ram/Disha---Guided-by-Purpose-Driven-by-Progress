import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, UserMinus, Shield, ShieldCheck, ShieldAlert, AlertCircle } from 'lucide-react';

const UserManagementTab = ({ onUserChange }) => {
  const { apiCall, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/admin/users');
      setUsers(data);
      setError('');
    } catch (err) {
      setError('Could not retrieve users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    // Safety check: Cannot deactivate self
    if (String(userId) === String(currentUser._id) && currentStatus === 'Active') {
      alert('You cannot deactivate your own admin account.');
      return;
    }

    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const updatedUser = await apiCall(`/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus })
      });
      setUsers(users.map(u => u._id === userId ? updatedUser : u));
      if (onUserChange) onUserChange();
    } catch (err) {
      setError(err.message || 'Failed to update user status.');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    // Safety check: Cannot delete self
    if (String(userId) === String(currentUser._id)) {
      alert('You cannot delete your own admin account.');
      return;
    }

    if (!window.confirm(`WARNING: Deleting user "${username}" will also permanently delete all of their tasks. Do you want to proceed?`)) {
      return;
    }

    try {
      await apiCall(`/admin/users/${userId}`, { method: 'DELETE' });
      setUsers(users.filter(u => u._id !== userId));
      if (onUserChange) onUserChange();
    } catch (err) {
      setError(err.message || 'Failed to delete user.');
    }
  };

  // Filter users by search
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '4px' }}>User Directory</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Manage role configurations, toggle user access status, and remove user accounts.</p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ margin: 0 }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="controls-row" style={{ margin: 0 }}>
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="Search users by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading directory...</div>
      ) : filteredUsers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No matching users found.</div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Account Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => {
                const isSelf = String(user._id) === String(currentUser._id);
                return (
                  <tr key={user._id} style={{ opacity: user.status === 'Inactive' ? 0.7 : 1 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}>
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{user.username}</span>
                            {isSelf && <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', borderRadius: '4px' }}>You</span>}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {user._id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{user.email}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                        {user.role === 'Admin' ? (
                          <>
                            <ShieldCheck size={16} style={{ color: 'var(--accent-purple)' }} />
                            <span style={{ color: 'var(--accent-purple)', fontWeight: '600' }}>Admin</span>
                          </>
                        ) : (
                          <>
                            <Shield size={16} style={{ color: 'var(--text-secondary)' }} />
                            <span style={{ color: 'var(--text-secondary)' }}>User</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(user._id, user.status)}
                        className={`status-badge ${user.status === 'Active' ? 'status-active' : 'status-inactive'}`}
                        style={{ border: 'none', cursor: isSelf ? 'not-allowed' : 'pointer' }}
                        disabled={isSelf}
                        title={isSelf ? "You cannot deactivate yourself" : `Click to set ${user.status === 'Active' ? 'Inactive' : 'Active'}`}
                      >
                        {user.status}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteUser(user._id, user.username)}
                        className="btn btn-secondary btn-sm btn-icon"
                        style={{ 
                          border: 'none', 
                          background: isSelf ? 'rgba(255, 255, 255, 0.02)' : 'rgba(239, 68, 68, 0.08)', 
                          color: isSelf ? 'var(--text-muted)' : '#f87171',
                          cursor: isSelf ? 'not-allowed' : 'pointer'
                        }}
                        disabled={isSelf}
                        title={isSelf ? "You cannot delete yourself" : "Delete user and tasks"}
                      >
                        <UserMinus size={14} />
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

export default UserManagementTab;
