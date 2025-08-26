import React, { useEffect, useState } from 'react';
import './Dashboard.css';

interface AnalyticsData {
  facebook: { reach: number; posts: number; engagement: number };
  instagram: { reach: number; posts: number; engagement: number };
  linkedin: { reach: number; posts: number; engagement: number };
  total: { reach: number; posts: number; engagement: number };
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

function Dashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    facebook: { reach: 0, posts: 0, engagement: 0 },
    instagram: { reach: 0, posts: 0, engagement: 0 },
    linkedin: { reach: 0, posts: 0, engagement: 0 },
    total: { reach: 0, posts: 0, engagement: 0 }
  });

  const [pendingActions, setPendingActions] = useState<string[]>([]);
  const [todaysSchedule, setTodaysSchedule] = useState<ScheduleItem[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats>({
    facebook: { connected: false },
    instagram: { connected: false },
    linkedin: { connected: false }
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

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load analytics data
      const analyticsData = await window.electronAPI.analytics.getData();
      setAnalytics(analyticsData);
      
      // Load pending actions
      const actions = await window.electronAPI.analytics.getPendingActions();
      setPendingActions(actions);
      
      // Load today's schedule
      const schedule = await window.electronAPI.analytics.getTodaysSchedule();
      setTodaysSchedule(schedule);
      
      // Load platform stats
      const stats = await window.electronAPI.analytics.getPlatformStats();
      setPlatformStats(stats);
      
      // Load detailed analytics data
      const metricsData = await window.electronAPI.analytics.getMetrics(selectedPlatform, dateRange);
      setMetrics(metricsData);
      
      const trendsData = await window.electronAPI.analytics.getTrends(selectedPlatform, dateRange);
      setTrends(trendsData);
      
      const topPostsData = await window.electronAPI.analytics.getTopPosts(selectedPlatform, dateRange);
      setTopPosts(topPostsData);
      
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
      <h2>Dashboard</h2>
      
      {/* Platform Connection Status */}
      <section className="platform-status">
        <h3>Platform Connections</h3>
        <div className="platform-grid">
          <div className={`platform-card ${platformStats.facebook?.connected ? 'connected' : 'disconnected'}`}>
            <h4>Facebook {getPlatformStatusIcon(platformStats.facebook?.connected || false)}</h4>
            <p>{getPlatformStatusText(platformStats.facebook?.connected || false, platformStats.facebook?.accountName)}</p>
          </div>
          
          <div className={`platform-card ${platformStats.instagram?.connected ? 'connected' : 'disconnected'}`}>
            <h4>Instagram {getPlatformStatusIcon(platformStats.instagram?.connected || false)}</h4>
            <p>{getPlatformStatusText(platformStats.instagram?.connected || false, platformStats.instagram?.accountName)}</p>
          </div>
          
          <div className={`platform-card ${platformStats.linkedin?.connected ? 'connected' : 'disconnected'}`}>
            <h4>LinkedIn {getPlatformStatusIcon(platformStats.linkedin?.connected || false)}</h4>
            <p>{getPlatformStatusText(platformStats.linkedin?.connected || false, platformStats.linkedin?.accountName)}</p>
          </div>
        </div>
      </section>
      
      {/* Analytics Overview */}
      <section className="analytics-overview">
        <h3>Analytics Overview</h3>
        <div className="analytics-grid">
          <div className="analytics-card">
            <h4>Facebook</h4>
            <div className="analytics-stats">
              <div className="stat">
                <span className="stat-value">{analytics.facebook.reach.toLocaleString()}</span>
                <span className="stat-label">reach</span>
              </div>
              <div className="stat">
                <span className="stat-value">{analytics.facebook.posts}</span>
                <span className="stat-label">posts</span>
              </div>
              <div className="stat">
                <span className="stat-value">{analytics.facebook.engagement}</span>
                <span className="stat-label">engagement</span>
              </div>
            </div>
          </div>
          
          <div className="analytics-card">
            <h4>Instagram</h4>
            <div className="analytics-stats">
              <div className="stat">
                <span className="stat-value">{analytics.instagram.reach.toLocaleString()}</span>
                <span className="stat-label">reach</span>
              </div>
              <div className="stat">
                <span className="stat-value">{analytics.instagram.posts}</span>
                <span className="stat-label">posts</span>
              </div>
              <div className="stat">
                <span className="stat-value">{analytics.instagram.engagement}</span>
                <span className="stat-label">engagement</span>
              </div>
            </div>
          </div>
          
          <div className="analytics-card">
            <h4>LinkedIn</h4>
            <div className="analytics-stats">
              <div className="stat">
                <span className="stat-value">{analytics.linkedin.reach.toLocaleString()}</span>
                <span className="stat-label">reach</span>
              </div>
              <div className="stat">
                <span className="stat-value">{analytics.linkedin.posts}</span>
                <span className="stat-label">posts</span>
              </div>
              <div className="stat">
                <span className="stat-value">{analytics.linkedin.engagement}</span>
                <span className="stat-label">engagement</span>
              </div>
            </div>
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
        
        {/* Analytics Filters */}
        <div className="analytics-filters">
          <select 
            value={selectedPlatform} 
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="platform-filter"
          >
            <option value="all">All Platforms</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
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
        </div>

        {/* Top Performing Posts */}
        <div className="top-posts">
          <h4>Top Performing Posts</h4>
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
        </div>

        {/* Trends Overview */}
        <div className="trends-overview">
          <h4>Performance Trends</h4>
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
          <p className="no-schedule">No posts scheduled for today</p>
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
          <p className="no-actions">No pending actions</p>
        )}
      </section>
    </div>
  );
}

export default Dashboard; 