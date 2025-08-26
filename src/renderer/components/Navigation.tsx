import React from 'react';
import { View } from './Router';
import './Navigation.css';

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentView, 
  onViewChange 
}) => {
  const navigationItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: '📊' },
    { id: 'media' as View, label: 'Media Library', icon: '📁' },
    { id: 'brand-voice' as View, label: 'Brand Voice', icon: '🎭' },
    { id: 'content-studio' as View, label: 'Content Studio', icon: '✍️' },
    { id: 'scheduling' as View, label: '📅 Scheduling Hub', icon: '📅' },
    { id: 'post-library' as View, label: 'Post Library', icon: '📚' },
    { id: 'engagement' as View, label: '📱 Engagement Hub', icon: '📱' },
    { id: 'product-library' as View, label: '📦 Product Library', icon: '📦' },
    { id: 'settings' as View, label: 'Settings', icon: '⚙️' }
  ];

  return (
    <nav className="app-navigation">
      {navigationItems.map((item) => (
        <button
          key={item.id}
          className={`nav-button ${currentView === item.id ? 'active' : ''}`}
          onClick={() => onViewChange(item.id)}
          title={item.label}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
