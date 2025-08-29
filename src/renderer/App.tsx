import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Router, View } from './components/Router';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  // Handle URL hash changes for navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.includes('settings')) {
        setCurrentView('settings');
      } else if (hash.includes('dashboard')) {
        setCurrentView('dashboard');
      } else if (hash.includes('media')) {
        setCurrentView('media');
      } else if (hash.includes('brand-voice')) {
        setCurrentView('brand-voice');
      } else if (hash.includes('content-studio')) {
        setCurrentView('content-studio');
      } else if (hash.includes('scheduling')) {
        setCurrentView('scheduling');
      } else if (hash.includes('post-library')) {
        setCurrentView('post-library');
      } else if (hash.includes('engagement')) {
        setCurrentView('engagement');
      } else if (hash.includes('product-library')) {
        setCurrentView('product-library');
      }
    };

    // Handle initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handlePostDragStart = (post: any) => {
    console.log('Post drag started:', post);
  };

  const handlePostSelect = (post: any) => {
    console.log('Post selected:', post);
  };

  // Navigation function to be passed to components
  const navigateToSettings = (tab?: string) => {
    setCurrentView('settings');
    if (tab) {
      window.location.hash = `#settings?tab=${tab}`;
    } else {
      window.location.hash = '#settings';
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>IMM Marketing Hub</h1>
        <Navigation 
          currentView={currentView}
          onViewChange={setCurrentView}
        />
      </header>

      <main className="app-main">
        <Router 
          currentView={currentView}
          onPostDragStart={handlePostDragStart}
          onPostSelect={handlePostSelect}
          navigateToSettings={navigateToSettings}
        />
      </main>
    </div>
  );
}

export default App; 