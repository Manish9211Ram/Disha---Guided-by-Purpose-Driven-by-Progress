import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, ClipboardList, RefreshCw, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

const ActivityLogsTab = () => {
  const { apiCall } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search, Filter, Pagination
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/admin/logs');
      setLogs(data);
      setError('');
    } catch (err) {
      setError('Could not retrieve activity logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Reset pagination when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, actionFilter]);

  const getTagClass = (action) => {
    switch (action) {
      case 'Login Success': return 'tag-login-success';
      case 'Login Failure': return 'tag-login-failure';
      case 'Task Creation': return 'tag-task-create';
      case 'Task Update': return 'tag-task-update';
      case 'Task Deletion': return 'tag-task-delete';
      case 'Status Change': return 'tag-status-change';
      default: return '';
    }
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.username.toLowerCase().includes(search.toLowerCase()) || 
                          log.details.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === 'All' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  // Paginate logs
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '4px' }}>System Activity Logs</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Chronological record of login attempts, task updates, database mutations, and system changes.</p>
          </div>
          <button 
            onClick={fetchLogs} 
            className="btn btn-secondary btn-sm"
            style={{ padding: '8px 12px' }}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Refresh</span>
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ margin: 0 }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Filters */}
        <div className="controls-row" style={{ margin: 0 }}>
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="Search by details or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Action:</span>
            <select
              className="filter-select"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="All">All Actions</option>
              <option value="Login Success">Login Success</option>
              <option value="Login Failure">Login Failure</option>
              <option value="Task Creation">Task Creation</option>
              <option value="Task Update">Task Update</option>
              <option value="Task Deletion">Task Deletion</option>
              <option value="Status Change">Status Change</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading audit logs...</div>
      ) : currentLogs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No activity logs recorded.</div>
      ) : (
        <>
          <div className="table-container">
            <table className="custom-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action Type</th>
                  <th>Actor / Username</th>
                  <th>Event Description</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.map(log => (
                  <tr key={log._id}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                      {formatTimestamp(log.createdAt)}
                    </td>
                    <td>
                      <span className={`action-tag ${getTagClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: '600' }}>{log.username}</span>
                    </td>
                    <td style={{ color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="pagination">
              <span className="pagination-info">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredLogs.length)} of {filteredLogs.length} logs
              </span>
              <div className="pagination-controls">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary btn-sm btn-icon"
                  style={{ border: 'none', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronLeft size={16} />
                </button>
                
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className="btn btn-sm"
                    style={{
                      border: 'none',
                      background: currentPage === page ? 'var(--primary)' : 'var(--bg-tertiary)',
                      color: 'white',
                      minWidth: '28px',
                      padding: '4px 8px'
                    }}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary btn-sm btn-icon"
                  style={{ border: 'none', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ActivityLogsTab;
