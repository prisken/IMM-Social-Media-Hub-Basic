import React, { useEffect, useState } from 'react';
import './Dashboard.css';

interface AnalyticsData {
  facebook: { 
    reach: number; 
    posts: number; 
    engagement: number;
    postsCount: number;
    storiesReelsCount: number;
    postsReach: number;
    storiesReelsReach: number;
    postsEngagement: number;
    storiesReelsEngagement: number;
  };
  instagram: { reach: number; posts: number; engagement: number };
  linkedin: { reach: number; posts: number; engagement: number };
  threads: { 
    reach: number; 
    posts: number; 
    engagement: number;
    postsCount: number;
    storiesReelsCount: number;
    postsReach: number;
    storiesReelsReach: number;
    postsEngagement: number;
    storiesReelsEngagement: number;
  };
  total: { 
    reach: number; 
    posts: number; 
    engagement: number;
    postsCount: number;
    storiesReelsCount: number;
    postsReach: number;
    storiesReelsReach: number;
    postsEngagement: number;
    storiesReelsEngagement: number;
  };
}

interface ScheduleItem {
  time: string;
  platform: string;
  content: string;
  status: string;
}

interface PlatformStats {
  facebook: { connected: boolean; accountName?: string };
  instagram: { connected: boolean; accountName?: string };
  linkedin: { connected: boolean; accountName?: string };
  threads: { connected: boolean; accountName?: string };
}

interface AnalyticsMetrics {
  id: string;
  postId: string;
  platform: string;
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  engagementRate: number;
  sentimentScore: number;
  createdAt: string;
  updatedAt: string;
}

interface AnalyticsTrend {
  id: string;
  platform: string;
  date: string;
  totalReach: number;
  totalEngagement: number;
  totalPosts: number;
  avgEngagementRate: number;
  topContentType: string;
  createdAt: string;
}

interface TopPost {
  id: string;
  platform: string;
  content: string;
  mediaFiles: string[];
  scheduledTime: string;
  status: string;
  engagement: any;
  createdAt: string;
  updatedAt: string;
  analytics: {
    reach: number;
    impressions: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
  };
}

interface DashboardProps {
  navigateToSettings?: (tab?: string) => void;
}

