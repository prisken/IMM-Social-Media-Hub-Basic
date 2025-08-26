import React, { useState } from 'react';
import Calendar from './Calendar';
import Scheduler from './Scheduler';
import SmartScheduler from './SmartScheduler';
import './SchedulingHub.css';

type SchedulingView = 'calendar' | 'scheduler' | 'smart-scheduler';

const SchedulingHub: React.FC = () => {
  const [activeView, setActiveView] = useState<SchedulingView>('calendar');

  const views = [
    {
      id: 'calendar' as SchedulingView,
      name: '📅 Calendar',
      description: 'Visual scheduling and drag-and-drop management',
      icon: '📅'
    },
    {
      id: 'scheduler' as SchedulingView,
      name: '⚙️ Scheduler',
      description: 'Job queue and automated posting management',
      icon: '⚙️'
    },
    {
      id: 'smart-scheduler' as SchedulingView,
      name: '🤖 Smart Scheduler',
      description: 'AI-powered content generation and strategy',
      icon: '🤖'
    }
  ];

  const renderActiveView = () => {
    switch (activeView) {
      case 'calendar':
        return <Calendar />;
      case 'scheduler':
        return <Scheduler />;
      case 'smart-scheduler':
        return <SmartScheduler />;
      default:
        return <Calendar />;
    }
  };

  return (
    <div className="scheduling-hub">
      <div className="scheduling-header">
        <h1>📅 Scheduling Hub</h1>
        <p>Unified scheduling management - Calendar, Scheduler, and Smart Scheduler all in one place</p>
      </div>

      <div className="view-navigation">
        {views.map(view => (
          <button
            key={view.id}
            className={`view-tab ${activeView === view.id ? 'active' : ''}`}
            onClick={() => setActiveView(view.id)}
          >
            <span className="view-icon">{view.icon}</span>
            <div className="view-info">
              <span className="view-name">{view.name}</span>
              <span className="view-description">{view.description}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="view-content">
        {renderActiveView()}
      </div>

      <div className="quick-actions">
        <div className="action-cards">
          <div className="action-card">
            <h3>🚀 Quick Start</h3>
            <p>New to scheduling? Start with Smart Scheduler to generate content automatically.</p>
            <button 
              className="action-button"
              onClick={() => setActiveView('smart-scheduler')}
            >
              Start Smart Scheduler
            </button>
          </div>
          
          <div className="action-card">
            <h3>📅 Visual Planning</h3>
            <p>Use the Calendar view to visually plan and drag-and-drop your content schedule.</p>
            <button 
              className="action-button"
              onClick={() => setActiveView('calendar')}
            >
              Open Calendar
            </button>
          </div>
          
          <div className="action-card">
            <h3>⚙️ Job Management</h3>
            <p>Monitor and manage your scheduled jobs in the Scheduler view.</p>
            <button 
              className="action-button"
              onClick={() => setActiveView('scheduler')}
            >
              View Scheduler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulingHub; 