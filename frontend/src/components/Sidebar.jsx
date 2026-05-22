import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, CheckSquare, Users, Layout, ClipboardList, LogOut } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const isAdmin = user.role === 'Admin';

  const menuItems = [
    { id: 'tasks', label: 'My Tasks', icon: CheckSquare, adminOnly: false }
  ];

  const adminItems = [
    { id: 'users', label: 'User Management', icon: Users, adminOnly: true },
    { id: 'monitoring', label: 'Task Monitoring', icon: Layout, adminOnly: true },
    { id: 'logs', label: 'Activity Logs', icon: ClipboardList, adminOnly: true }
  ];

  return (
    <aside className="sidebar glass-panel" style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 16px',
      borderRadius: 0,
      borderRight: '1px solid var(--card-border)',
      borderTop: 'none',
      borderBottom: 'none',
      borderLeft: 'none'
    }}>
      <div>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '8px' }}>
          <Shield size={24} className="text-primary" />
          <span style={{ fontSize: '1.2rem', fontWeight: '800', background: 'linear-gradient(135deg, var(--primary), var(--accent-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Disha</span>
        </div>

        {/* Regular Menu */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 16px',
                  background: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  textAlign: 'left'
                }}
                className={!isActive ? 'hover-menu-item' : ''}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Admin Section Separator */}
        {isAdmin && (
          <>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              margin: '24px 0 8px 8px',
              letterSpacing: '0.05em'
            }}>Admin Control</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {adminItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                      padding: '12px 16px',
                      background: isActive ? 'var(--accent-purple)' : 'transparent',
                      color: isActive ? '#ffffff' : 'var(--text-secondary)',
                      border: 'none',
                      borderRadius: 'var(--border-radius-sm)',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      textAlign: 'left'
                    }}
                    className={!isActive ? 'hover-menu-item' : ''}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* User Profile Card at Bottom */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        paddingTop: '16px',
        borderTop: '1px solid var(--card-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="user-avatar" style={{ width: '36px', height: '36px', fontSize: '0.95rem' }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.username}</div>
            <div style={{ fontSize: '0.75rem', color: user.role === 'Admin' ? 'var(--accent-purple)' : 'var(--text-secondary)', fontWeight: '500' }}>{user.role}</div>
          </div>
        </div>

        <button onClick={logout} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          padding: '10px',
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#f87171',
          border: '1px solid rgba(239, 68, 68, 0.15)',
          borderRadius: 'var(--border-radius-sm)',
          fontSize: '0.85rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)'
        }}
        className="logout-button"
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>

      <style>{`
        .hover-menu-item:hover {
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-primary);
          transform: translateX(2px);
        }
        .logout-button:hover {
          background: var(--danger) !important;
          color: white !important;
        }
        /* Mobile sidebar rules */
        @media (max-width: 767px) {
          aside.sidebar {
            display: none !important; /* Hide sidebar on mobile, let header handle mobile view if any, or simple layout */
          }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
