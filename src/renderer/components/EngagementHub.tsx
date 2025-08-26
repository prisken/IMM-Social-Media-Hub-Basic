import React, { useState, useEffect } from 'react';
import './EngagementHub.css';

interface EngagementInteraction {
  id: string;
  platform: string;
  postId?: string;
  interactionType: 'comment' | 'message' | 'mention';
  interactionId: string;
  authorName: string;
  authorId?: string;
  content: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  sentimentScore?: number;
  isProcessed: boolean;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface QuickReply {
  id: string;
  name: string;
  content: string;
  category: string;
  platform?: string;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

const EngagementHub: React.FC = () => {
  const [interactions, setInteractions] = useState<EngagementInteraction[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [selectedInteraction, setSelectedInteraction] = useState<EngagementInteraction | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    platform: '',
    sentiment: '',
    isProcessed: undefined as boolean | undefined
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [interactionsData, quickRepliesData] = await Promise.all([
        window.electronAPI.engagement.getInteractions(),
        window.electronAPI.engagement.getQuickReplies()
      ]);
      setInteractions(interactionsData);
      setQuickReplies(quickRepliesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInteractionSelect = (interaction: EngagementInteraction) => {
    setSelectedInteraction(interaction);
    setReplyText('');
  };

  const handleQuickReplySelect = (quickReply: QuickReply) => {
    setReplyText(quickReply.content);
  };

  const handleReplySubmit = async () => {
    if (!selectedInteraction || !replyText.trim()) return;
    
    try {
      const result = await window.electronAPI.engagement.sendReply({
        interactionId: selectedInteraction.interactionId,
        platform: selectedInteraction.platform,
        content: replyText
      });

      if (result.success) {
        // Mark as processed
        await window.electronAPI.engagement.markAsProcessed(selectedInteraction.id);
        
        // Reload interactions
        await loadData();
        
        setReplyText('');
        setSelectedInteraction(null);
      } else {
        console.error('Failed to send reply:', result.error);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return '#4CAF50';
      case 'negative': return '#F44336';
      case 'neutral': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return '📘';
      case 'instagram': return '📸';
      case 'linkedin': return '💼';
      default: return '🌐';
    }
  };

  const filteredInteractions = interactions.filter(interaction => {
    if (filters.platform && interaction.platform !== filters.platform) return false;
    if (filters.sentiment && interaction.sentiment !== filters.sentiment) return false;
    if (filters.isProcessed !== undefined && interaction.isProcessed !== filters.isProcessed) return false;
    return true;
  });

  const filteredQuickReplies = quickReplies.filter(reply => {
    if (!reply.isActive) return false;
    if (selectedInteraction && reply.platform && reply.platform !== selectedInteraction.platform) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="engagement-hub">
        <div className="loading">Loading engagement data...</div>
      </div>
    );
  }

  return (
    <div className="engagement-hub">
      <header className="engagement-header">
        <h1>📱 Engagement Hub</h1>
        <div className="engagement-stats">
          <div className="stat">
            <span className="stat-number">{interactions.length}</span>
            <span className="stat-label">Total Interactions</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {interactions.filter(i => !i.isProcessed).length}
            </span>
            <span className="stat-label">Unprocessed</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {interactions.filter(i => i.sentiment === 'positive').length}
            </span>
            <span className="stat-label">Positive</span>
          </div>
        </div>
      </header>

      <div className="engagement-content">
        <div className="interactions-list">
          <div className="filters-section">
            <h3>Incoming Interactions</h3>
            <div className="filter-controls">
              <select 
                value={filters.platform} 
                onChange={(e) => setFilters({...filters, platform: e.target.value})}
                className="filter-select"
              >
                <option value="">All Platforms</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
              </select>
              
              <select 
                value={filters.sentiment} 
                onChange={(e) => setFilters({...filters, sentiment: e.target.value})}
                className="filter-select"
              >
                <option value="">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
                <option value="neutral">Neutral</option>
              </select>
              
              <select 
                value={filters.isProcessed === undefined ? '' : filters.isProcessed.toString()} 
                onChange={(e) => setFilters({
                  ...filters, 
                  isProcessed: e.target.value === '' ? undefined : e.target.value === 'true'
                })}
                className="filter-select"
              >
                <option value="">All Status</option>
                <option value="false">Unprocessed</option>
                <option value="true">Processed</option>
              </select>
            </div>
          </div>

          {filteredInteractions.length === 0 ? (
            <div className="empty-state">
              <p>No interactions found matching your filters.</p>
            </div>
          ) : (
            <div className="interactions-grid">
              {filteredInteractions.map((interaction) => (
                <div 
                  key={interaction.id}
                  className={`interaction-card ${selectedInteraction?.id === interaction.id ? 'selected' : ''} ${interaction.isProcessed ? 'processed' : ''}`}
                  onClick={() => handleInteractionSelect(interaction)}
                >
                  <div className="interaction-header">
                    <span className="platform-icon">
                      {getPlatformIcon(interaction.platform)}
                    </span>
                    <span className="author-name">{interaction.authorName}</span>
                    <span className="sentiment" style={{ color: getSentimentColor(interaction.sentiment) }}>
                      {interaction.sentiment || 'unknown'}
                    </span>
                  </div>
                  
                  <div className="interaction-content">
                    {interaction.content}
                  </div>
                  
                  <div className="interaction-footer">
                    <span className="interaction-type">{interaction.interactionType}</span>
                    <span className="interaction-time">
                      {new Date(interaction.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="reply-section">
          {selectedInteraction ? (
            <>
              <div className="selected-interaction">
                <h3>Replying to {selectedInteraction.authorName}</h3>
                <div className="original-content">
                  <strong>Original:</strong> {selectedInteraction.content}
                </div>
                <div className="interaction-meta">
                  <span className="platform-badge">{selectedInteraction.platform}</span>
                  <span className="sentiment-badge" style={{ color: getSentimentColor(selectedInteraction.sentiment) }}>
                    {selectedInteraction.sentiment || 'unknown'} sentiment
                  </span>
                </div>
              </div>

              <div className="quick-replies-section">
                <h4>Quick Replies</h4>
                <div className="quick-replies-grid">
                  {filteredQuickReplies.map((quickReply) => (
                    <button
                      key={quickReply.id}
                      className="quick-reply-btn"
                      onClick={() => handleQuickReplySelect(quickReply)}
                    >
                      <div className="quick-reply-name">{quickReply.name}</div>
                      <div className="quick-reply-category">{quickReply.category}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="reply-composer">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  rows={4}
                />
                
                <div className="reply-actions">
                  <button 
                    onClick={handleReplySubmit}
                    className="send-reply-btn"
                    disabled={!replyText.trim()}
                  >
                    Send Reply
                  </button>
                  <button 
                    onClick={() => {
                      setReplyText('');
                      setSelectedInteraction(null);
                    }}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <p>Select an interaction to reply</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EngagementHub; 