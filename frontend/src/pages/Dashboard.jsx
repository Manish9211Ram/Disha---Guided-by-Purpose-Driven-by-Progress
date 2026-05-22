import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import UserDashboard from '../components/UserDashboard';
import UserManagementTab from '../components/UserManagementTab';
import TaskMonitoringTab from '../components/TaskMonitoringTab';
import ActivityLogsTab from '../components/ActivityLogsTab';
import AnalyticsCards from '../components/AnalyticsCards';
import { Menu, X, ShieldAlert, LogOut, Layout } from 'lucide-react';

const Dashboard = () => {
  const { user, apiCall, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tasks');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Fetch admin global stats
  const fetchGlobalStats = async () => {
    if (!user || user.role !== 'Admin') return;
    
    try {
      setLoadingAnalytics(true);
      const [users, tasks] = await Promise.all([
        apiCall('/admin/users'),
        apiCall('/admin/tasks')
      ]);

      const completed = tasks.filter(t => t.status === 'Completed').length;
      const pending = tasks.filter(t => t.status === 'Pending').length;

      setAnalytics({
        totalUsers: users.length,
        totalTasks: tasks.length,
        completedTasks: completed,
        pendingTasks: pending
      });
    } catch (err) {
      console.error('Error fetching global analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchGlobalStats();
  }, [user]);

  if (authLoading || !user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-secondary)' }}>
        Loading account portal...
      </div>
    );
  }

  const isAdmin = user.role === 'Admin';

  // Enforce unauthorized tab protection
  const renderContent = () => {
    switch (activeTab) {
      case 'tasks':
        return <UserDashboard />;
      case 'users':
        return isAdmin ? <UserManagementTab onUserChange={fetchGlobalStats} /> : <AccessDenied />;
      case 'monitoring':
        return isAdmin ? <TaskMonitoringTab onTaskChange={fetchGlobalStats} /> : <AccessDenied />;
      case 'logs':
        return isAdmin ? <ActivityLogsTab /> : <AccessDenied />;
      default:
        return <UserDashboard />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'tasks': return 'My Task Space';
      case 'users': return 'System Users Directory';
      case 'monitoring': return 'All Active Tasks Monitor';
      case 'logs': return 'Security & Event Audit Logs';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={(tab) => {
        setActiveTab(tab);
        setMobileSidebarOpen(false);
      }} />

      {/* Slide-out Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 8, 15, 0.8)',
            backdropFilter: 'blur(4px)',
            zIndex: 999
          }}
        />
      )}

      {/* Slide-out Mobile Sidebar content */}
      <div style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: mobileSidebarOpen ? 0 : '-100%',
        width: 'var(--sidebar-width)',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--card-border)',
        zIndex: 1000,
        transition: 'left var(--transition-normal)',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ fontWeight: '800', color: 'var(--primary)' }}>Disha Menu</div>
          <button 
            onClick={() => setMobileSidebarOpen(false)} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>
        <Sidebar activeTab={activeTab} setActiveTab={(tab) => {
          setActiveTab(tab);
          setMobileSidebarOpen(false);
        }} />
      </div>

      {/* Main View Area */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Hamburger for Mobile */}
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--card-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
              className="mobile-menu-trigger"
            >
              <Menu size={20} />
            </button>
            <div className="header-title">
              <h1>{getPageTitle()}</h1>
            </div>
          </div>

          <div className="header-user">
            <div className="user-badge">
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{user.username}</span>
                <span className="user-role">{user.role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Global Analytics Section (Admin only, shown above specific tabs or when on dashboard view) */}
        {isAdmin && activeTab !== 'tasks' && (
          <AnalyticsCards stats={analytics} />
        )}

        {/* Active tab content */}
        <div style={{ flexGrow: 1 }}>
          {renderContent()}
        </div>
      </main>

      <style>{`
        .mobile-menu-trigger {
          display: none;
        }
        @media (max-width: 767px) {
          .mobile-menu-trigger {
            display: flex !important;
          }
          .main-content {
            margin-left: 0 !important;
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

// Access Denied Fallback Component
const AccessDenied = () => (
  <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
    <ShieldAlert size={48} style={{ color: 'var(--danger)' }} />
    <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Unauthorized Action</h2>
    <p style={{ maxWidth: '400px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
      You do not have the required administrative credentials to access this portal page. Please return to your task workspace.
    </p>
  </div>
);

export default Dashboard;