function Dashboard({ navigateToSettings }: DashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    facebook: { 
      reach: 0, posts: 0, engagement: 0,
      postsCount: 0, storiesReelsCount: 0,
      postsReach: 0, storiesReelsReach: 0,
      postsEngagement: 0, storiesReelsEngagement: 0
    },
    instagram: { reach: 0, posts: 0, engagement: 0 },
    linkedin: { reach: 0, posts: 0, engagement: 0 },
    threads: { 
      reach: 0, posts: 0, engagement: 0,
      postsCount: 0, storiesReelsCount: 0,
      postsReach: 0, storiesReelsReach: 0,
      postsEngagement: 0, storiesReelsEngagement: 0
    },
    total: { 
      reach: 0, posts: 0, engagement: 0,
      postsCount: 0, storiesReelsCount: 0,
      postsReach: 0, storiesReelsReach: 0,
      postsEngagement: 0, storiesReelsEngagement: 0
    }
  });

  const [pendingActions, setPendingActions] = useState<string[]>([]);
  const [todaysSchedule, setTodaysSchedule] = useState<ScheduleItem[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats>({
    facebook: { connected: false },
    instagram: { connected: false },
    linkedin: { connected: false },
    threads: { connected: false }
  });
  const [loading, setLoading] = useState(true);
  
  // Additional analytics state
  const [metrics, setMetrics] = useState<AnalyticsMetrics[]>([]);
  const [trends, setTrends] = useState<AnalyticsTrend[]>([]);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30');

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Add unified refresh functionality for all data
  const handleRefreshAllData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Refreshing all social media data...');
      
      // First, clear all old analytics data
      console.log('🗑️ Clearing old analytics data...');
      const clearResult = await window.electronAPI.analytics.clearData();
      if (clearResult.success) {
        console.log('✅ Old analytics data cleared successfully');
      } else {
        console.error('❌ Failed to clear old data:', clearResult.error);
      }
      
      const results = [];
      
      // Fetch Facebook data if connected
      if (platformStats.facebook?.connected) {
        try {
          console.log('📊 Fetching Facebook data...');
          const facebookResult = await window.electronAPI.analytics.fetchFacebookData();
          if (facebookResult.success) {
            console.log('✅ Facebook data fetched successfully');
            results.push('Facebook');
          } else {
            console.error('❌ Failed to fetch Facebook data:', facebookResult.error);
            alert(`❌ Facebook Data Error: ${facebookResult.error}\n\nPlease check your Facebook token and permissions in Settings.`);
          }
        } catch (error) {
          console.error('❌ Error fetching Facebook data:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          alert(`❌ Facebook Connection Error: ${errorMessage}\n\nPlease check your Facebook settings and try again.`);
        }
      }
      
      // Fetch Instagram data if connected
      if (platformStats.instagram?.connected) {
        try {
          console.log('📸 Fetching Instagram data...');
          const instagramResult = await window.electronAPI.analytics.fetchInstagramData();
          if (instagramResult.success) {
            console.log('✅ Instagram data fetched successfully');
            results.push('Instagram');
          } else {
            console.error('❌ Failed to fetch Instagram data:', instagramResult.error);
            alert(`❌ Instagram Data Error: ${instagramResult.error}\n\nPlease check your Instagram token and permissions in Settings.`);
          }
        } catch (error) {
          console.error('❌ Error fetching Instagram data:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          alert(`❌ Instagram Connection Error: ${errorMessage}\n\nPlease check your Instagram settings and try again.`);
        }
      }
      
      // Reload dashboard data to show updated analytics
      await loadDashboardData();
      
      if (results.length > 0) {
        console.log(`✅ Successfully refreshed data for: ${results.join(', ')}`);
      } else {
        console.log('ℹ️ No connected platforms to refresh');
      }
      
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
      alert('Error refreshing data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add clear data functionality
  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all analytics data? This will reset all reach, posts, and engagement numbers to zero.')) {
      try {
        setLoading(true);
        console.log('🗑️ Clearing analytics data...');
        
        const result = await window.electronAPI.analytics.clearData();
        
        if (result.success) {
          console.log('✅ Analytics data cleared successfully');
          // Reload dashboard data to show zeros
          await loadDashboardData();
          alert('Analytics data cleared successfully');
        } else {
          console.error('❌ Failed to clear analytics data:', result.error);
          alert('Failed to clear analytics data. Please try again.');
        }
      } catch (error) {
        console.error('❌ Error clearing analytics data:', error);
        alert('Error clearing analytics data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load platform stats first to check connections
      const stats = await window.electronAPI.analytics.getPlatformStats();
      // Add threads platform if not present
      const statsWithThreads: PlatformStats = {
        ...stats,
        threads: (stats as any).threads || { connected: false, accountName: undefined }
      };
      setPlatformStats(statsWithThreads);
      
      // Load analytics data (will show 0s if no data available)
      try {
        const analyticsData = await window.electronAPI.analytics.getData();
        // Add threads data if not present and ensure all required fields exist
        const analyticsWithThreads: AnalyticsData = {
          ...analyticsData,
          facebook: {
            ...analyticsData.facebook,
            postsCount: (analyticsData.facebook as any)?.postsCount || analyticsData.facebook.posts || 0,
            storiesReelsCount: (analyticsData.facebook as any)?.storiesReelsCount || 0,
            postsReach: (analyticsData.facebook as any)?.postsReach || analyticsData.facebook.reach || 0,
            storiesReelsReach: (analyticsData.facebook as any)?.storiesReelsReach || 0,
            postsEngagement: (analyticsData.facebook as any)?.postsEngagement || analyticsData.facebook.engagement || 0,
            storiesReelsEngagement: (analyticsData.facebook as any)?.storiesReelsEngagement || 0
          },
          threads: {
            ...(analyticsData as any).threads || { reach: 0, posts: 0, engagement: 0 },
            postsCount: (analyticsData as any)?.threads?.postsCount || (analyticsData as any)?.threads?.posts || 0,
            storiesReelsCount: (analyticsData as any)?.threads?.storiesReelsCount || 0,
            postsReach: (analyticsData as any)?.threads?.postsReach || (analyticsData as any)?.threads?.reach || 0,
            storiesReelsReach: (analyticsData as any)?.threads?.storiesReelsReach || 0,
            postsEngagement: (analyticsData as any)?.threads?.postsEngagement || (analyticsData as any)?.threads?.engagement || 0,
            storiesReelsEngagement: (analyticsData as any)?.threads?.storiesReelsEngagement || 0
          },
          total: {
            ...analyticsData.total,
            postsCount: (analyticsData.total as any)?.postsCount || analyticsData.total.posts || 0,
            storiesReelsCount: (analyticsData.total as any)?.storiesReelsCount || 0,
            postsReach: (analyticsData.total as any)?.postsReach || analyticsData.total.reach || 0,
            storiesReelsReach: (analyticsData.total as any)?.storiesReelsReach || 0,
            postsEngagement: (analyticsData.total as any)?.postsEngagement || analyticsData.total.engagement || 0,
            storiesReelsEngagement: (analyticsData.total as any)?.storiesReelsEngagement || 0
          }
        };
        setAnalytics(analyticsWithThreads);
      } catch (analyticsError) {
        console.warn('Analytics data not available:', analyticsError);
        // Keep default values (all zeros)
      }
      
      // Load pending actions
      try {
        const actions = await window.electronAPI.analytics.getPendingActions();
        setPendingActions(actions);
      } catch (actionsError) {
        console.warn('Pending actions not available:', actionsError);
      }
      
      // Load today's schedule
      try {
        const schedule = await window.electronAPI.analytics.getTodaysSchedule();
        setTodaysSchedule(schedule);
      } catch (scheduleError) {
        console.warn('Schedule data not available:', scheduleError);
      }
      
      // Load detailed analytics data
      try {
        const metricsData = await window.electronAPI.analytics.getMetrics({
          platform: selectedPlatform === 'all' ? undefined : selectedPlatform,
          days: parseInt(dateRange)
        });
        setMetrics(metricsData);
      } catch (metricsError) {
        console.warn('Detailed metrics not available:', metricsError);
      }
      
      try {
        const trendsData = await window.electronAPI.analytics.getTrends(
          selectedPlatform === 'all' ? undefined : selectedPlatform,
          parseInt(dateRange)
        );
        setTrends(trendsData);
      } catch (trendsError) {
        console.warn('Trends data not available:', trendsError);
      }
      
      try {
        const topPostsData = await window.electronAPI.analytics.getTopPosts(
          selectedPlatform === 'all' ? undefined : selectedPlatform,
          10,
          parseInt(dateRange)
        );
        setTopPosts(topPostsData);
      } catch (postsError) {
        console.warn('Top posts data not available:', postsError);
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformStatusIcon = (connected: boolean) => {
    return connected ? '✅' : '❌';
  };

  const getPlatformStatusText = (connected: boolean, accountName?: string) => {
    if (connected && accountName) {
      return `Connected (${accountName})`;
    } else if (connected) {
      return 'Connected';
    } else {
      return 'Not Connected';
    }
  };

  const hasAnyConnectedPlatforms = () => {
    return Object.values(platformStats).some(platform => platform.connected);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <h2>Dashboard</h2>
        <div className="loading">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <button 
          onClick={handleRefreshAllData}
          className="refresh-button"
          disabled={loading}
        >
          🔄 Refresh All Data
        </button>
      </div>
      
      {/* Platform Connection Status */}
      <section className="platform-status">
        <h3>Platform Connections</h3>
        <div className="platform-grid">
          <div 
            className={`platform-card ${platformStats.facebook?.connected ? 'connected' : 'disconnected'}`}
            onClick={!platformStats.facebook?.connected ? () => navigateToSettings?.('social-media') : undefined}
            style={!platformStats.facebook?.connected ? { cursor: 'pointer' } : {}}
          >
            <h4>Facebook {getPlatformStatusIcon(platformStats.facebook?.connected || false)}</h4>
            <p>{getPlatformStatusText(platformStats.facebook?.connected || false, platformStats.facebook?.accountName)}</p>
            {!platformStats.facebook?.connected && (
              <button onClick={(e) => { e.stopPropagation(); navigateToSettings?.('social-media'); }} className="connect-platform-button">
                Connect Facebook
              </button>
            )}
          </div>
          

          
          <div 
            className={`platform-card ${platformStats.threads?.connected ? 'connected' : 'disconnected'}`}
            onClick={!platformStats.threads?.connected ? () => navigateToSettings?.('social-media') : undefined}
            style={!platformStats.threads?.connected ? { cursor: 'pointer' } : {}}
          >
            <h4>Threads {getPlatformStatusIcon(platformStats.threads?.connected || false)}</h4>
            <p>{getPlatformStatusText(platformStats.threads?.connected || false, platformStats.threads?.accountName)}</p>
            {!platformStats.threads?.connected && (
              <button onClick={(e) => { e.stopPropagation(); navigateToSettings?.('social-media'); }} className="connect-platform-button">
                Connect Threads
              </button>
            )}
          </div>
        </div>
      </section>
      
      {/* Analytics Overview */}
      <section className="analytics-overview">
        <div className="section-header">
          <h3>Analytics Overview</h3>
          <div className="section-actions">
            <button onClick={handleRefreshAllData} className="refresh-button" disabled={loading}>
              {loading ? '🔄 Loading...' : '🔄 Refresh All Data'}
            </button>
            <button onClick={handleClearData} className="clear-button" disabled={loading}>
              🗑️ Clear Data
            </button>
          </div>
        </div>
        {!hasAnyConnectedPlatforms() && (
          <div className="section-warning">
            <p>⚠️ Connect your social media accounts to see analytics data</p>
            <button onClick={() => navigateToSettings?.('social-media')} className="connect-button">
              Go to Settings
            </button>
          </div>
        )}
        <div className="analytics-grid">
          {/* Facebook Posts Card */}
          <div 
            className="analytics-card facebook-posts"
            onClick={!platformStats.facebook?.connected ? () => navigateToSettings?.('social-media') : undefined}
            style={!platformStats.facebook?.connected ? { cursor: 'pointer' } : {}}
          >
            <h4>📝 Facebook Posts</h4>
            <div className="analytics-stats">
              <div className="stat">
                <span className="stat-value">{analytics.facebook.postsReach.toLocaleString()}</span>
                <span className="stat-label">reach</span>
              </div>
              <div className="stat">
                <span className="stat-value">{analytics.facebook.postsCount}</span>
                <span className="stat-label">posts</span>
              </div>
              <div className="stat">
                <span className="stat-value">{analytics.facebook.postsEngagement}</span>
                <span className="stat-label">engagement</span>
              </div>
            </div>
            {!platformStats.facebook?.connected && (
              <div className="platform-warning">Not connected - Click to connect</div>
            )}
          </div>

          {/* Facebook Stories/Reels Card */}
          <div 
            className="analytics-card facebook-stories-reels"
            onClick={!platformStats.facebook?.connected ? () => navigateToSettings?.('social-media') : undefined}
            style={!platformStats.facebook?.connected ? { cursor: 'pointer' } : {}}
          >
            <h4>🎬 Facebook Stories/Reels</h4>
            <div className="analytics-stats">
              <div className="stat">
                <span className="stat-value">{analytics.facebook.storiesReelsReach.toLocaleString()}</span>
                <span className="stat-label">reach</span>
              </div>
              <div className="stat">
                <span className="stat-value">{analytics.facebook.storiesReelsCount}</span>
                <span className="stat-label">content</span>
              </div>
              <div className="stat">
                <span className="stat-value">{analytics.facebook.storiesReelsEngagement}</span>
                <span className="stat-label">engagement</span>
              </div>
            </div>
            {!platformStats.facebook?.connected && (
              <div className="platform-warning">Not connected - Click to connect</div>
            )}
          </div>
          

          
          <div 
            className="analytics-card"
            onClick={!platformStats.threads?.connected ? () => navigateToSettings?.('social-media') : undefined}
            style={!platformStats.threads?.connected ? { cursor: 'pointer' } : {}}
          >
            <h4>Threads</h4>
            <div className="analytics-stats">
              <div className="stat">
                <span className="stat-value">{analytics.threads?.reach?.toLocaleString() || '0'}</span>
                <span className="stat-label">reach</span>
              </div>
              <div className="stat">
                <span className="stat-value">{analytics.threads?.posts || 0}</span>
                <span className="stat-label">posts</span>
              </div>
              <div className="stat">
                <span className="stat-value">{analytics.threads?.engagement || 0}</span>
                <span className="stat-label">engagement</span>
              </div>
            </div>
            {!platformStats.threads?.connected && (
              <div className="platform-warning">Not connected - Click to connect</div>
            )}
          </div>
          
          <div className="analytics-card total">
            <h4>Total</h4>
            <div className="analytics-stats">
              <div className="stat">
                <span className="stat-value">{analytics.total.reach.toLocaleString()}</span>
                <span className="stat-label">reach</span>
              </div>
              <div className="stat">
                <span className="stat-value">{analytics.total.posts}</span>
                <span className="stat-label">posts</span>
              </div>
              <div className="stat">
                <span className="stat-value">{analytics.total.engagement}</span>
                <span className="stat-label">engagement</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Analytics */}
      <section className="detailed-analytics">
        <h3>Detailed Analytics</h3>
        {!hasAnyConnectedPlatforms() && (
          <div className="section-warning">
            <p>📊 Connect your social media accounts to view detailed analytics</p>
          </div>
        )}
        
        {/* Analytics Filters */}
        <div className="analytics-filters">
          <select 
            value={selectedPlatform} 
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="platform-filter"
          >
            <option value="all">All Platforms</option>
            <option value="facebook">Facebook</option>
            <option value="threads">Threads</option>

          </select>
          
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="date-filter"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>

        {/* Performance Metrics */}
        <div className="performance-metrics">
          <h4>Performance Metrics</h4>
          {metrics.length > 0 ? (
            <div className="metrics-grid">
              {metrics.slice(0, 6).map((metric) => (
                <div key={metric.id} className="metric-card">
                  <div className="metric-header">
                    <span className="platform-badge">{metric.platform}</span>
                    <span className="metric-date">{new Date(metric.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="metric-stats">
                    <div className="metric-stat">
                      <span className="stat-value">{metric.reach.toLocaleString()}</span>
                      <span className="stat-label">Reach</span>
                    </div>
                    <div className="metric-stat">
                      <span className="stat-value">{metric.engagementRate.toFixed(2)}%</span>
                      <span className="stat-label">Engagement Rate</span>
                    </div>
                    <div className="metric-stat">
                      <span className="stat-value">{metric.likes + metric.comments + metric.shares}</span>
                      <span className="stat-label">Total Engagement</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data-message">
              <p>No performance metrics available yet</p>
              {!hasAnyConnectedPlatforms() && (
                <button onClick={() => navigateToSettings?.()} className="connect-button">
                  Connect Accounts
                </button>
              )}
            </div>
          )}
        </div>

        {/* Top Performing Posts */}
        <div className="top-posts">
          <h4>Top Performing Posts</h4>
          {topPosts.length > 0 ? (
            <div className="posts-grid">
              {topPosts.slice(0, 4).map((post) => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <span className="platform-badge">{post.platform}</span>
                    <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="post-content">
                    <p>{post.content.substring(0, 100)}...</p>
                  </div>
                  <div className="post-stats">
                    <div className="post-stat">
                      <span className="stat-value">{post.analytics.reach.toLocaleString()}</span>
                      <span className="stat-label">Reach</span>
                    </div>
                    <div className="post-stat">
                      <span className="stat-value">{post.analytics.engagementRate.toFixed(2)}%</span>
                      <span className="stat-label">Engagement</span>
                    </div>
                    <div className="post-stat">
                      <span className="stat-value">{post.analytics.likes + post.analytics.comments + post.analytics.shares}</span>
                      <span className="stat-label">Total</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data-message">
              <p>No top performing posts available yet</p>
              {!hasAnyConnectedPlatforms() && (
                <button onClick={() => navigateToSettings?.('content-studio')} className="create-button">
                  Create Your First Post
                </button>
              )}
            </div>
          )}
        </div>

        {/* Trends Overview */}
        <div className="trends-overview">
          <h4>Performance Trends</h4>
          {trends.length > 0 ? (
            <div className="trends-grid">
              {trends.slice(0, 4).map((trend) => (
                <div key={trend.id} className="trend-card">
                  <div className="trend-header">
                    <span className="platform-badge">{trend.platform}</span>
                    <span className="trend-date">{new Date(trend.date).toLocaleDateString()}</span>
                  </div>
                  <div className="trend-stats">
                    <div className="trend-stat">
                      <span className="stat-value">{trend.totalReach.toLocaleString()}</span>
                      <span className="stat-label">Total Reach</span>
                    </div>
                    <div className="trend-stat">
                      <span className="stat-value">{trend.avgEngagementRate.toFixed(2)}%</span>
                      <span className="stat-label">Avg Engagement</span>
                    </div>
                    <div className="trend-stat">
                      <span className="stat-value">{trend.totalPosts}</span>
                      <span className="stat-label">Posts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data-message">
              <p>No trend data available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Today's Schedule */}
      <section className="todays-schedule">
        <h3>Today's Schedule</h3>
        {todaysSchedule.length > 0 ? (
          <div className="schedule-list">
            {todaysSchedule.map((item, index) => (
              <div key={index} className={`schedule-item ${item.status}`}>
                <span className="schedule-time">{item.time}</span>
                <span className="schedule-platform">{item.platform}</span>
                <span className="schedule-content">{item.content}</span>
                <span className="schedule-status">{item.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-schedule">
            <p>No posts scheduled for today</p>
            <button onClick={() => navigateToSettings?.('scheduler')} className="action-button">
              Schedule a Post
            </button>
          </div>
        )}
      </section>

      {/* Pending Actions */}
      <section className="pending-actions">
        <h3>Pending Actions</h3>
        {pendingActions.length > 0 ? (
          <ul className="actions-list">
            {pendingActions.map((action, index) => (
              <li key={index} className="action-item">
                • {action}
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-actions">
            <p>No pending actions</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard; 