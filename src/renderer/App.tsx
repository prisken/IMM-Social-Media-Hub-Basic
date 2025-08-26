import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import MediaLibrary from './components/MediaLibrary';
import Settings from './components/Settings';
import BrandVoiceTraining from './components/BrandVoiceTraining';
import ContentStudio from './components/ContentStudio';
import SchedulingHub from './components/SchedulingHub';
import PostLibrary from './components/PostLibrary';
import EngagementHub from './components/EngagementHub';
import ProductLibrary from './components/ProductLibrary';
import './App.css';

type View = 'dashboard' | 'media' | 'brand-voice' | 'content-studio' | 'scheduling' | 'post-library' | 'engagement' | 'product-library' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  return (
    <div className="app">
      <header className="app-header">
        <h1>IMM Marketing Hub</h1>
        <nav>
          <button 
            className={currentView === 'dashboard' ? 'active' : ''}
            onClick={() => setCurrentView('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={currentView === 'media' ? 'active' : ''}
            onClick={() => setCurrentView('media')}
          >
            Media Library
          </button>
          <button 
            className={currentView === 'brand-voice' ? 'active' : ''}
            onClick={() => setCurrentView('brand-voice')}
          >
            Brand Voice
          </button>
          <button 
            className={currentView === 'content-studio' ? 'active' : ''}
            onClick={() => setCurrentView('content-studio')}
          >
            Content Studio
          </button>
          <button 
            className={currentView === 'scheduling' ? 'active' : ''}
            onClick={() => setCurrentView('scheduling')}
          >
            📅 Scheduling Hub
          </button>
          <button 
            className={currentView === 'post-library' ? 'active' : ''}
            onClick={() => setCurrentView('post-library')}
          >
            Post Library
          </button>
          <button 
            className={currentView === 'engagement' ? 'active' : ''}
            onClick={() => setCurrentView('engagement')}
          >
            📱 Engagement Hub
          </button>
          <button 
            className={currentView === 'product-library' ? 'active' : ''}
            onClick={() => setCurrentView('product-library')}
          >
            📦 Product Library
          </button>
          <button 
            className={currentView === 'settings' ? 'active' : ''}
            onClick={() => setCurrentView('settings')}
          >
            Settings
          </button>
        </nav>
      </header>

      <main className="app-main">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'media' && <MediaLibrary />}
        {currentView === 'brand-voice' && <BrandVoiceTraining />}
        {currentView === 'content-studio' && <ContentStudio />}
        {currentView === 'scheduling' && <SchedulingHub />}
        {currentView === 'post-library' && (
          <PostLibrary 
            onPostDragStart={(post) => console.log('Post drag started:', post)}
            onPostSelect={(post) => console.log('Post selected:', post)}
          />
        )}
        {currentView === 'engagement' && <EngagementHub />}
        {currentView === 'product-library' && <ProductLibrary />}
        {currentView === 'settings' && <Settings />}
      </main>
    </div>
  );
}

export default App; 