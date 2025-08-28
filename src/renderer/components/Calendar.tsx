import React, { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addDays, isToday, parseISO } from 'date-fns';
import PostEditor from './PostEditor';
import './Calendar.css';

interface ScheduledPost {
  id: string;
  platform: string;
  content: string;
  mediaFiles: string[];
  scheduledTime: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  engagement?: any;
  createdAt: string;
  updatedAt: string;
}

interface CalendarProps {
  onPostSelect?: (post: ScheduledPost) => void;
  onSchedulePost?: (date: Date, time: string, post: ScheduledPost) => void;
  onReschedulePost?: (postId: string, newDateTime: string) => void;
}

type ViewMode = 'month' | 'week';

const Calendar: React.FC<CalendarProps> = ({ 
  onPostSelect, 
  onSchedulePost, 
  onReschedulePost 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [draggedPost, setDraggedPost] = useState<ScheduledPost | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [conflictPost, setConflictPost] = useState<ScheduledPost | null>(null);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);
  const [showPostEditor, setShowPostEditor] = useState(false);
  const [dropTargetDate, setDropTargetDate] = useState<Date | null>(null);
  const [showYearMonthPicker, setShowYearMonthPicker] = useState(false);
  
  // Post Library Integration
  const [showPostLibrary, setShowPostLibrary] = useState(true);
  const [allPosts, setAllPosts] = useState<ScheduledPost[]>([]);
  const [postLibraryFilter, setPostLibraryFilter] = useState<'all' | 'draft' | 'failed'>('all');
  const [postLibrarySearch, setPostLibrarySearch] = useState('');
  
  // Delete functionality
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState<ScheduledPost | null>(null);

  // Load scheduled posts and all posts from database
  useEffect(() => {
    loadScheduledPosts();
    loadAllPosts();
  }, []);

  const loadScheduledPosts = async () => {
    try {
      const response = await window.electronAPI.calendar.getScheduledPosts();
      setScheduledPosts(response || []);
    } catch (error) {
      console.error('Failed to load scheduled posts:', error);
    }
  };

  const loadAllPosts = async () => {
    try {
      const response = await window.electronAPI.db.getPosts();
      setAllPosts(response || []);
    } catch (error) {
      console.error('Failed to load all posts:', error);
    }
  };

  const handleDeletePost = async (post: ScheduledPost) => {
    setPostToDelete(post);
    setShowDeleteConfirm(true);
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;

    try {
      await window.electronAPI.db.deletePost(postToDelete.id);
      
      // Refresh both lists
      await loadScheduledPosts();
      await loadAllPosts();
      
      // Show success message
      alert(`Post "${postToDelete.content.substring(0, 50)}..." has been deleted successfully!`);
      
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setShowDeleteConfirm(false);
      setPostToDelete(null);
    }
  };

  const cancelDeletePost = () => {
    setShowDeleteConfirm(false);
    setPostToDelete(null);
  };

  const getFilteredPosts = () => {
    let filtered = allPosts;
    
    // Filter by status
    if (postLibraryFilter !== 'all') {
      filtered = filtered.filter(post => post.status === postLibraryFilter);
    }
    
    // Filter by search term
    if (postLibrarySearch) {
      filtered = filtered.filter(post => 
        post.content.toLowerCase().includes(postLibrarySearch.toLowerCase()) ||
        post.platform.toLowerCase().includes(postLibrarySearch.toLowerCase())
      );
    }
    
    return filtered;
  };

  const handlePostLibraryDragStart = (e: React.DragEvent, post: ScheduledPost) => {
    setDraggedPost(post);
    e.dataTransfer.setData('application/json', JSON.stringify(post));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const getDaysInView = () => {
    if (viewMode === 'month') {
      const start = startOfWeek(startOfMonth(currentDate));
      const end = endOfWeek(endOfMonth(currentDate));
      return eachDayOfInterval({ start, end });
    } else {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return eachDayOfInterval({ start, end });
    }
  };

  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter(post => {
      const postDate = parseISO(post.scheduledTime);
      return isSameDay(postDate, date);
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowTimePicker(true);
  };

  const handlePostClick = (post: ScheduledPost) => {
    setEditingPost(post);
    setShowPostEditor(true);
  };

  const handlePostSave = (updatedPost: ScheduledPost) => {
    // Refresh the posts list after editing
    loadScheduledPosts();
    loadAllPosts();
    setEditingPost(null);
    setShowPostEditor(false);
  };

  const handlePostEditorClose = () => {
    setEditingPost(null);
    setShowPostEditor(false);
  };

  const handleDragStart = (e: React.DragEvent, post: ScheduledPost) => {
    setDraggedPost(post);
    e.dataTransfer.setData('text/plain', post.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = async (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    
    try {
      const postData = e.dataTransfer.getData('application/json');
      if (postData) {
        const post = JSON.parse(postData);
        
        // If it's a post from PostLibrary (draft or failed), schedule it
        if (post.status === 'draft' || post.status === 'failed') {
          setDropTargetDate(targetDate);
          setDraggedPost(post);
          setShowTimePicker(true);
        } else {
          // If it's an existing scheduled post, reschedule it
          const targetDateTime = format(targetDate, 'yyyy-MM-dd');
          const originalTime = format(parseISO(post.scheduledTime), 'HH:mm');
          const newDateTime = `${targetDateTime}T${originalTime}:00.000Z`;

          // Check for conflicts
          const conflicts = scheduledPosts.filter(scheduledPost => {
            if (scheduledPost.id === post.id) return false;
            const postDate = parseISO(scheduledPost.scheduledTime);
            return isSameDay(postDate, targetDate);
          });

          if (conflicts.length > 0) {
            setConflictPost(conflicts[0]);
            return;
          }

          await handleReschedulePost(post.id, newDateTime);
        }
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
    
    setDraggedPost(null);
  };

  const handleReschedulePost = async (postId: string, newDateTime: string) => {
    try {
      await window.electronAPI.db.updatePost(postId, { scheduledTime: newDateTime });
      await loadScheduledPosts();
      onReschedulePost?.(postId, newDateTime);
    } catch (error) {
      console.error('Failed to reschedule post:', error);
    }
  };

  const handleSchedulePost = async (date: Date, time: string) => {
    const targetDate = dropTargetDate || selectedDate;
    if (!targetDate) return;

    const dateTime = format(targetDate, 'yyyy-MM-dd');
    const scheduledTime = `${dateTime}T${time}:00.000Z`;

    // Check for conflicts
    const conflicts = scheduledPosts.filter(post => {
      const postDate = parseISO(post.scheduledTime);
      return isSameDay(postDate, targetDate);
    });

    if (conflicts.length > 0) {
      setConflictPost(conflicts[0]);
      return;
    }

    // If we have a dragged post from PostLibrary, schedule it
    if (draggedPost && (draggedPost.status === 'draft' || draggedPost.status === 'failed')) {
      try {
        const updatedPost = {
          ...draggedPost,
          scheduledTime,
          status: 'scheduled' as const,
          updatedAt: new Date().toISOString()
        };

        await window.electronAPI.db.updatePost(draggedPost.id, updatedPost);
        await loadScheduledPosts();
        await loadAllPosts();
        
        // Show success message
        alert(`Post scheduled successfully for ${format(targetDate, 'MMM dd, yyyy')} at ${time}!`);
      } catch (error) {
        console.error('Failed to schedule post:', error);
        alert('Failed to schedule post. Please try again.');
      }
    } else {
      // Handle regular post scheduling
      onSchedulePost?.(targetDate, time, {} as ScheduledPost);
    }

    setShowTimePicker(false);
    setSelectedDate(null);
    setDropTargetDate(null);
    setDraggedPost(null);
  };

  const showSchedulingExplanation = (content: ScheduledPost[]) => {
    const explanation = generateSchedulingExplanation(content);
    alert(explanation);
  };

  const generateSchedulingExplanation = (content: ScheduledPost[]): string => {
    let explanation = `📅 **Smart Scheduling Explanation**\n\n`;
    
    explanation += `🎯 **Content Strategy Applied:**\n`;
    explanation += `• Generated ${content.length} posts based on your brand voice and audience preferences\n`;
    explanation += `• Optimized timing for maximum engagement across platforms\n`;
    explanation += `• Aligned with your posting schedule and content mix\n\n`;
    
    explanation += `⏰ **Timing Strategy:**\n`;
    explanation += `• Posts scheduled during peak audience activity hours\n`;
    explanation += `• Balanced distribution across weekdays and weekends\n`;
    explanation += `• Platform-specific timing for optimal reach\n\n`;
    
    explanation += `📊 **Content Mix:**\n`;
    const platformCounts = content.reduce((acc, post) => {
      acc[post.platform] = (acc[post.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(platformCounts).forEach(([platform, count]) => {
      explanation += `• ${platform}: ${count} posts\n`;
    });
    
    explanation += `\n💡 **Why This Approach:**\n`;
    explanation += `• Maintains consistent brand presence\n`;
    explanation += `• Maximizes engagement through strategic timing\n`;
    explanation += `• Saves time through automated content generation\n`;
    explanation += `• Data-driven optimization based on your preferences\n\n`;
    
    explanation += `🚀 **Expected Results:**\n`;
    explanation += `• Increased engagement and reach\n`;
    explanation += `• Consistent brand messaging\n`;
    explanation += `• Time savings for content creation\n`;
    explanation += `• Better audience connection\n\n`;
    
    explanation += `Your content is now intelligently scheduled and ready to go! 🎉`;
    
    return explanation;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'next' ? addDays(prev, 7) : addDays(prev, -7));
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'next' ? addMonths(prev, 12) : subMonths(prev, 12));
  };

  const goToSpecificDate = (date: Date) => {
    setCurrentDate(date);
    setViewMode('month');
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setViewMode('month');
  };

  const renderTimePicker = () => {
    const targetDate = dropTargetDate || selectedDate;
    if (!showTimePicker || !targetDate) return null;

    const timeSlots = [
      '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
      '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
    ];

    return (
      <div className="time-picker-overlay">
        <div className="time-picker">
          <h3>Schedule Post for {format(targetDate, 'MMM dd, yyyy')}</h3>
          <div className="time-slots">
            {timeSlots.map(time => (
              <button
                key={time}
                className="time-slot"
                onClick={() => handleSchedulePost(targetDate, time)}
              >
                {time}
              </button>
            ))}
          </div>
          <button 
            className="cancel-button"
            onClick={() => setShowTimePicker(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  const renderConflictDialog = () => {
    if (!conflictPost) return null;

    return (
      <div className="conflict-overlay">
        <div className="conflict-dialog">
          <h3>Schedule Conflict</h3>
          <p>There's already a post scheduled for this time:</p>
          <div className="conflict-post">
            <strong>{conflictPost.platform}</strong>
            <p>{conflictPost.content.substring(0, 100)}...</p>
            <small>{format(parseISO(conflictPost.scheduledTime), 'MMM dd, yyyy HH:mm')}</small>
          </div>
          <div className="conflict-actions">
            <button onClick={() => setConflictPost(null)}>Cancel</button>
            <button onClick={() => {
              // Handle conflict resolution
              setConflictPost(null);
            }}>
              Reschedule Anyway
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDeleteConfirmDialog = () => {
    if (!showDeleteConfirm || !postToDelete) return null;

    return (
      <div className="delete-overlay">
        <div className="delete-dialog">
          <h3>🗑️ Delete Post</h3>
          <p>Are you sure you want to delete this post?</p>
          <div className="delete-post-preview">
            <div className="post-preview-header">
              <span className="platform-badge">{postToDelete.platform}</span>
              <span className="status-badge">{postToDelete.status}</span>
            </div>
            <div className="post-preview-content">
              {postToDelete.content.substring(0, 150)}...
            </div>
            <div className="post-preview-footer">
              <small>Created: {format(parseISO(postToDelete.createdAt), 'MMM dd, yyyy')}</small>
              {postToDelete.scheduledTime && (
                <small>Scheduled: {format(parseISO(postToDelete.scheduledTime), 'MMM dd, yyyy HH:mm')}</small>
              )}
            </div>
          </div>
          <div className="delete-warning">
            <p>⚠️ This action cannot be undone. The post will be permanently deleted.</p>
          </div>
          <div className="delete-actions">
            <button 
              className="cancel-delete-btn"
              onClick={cancelDeletePost}
            >
              Cancel
            </button>
            <button 
              className="confirm-delete-btn"
              onClick={confirmDeletePost}
            >
              Delete Post
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPostLibrary = () => {
    const filteredPosts = getFilteredPosts();
    
    return (
      <div className={`post-library-sidebar ${showPostLibrary ? 'open' : 'closed'}`}>
        <div className="post-library-header">
          <h3>📚 Post Library</h3>
          <button 
            className="toggle-library-btn"
            onClick={() => setShowPostLibrary(!showPostLibrary)}
            title={showPostLibrary ? 'Hide Post Library' : 'Show Post Library'}
          >
            {showPostLibrary ? '◀' : '▶'}
          </button>
        </div>
        
        {showPostLibrary && (
          <>
            <div className="post-library-controls">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={postLibrarySearch}
                  onChange={(e) => setPostLibrarySearch(e.target.value)}
                />
              </div>
              
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${postLibraryFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setPostLibraryFilter('all')}
                >
                  All
                </button>
                <button
                  className={`filter-btn ${postLibraryFilter === 'draft' ? 'active' : ''}`}
                  onClick={() => setPostLibraryFilter('draft')}
                >
                  Drafts
                </button>
                <button
                  className={`filter-btn ${postLibraryFilter === 'failed' ? 'active' : ''}`}
                  onClick={() => setPostLibraryFilter('failed')}
                >
                  Failed
                </button>
              </div>
            </div>
            
            <div className="post-library-content">
              <div className="drag-instructions">
                <p>💡 Drag posts from here to calendar dates to schedule them</p>
              </div>
              
              {filteredPosts.length === 0 ? (
                <div className="no-posts">
                  <p>No posts found</p>
                </div>
              ) : (
                <div className="post-list">
                  {filteredPosts.map(post => (
                                         <div
                       key={post.id}
                       className={`post-item ${post.status}`}
                       draggable
                       onDragStart={(e) => handlePostLibraryDragStart(e, post)}
                       title={`${post.platform}: ${post.content.substring(0, 50)}...`}
                     >
                       <div className="post-header">
                         <span className="platform-badge">{post.platform}</span>
                         <span className="status-badge">{post.status}</span>
                         <button
                           className="delete-post-btn"
                           onClick={(e) => {
                             e.stopPropagation();
                             handleDeletePost(post);
                           }}
                           title="Delete this post"
                         >
                           🗑️
                         </button>
                       </div>
                       <div className="post-content" onClick={() => handlePostClick(post)}>
                         {post.content.substring(0, 80)}...
                       </div>
                       <div className="post-footer">
                         <small>{format(parseISO(post.createdAt), 'MMM dd')}</small>
                         {post.mediaFiles.length > 0 && (
                           <span className="media-indicator">📎</span>
                         )}
                       </div>
                     </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderCalendarGrid = () => {
    const days = getDaysInView();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="calendar-grid">
        <div className="calendar-header">
          {dayNames.map(day => (
            <div key={day} className="day-header">{day}</div>
          ))}
        </div>
        <div className="calendar-body">
          {days.map(day => {
            const posts = getPostsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isCurrentDay ? 'today' : ''}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day)}
                onClick={() => handleDateClick(day)}
              >
                <div className="day-number">{format(day, 'd')}</div>
                <div className="day-posts">
                  {posts.map(post => (
                    <div
                      key={post.id}
                      className={`post-indicator ${post.status}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, post)}
                      title={`${post.platform}: ${post.content.substring(0, 50)}...`}
                    >
                      <div className="post-indicator-content" onClick={(e) => {
                        e.stopPropagation();
                        handlePostClick(post);
                      }}>
                        <span className="platform-icon">{post.platform.charAt(0).toUpperCase()}</span>
                        <span className="post-time">{format(parseISO(post.scheduledTime), 'HH:mm')}</span>
                      </div>
                      <button
                        className="calendar-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePost(post);
                        }}
                        title="Delete this post"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-container-with-library">
      {renderPostLibrary()}
      
      <div className="calendar-main">
        <div className="calendar-header">
          <div className="calendar-controls">
            <div className="calendar-navigation">
              <button 
                className="nav-button year-nav"
                onClick={() => navigateYear('prev')}
                title="Previous Year"
              >
                ‹‹
              </button>
              <button 
                className="nav-button"
                onClick={() => viewMode === 'month' ? navigateMonth('prev') : navigateWeek('prev')}
                title={viewMode === 'month' ? 'Previous Month' : 'Previous Week'}
              >
                ←
              </button>
              <div className="calendar-title">
                <h2>
                  {viewMode === 'month' 
                    ? format(currentDate, 'MMMM yyyy')
                    : `Week of ${format(startOfWeek(currentDate), 'MMM dd, yyyy')}`
                  }
                </h2>
                <div className="calendar-subtitle">
                  {viewMode === 'month' 
                    ? `${format(startOfMonth(currentDate), 'MMM dd')} - ${format(endOfMonth(currentDate), 'MMM dd, yyyy')}`
                    : `${format(startOfWeek(currentDate), 'MMM dd')} - ${format(endOfWeek(currentDate), 'MMM dd, yyyy')}`
                  }
                </div>
              </div>
              <button 
                className="nav-button"
                onClick={() => viewMode === 'month' ? navigateMonth('next') : navigateWeek('next')}
                title={viewMode === 'month' ? 'Next Month' : 'Next Week'}
              >
                →
              </button>
              <button 
                className="nav-button year-nav"
                onClick={() => navigateYear('next')}
                title="Next Year"
              >
                ››
              </button>
            </div>
            <div className="calendar-actions">
              <button 
                className="today-button"
                onClick={goToToday}
                title="Jump to Today's Date"
              >
                🏠 Today
              </button>
              <button 
                className="year-month-picker-button"
                onClick={() => setShowYearMonthPicker(!showYearMonthPicker)}
                title="Select Year and Month"
              >
                📅 {format(currentDate, 'MMM yyyy')}
              </button>
            </div>
          </div>
          <div className="view-controls">
            <button 
              className={`view-button ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
              title="Show Full Month View"
            >
              📅 Month View
            </button>
            <button 
              className={`view-button ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
              title="Show Weekly View"
            >
              📊 Week View
            </button>
          </div>
        </div>

        {/* Integrated Year/Month Picker */}
        {showYearMonthPicker && (
          <div className="integrated-date-picker">
            <div className="date-picker-section">
              <label>📅 Select Year:</label>
              <select 
                value={currentDate.getFullYear()}
                onChange={(e) => {
                  const newDate = new Date(currentDate);
                  newDate.setFullYear(parseInt(e.target.value));
                  setCurrentDate(newDate);
                }}
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="date-picker-section">
              <label>📅 Select Month:</label>
              <select 
                value={currentDate.getMonth()}
                onChange={(e) => {
                  const newDate = new Date(currentDate);
                  newDate.setMonth(parseInt(e.target.value));
                  setCurrentDate(newDate);
                }}
              >
                {[
                  'January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'
                ].map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
            </div>
            <div className="date-picker-section">
              <label>🚀 Quick Actions:</label>
              <div className="quick-nav-buttons">
                <button onClick={goToToday} title="Jump to Today">🏠 Today</button>
                <button onClick={() => navigateMonth('prev')} title="Previous Month">⬅️ Prev Month</button>
                <button onClick={() => navigateMonth('next')} title="Next Month">➡️ Next Month</button>
                <button onClick={() => navigateYear('prev')} title="Previous Year">⬅️ Prev Year</button>
                <button onClick={() => navigateYear('next')} title="Next Year">➡️ Next Year</button>
              </div>
            </div>
          </div>
        )}

        {renderCalendarGrid()}
        {renderTimePicker()}
        {renderConflictDialog()}
        {renderDeleteConfirmDialog()}
        
        <PostEditor
          post={editingPost}
          isOpen={showPostEditor}
          onClose={handlePostEditorClose}
          onSave={handlePostSave}
        />

        <div className="calendar-legend">
          <div className="legend-item">
            <span className="legend-color draft"></span>
            <span>Draft</span>
          </div>
          <div className="legend-item">
            <span className="legend-color scheduled"></span>
            <span>Scheduled</span>
          </div>
          <div className="legend-item">
            <span className="legend-color published"></span>
            <span>Published</span>
          </div>
          <div className="legend-item">
            <span className="legend-color failed"></span>
            <span>Failed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar; 