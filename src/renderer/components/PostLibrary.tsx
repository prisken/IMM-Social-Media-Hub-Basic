import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import './PostLibrary.css';

interface Post {
  id: string;
  platform: string;
  content: string;
  mediaFiles: string[];
  scheduledTime?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  engagement?: any;
  createdAt: string;
  updatedAt: string;
}

interface PostLibraryProps {
  onPostDragStart: (post: Post) => void;
  onPostSelect: (post: Post) => void;
}

const PostLibrary: React.FC<PostLibraryProps> = ({ onPostDragStart, onPostSelect }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<'all' | 'draft' | 'scheduled' | 'published'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'created' | 'updated' | 'scheduled' | 'platform'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      if (window.electronAPI?.db?.getPosts) {
        const allPosts = await window.electronAPI.db.getPosts();
        setPosts(allPosts);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return '📝';
      case 'scheduled': return '📅';
      case 'published': return '✅';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#f59e0b';
      case 'scheduled': return '#3b82f6';
      case 'published': return '#10b981';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return '📘';
      case 'instagram': return '📷';
      case 'linkedin': return '💼';
      case 'twitter': return '🐦';
      default: return '📱';
    }
  };

  const filteredAndSortedPosts = posts
    .filter(post => {
      const matchesFilter = filter === 'all' || post.status === filter;
      const matchesSearch = searchTerm === '' || 
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.platform.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'scheduled':
          const aTime = a.scheduledTime ? new Date(a.scheduledTime).getTime() : 0;
          const bTime = b.scheduledTime ? new Date(b.scheduledTime).getTime() : 0;
          comparison = aTime - bTime;
          break;
        case 'platform':
          comparison = a.platform.localeCompare(b.platform);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleDragStart = (e: React.DragEvent, post: Post) => {
    e.dataTransfer.setData('application/json', JSON.stringify(post));
    e.dataTransfer.effectAllowed = 'copy';
    onPostDragStart(post);
  };

  const handlePostClick = (post: Post) => {
    onPostSelect(post);
  };

  const getPostPreview = (content: string) => {
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  };

  const getStats = () => {
    const stats = {
      total: posts.length,
      draft: posts.filter(p => p.status === 'draft').length,
      scheduled: posts.filter(p => p.status === 'scheduled').length,
      published: posts.filter(p => p.status === 'published').length,
      failed: posts.filter(p => p.status === 'failed').length
    };
    return stats;
  };

  const stats = getStats();

  return (
    <div className="post-library">
      <div className="post-library-header">
        <h2>📚 Post Library</h2>
        <div className="post-library-stats">
          <div className="stat-item">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.draft}</span>
            <span className="stat-label">Drafts</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.scheduled}</span>
            <span className="stat-label">Scheduled</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.published}</span>
            <span className="stat-label">Published</span>
          </div>
        </div>
      </div>

      <div className="post-library-controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">All Posts</option>
            <option value="draft">Drafts</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
          </select>
        </div>
        
        <div className="sort-controls">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="sort-select"
          >
            <option value="created">Created Date</option>
            <option value="updated">Updated Date</option>
            <option value="scheduled">Scheduled Date</option>
            <option value="platform">Platform</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="sort-order-btn"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <div className="post-library-content">
        {filteredAndSortedPosts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No posts found</h3>
            <p>Create some posts in Content Studio or Smart Scheduler to see them here.</p>
          </div>
        ) : (
          <div className="posts-grid">
            {filteredAndSortedPosts.map(post => (
              <div
                key={post.id}
                className={`post-card ${post.status} ${post.scheduledTime ? 'scheduled' : ''}`}
                draggable={post.status === 'draft' || post.status === 'failed'}
                onDragStart={(e) => handleDragStart(e, post)}
                onClick={() => handlePostClick(post)}
              >
                <div className="post-card-header">
                  <div className="post-platform">
                    <span className="platform-icon">{getPlatformIcon(post.platform)}</span>
                    <span className="platform-name">{post.platform}</span>
                  </div>
                  <div 
                    className="post-status"
                    style={{ backgroundColor: getStatusColor(post.status) }}
                  >
                    <span className="status-icon">{getStatusIcon(post.status)}</span>
                    <span className="status-text">{post.status}</span>
                  </div>
                </div>

                <div className="post-content">
                  <p>{getPostPreview(post.content)}</p>
                </div>

                <div className="post-meta">
                  <div className="post-dates">
                    <div className="date-item">
                      <span className="date-label">Created:</span>
                      <span className="date-value">{format(parseISO(post.createdAt), 'MMM dd, yyyy')}</span>
                    </div>
                    {post.scheduledTime && (
                      <div className="date-item scheduled-time">
                        <span className="date-label">Scheduled:</span>
                        <span className="date-value">{format(parseISO(post.scheduledTime), 'MMM dd, HH:mm')}</span>
                      </div>
                    )}
                  </div>

                  {post.mediaFiles && post.mediaFiles.length > 0 && (
                    <div className="post-media">
                      <span className="media-icon">📎</span>
                      <span className="media-count">{post.mediaFiles.length} media</span>
                    </div>
                  )}
                </div>

                <div className="post-actions">
                  {post.status === 'draft' && (
                    <div className="drag-hint">
                      <span>🔄 Drag to calendar to schedule</span>
                    </div>
                  )}
                  {post.status === 'scheduled' && (
                    <div className="scheduled-hint">
                      <span>📅 Already scheduled</span>
                    </div>
                  )}
                  {post.status === 'published' && (
                    <div className="published-hint">
                      <span>✅ Published</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostLibrary; 