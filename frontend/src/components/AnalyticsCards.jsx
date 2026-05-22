import React from 'react';
import { Users, FileText, CheckCircle2, Clock } from 'lucide-react';

const AnalyticsCards = ({ stats }) => {
  const { totalUsers = 0, totalTasks = 0, completedTasks = 0, pendingTasks = 0 } = stats;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const pendingRate = totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0;

  const cardData = [
    { label: 'Total Users', value: totalUsers, icon: Users, theme: 'bg-indigo' },
    { label: 'Total Tasks', value: totalTasks, icon: FileText, theme: 'bg-purple' },
    { label: 'Completed Tasks', value: completedTasks, icon: CheckCircle2, theme: 'bg-emerald' },
    { label: 'Pending Tasks', value: pendingTasks, icon: Clock, theme: 'bg-amber' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Cards Grid */}
      <div className="analytics-grid">
        {cardData.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="stat-card glass-panel glass-card-glow animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="stat-info">
                <span className="stat-label">{card.label}</span>
                <span className="stat-value">{card.value}</span>
              </div>
              <div className={`stat-icon ${card.theme}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Section */}
      <div className="glass-panel bar-chart-container animate-fade-in" style={{ animationDelay: '0.2s', marginBottom: '32px' }}>
        <h3 className="bar-chart-title">System Task Analytics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'center' }}>
          
          {/* Progress Rings/Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '500' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Completion Rate</span>
                <span style={{ color: 'var(--success)' }}>{completionRate}%</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${completionRate}%`, height: '100%', background: 'var(--success)', borderRadius: '4px', transition: 'width 0.8s ease' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '500' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Pending Ratio</span>
                <span style={{ color: 'var(--warning)' }}>{pendingRate}%</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${pendingRate}%`, height: '100%', background: 'var(--warning)', borderRadius: '4px', transition: 'width 0.8s ease' }}></div>
              </div>
            </div>
          </div>

          {/* Bar Chart Visualizer */}
          <div>
            <div className="bar-chart">
              {/* Total Tasks Bar */}
              <div className="bar-item">
                <div className="bar" style={{ height: `${totalTasks > 0 ? 100 : 0}%` }}>
                  <div className="bar-tooltip">Total: {totalTasks}</div>
                </div>
                <span className="bar-label">Total</span>
              </div>

              {/* Completed Tasks Bar */}
              <div className="bar-item">
                <div className="bar" style={{ 
                  height: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`,
                  background: 'linear-gradient(to top, var(--success), #34d399)'
                }}>
                  <div className="bar-tooltip">Completed: {completedTasks}</div>
                </div>
                <span className="bar-label">Completed</span>
              </div>

              {/* Pending Tasks Bar */}
              <div className="bar-item">
                <div className="bar" style={{ 
                  height: `${totalTasks > 0 ? (pendingTasks / totalTasks) * 100 : 0}%`,
                  background: 'linear-gradient(to top, var(--warning), #fbbf24)'
                }}>
                  <div className="bar-tooltip">Pending: {pendingTasks}</div>
                </div>
                <span className="bar-label">Pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCards;
