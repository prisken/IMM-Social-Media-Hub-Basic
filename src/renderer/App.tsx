import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Router, View } from './components/Router';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const handlePostDragStart = (post: any) => {
    console.log('Post drag started:', post);
  };

  const handlePostSelect = (post: any) => {
    console.log('Post selected:', post);
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
        />
      </main>
    </div>
  );
}

export default App; 