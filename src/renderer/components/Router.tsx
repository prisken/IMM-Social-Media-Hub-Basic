import React from 'react';
import Dashboard from './Dashboard';
import MediaLibrary from './MediaLibrary';
import Settings from './Settings';
import BrandVoiceTraining from './BrandVoiceTraining';
import ContentStudio from './ContentStudio';
import SchedulingHub from './SchedulingHub';
import PostLibrary from './PostLibrary';
import EngagementHub from './EngagementHub';
import ProductLibrary from './ProductLibrary';

export type View = 
  | 'dashboard' 
  | 'media' 
  | 'brand-voice' 
  | 'content-studio' 
  | 'scheduling' 
  | 'post-library' 
  | 'engagement' 
  | 'product-library' 
  | 'settings';

interface RouterProps {
  currentView: View;
  onPostDragStart?: (post: any) => void;
  onPostSelect?: (post: any) => void;
}

export const Router: React.FC<RouterProps> = ({ 
  currentView, 
  onPostDragStart, 
  onPostSelect 
}) => {
  const renderComponent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'media':
        return <MediaLibrary />;
      case 'brand-voice':
        return <BrandVoiceTraining />;
      case 'content-studio':
        return <ContentStudio />;
      case 'scheduling':
        return <SchedulingHub />;
      case 'post-library':
        return (
          <PostLibrary 
            onPostDragStart={onPostDragStart}
            onPostSelect={onPostSelect}
          />
        );
      case 'engagement':
        return <EngagementHub />;
      case 'product-library':
        return <ProductLibrary />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return <>{renderComponent()}</>;
};
