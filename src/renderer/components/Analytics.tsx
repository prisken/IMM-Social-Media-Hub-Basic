import React, { useEffect, useState } from 'react';
import './Analytics.css';

interface AnalyticsData {
  facebook: { reach: number; posts: number; engagement: number };
  instagram: { reach: number; posts: number; engagement: number };
  linkedin: { reach: number; posts: number; engagement: number };
  total: { reach: number; posts: number; engagement: number };
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

interface BrandVoicePerformance {
  id: string;
  voiceProfileId: string;
  tone: string;
  style: string;
  engagementRate: number;
  sentimentScore: number;
  postCount: number;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    facebook: { reach: 0, posts: 0, engagement: 0 },
    instagram: { reach: 0, posts: 0, engagement: 0 },
    linkedin: { reach: 0, posts: 0, engagement: 0 },
    total: { reach: 0, posts: 0, engagement: 0 }
  });

  const [metrics, setMetrics] = useState<AnalyticsMetrics[]>([]);
  const [trends, setTrends] = useState<AnalyticsTrend[]>([]);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [brandVoicePerformance, setBrandVoicePerformance] = useState<BrandVoicePerformance[]>([]);
  
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPlatform, dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Load overview analytics
      const analyticsData = await window.electronAPI.analytics.getData();
      setAnalytics(analyticsData);
      
      // Load detailed metrics
      const metricsData = await window.electronAPI.analytics.getMetrics({
        platform: selectedPlatform === 'all' ? null : selectedPlatform,
        days: parseInt(dateRange)
      });
      setMetrics(metricsData);
      
      // Load trends
      const trendsData = await window.electronAPI.analytics.getTrends(
        selectedPlatform === 'all' ? null : selectedPlatform,
        parseInt(dateRange)
      );
      setTrends(trendsData);
      
      // Load top posts
      const topPostsData = await window.electronAPI.analytics.getTopPosts(
        selectedPlatform === 'all' ? null : selectedPlatform,
        10,
        parseInt(dateRange)
      );
      setTopPosts(topPostsData);
      
      // Load brand voice performance
      const voicePerformanceData = await window.electronAPI.analytics.getBrandVoicePerformance({
        days: parseInt(dateRange)
      });
      setBrandVoicePerformance(voicePerformanceData);
      
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (num: number): string => {
    return (num * 100).toFixed(1) + '%';
  };

  const getPlatformIcon = (platform: string): string => {
    switch (platform.toLowerCase()) {
      case 'facebook': return '📘';
      case 'instagram': return '📷';
      case 'linkedin': return '💼';
      default: return '📱';
    }
  };

  const getEngagementColor = (rate: number): string => {
    if (rate >= 0.08) return '#27ae60';
    if (rate >= 0.05) return '#f39c12';
    return '#e74c3c';
  };

  if (loading) {
    return (
      <div className="analytics">
        <div className="loading">Loading analytics data...</div>
      </div>
    );
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h2>📊 Analytics Dashboard</h2>
        <div className="analytics-controls">
          <select 
            value={selectedPlatform} 
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="platform-select"
          >
            <option value="all">All Platforms</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
          </select>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="date-select"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Overview Metrics */}
      <section className="analytics-section">
        <h3>Overview</h3>
        <div className="metrics-grid">
          <div className="metric-card total">
            <h4>Total Reach</h4>
            <div className="metric-value">{formatNumber(analytics.total.reach)}</div>
            <div className="metric-label">Across all platforms</div>
          </div>
          <div className="metric-card">
            <h4>Total Posts</h4>
            <div className="metric-value">{analytics.total.posts}</div>
            <div className="metric-label">Published content</div>
          </div>
          <div className="metric-card">
            <h4>Total Engagement</h4>
            <div className="metric-value">{formatNumber(analytics.total.engagement)}</div>
            <div className="metric-label">Likes, comments, shares</div>
          </div>
          <div className="metric-card">
            <h4>Avg Engagement Rate</h4>
            <div className="metric-value">
              {analytics.total.posts > 0 
                ? formatPercentage(analytics.total.engagement / analytics.total.posts / analytics.total.reach)
                : '0%'
              }
            </div>
            <div className="metric-label">Per post</div>
          </div>
        </div>
      </section>

      {/* Platform Breakdown */}
      <section className="analytics-section">
        <h3>Platform Performance</h3>
        <div className="platform-metrics">
          {Object.entries(analytics).filter(([key]) => key !== 'total').map(([platform, data]) => (
            <div key={platform} className="platform-metric-card">
              <div className="platform-header">
                <span className="platform-icon">{getPlatformIcon(platform)}</span>
                <h4>{platform.charAt(0).toUpperCase() + platform.slice(1)}</h4>
              </div>
              <div className="platform-stats">
                <div className="stat">
                  <span className="stat-value">{formatNumber(data.reach)}</span>
                  <span className="stat-label">Reach</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{data.posts}</span>
                  <span className="stat-label">Posts</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{formatNumber(data.engagement)}</span>
                  <span className="stat-label">Engagement</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top Performing Posts */}
      <section className="analytics-section">
        <h3>Top Performing Posts</h3>
        <div className="top-posts">
          {topPosts.map((post, index) => (
            <div key={post.id} className="top-post-card">
              <div className="post-rank">#{index + 1}</div>
              <div className="post-content">
                <div className="post-header">
                  <span className="platform-icon">{getPlatformIcon(post.platform)}</span>
                  <span className="post-platform">{post.platform}</span>
                  <span className="post-date">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="post-text">
                  {post.content.length > 100 
                    ? post.content.substring(0, 100) + '...' 
                    : post.content
                  }
                </div>
                <div className="post-metrics">
                  <span className="metric">
                    <span className="metric-icon">👁️</span>
                    {formatNumber(post.analytics.reach)}
                  </span>
                  <span className="metric">
                    <span className="metric-icon">❤️</span>
                    {formatNumber(post.analytics.likes)}
                  </span>
                  <span className="metric">
                    <span className="metric-icon">💬</span>
                    {formatNumber(post.analytics.comments)}
                  </span>
                  <span className="metric">
                    <span className="metric-icon">🔄</span>
                    {formatNumber(post.analytics.shares)}
                  </span>
                  <span 
                    className="engagement-rate"
                    style={{ color: getEngagementColor(post.analytics.engagementRate) }}
                  >
                    {formatPercentage(post.analytics.engagementRate)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trends Chart */}
      <section className="analytics-section">
        <h3>Engagement Trends</h3>
        <div className="trends-chart">
          {trends.length > 0 ? (
            <div className="chart-container">
              <div className="chart-labels">
                {trends.map(trend => (
                  <div key={trend.id} className="chart-label">
                    {new Date(trend.date).toLocaleDateString()}
                  </div>
                ))}
              </div>
              <div className="chart-bars">
                {trends.map(trend => (
                  <div key={trend.id} className="chart-bar-container">
                    <div 
                      className="chart-bar"
                      style={{ 
                        height: `${Math.min((trend.avgEngagementRate * 1000), 100)}%`,
                        backgroundColor: getEngagementColor(trend.avgEngagementRate)
                      }}
                    ></div>
                    <div className="bar-value">{formatPercentage(trend.avgEngagementRate)}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-data">No trend data available for the selected period.</div>
          )}
        </div>
      </section>

      {/* Brand Voice Performance */}
      <section className="analytics-section">
        <h3>Brand Voice Performance</h3>
        <div className="brand-voice-performance">
          {brandVoicePerformance.length > 0 ? (
            <div className="voice-metrics">
              {brandVoicePerformance.map(performance => (
                <div key={performance.id} className="voice-metric-card">
                  <div className="voice-header">
                    <h4>{performance.tone} - {performance.style}</h4>
                    <span className="post-count">{performance.postCount} posts</span>
                  </div>
                  <div className="voice-stats">
                    <div className="voice-stat">
                      <span className="stat-label">Engagement Rate</span>
                      <span 
                        className="stat-value"
                        style={{ color: getEngagementColor(performance.engagementRate) }}
                      >
                        {formatPercentage(performance.engagementRate)}
                      </span>
                    </div>
                    <div className="voice-stat">
                      <span className="stat-label">Sentiment Score</span>
                      <span className="stat-value">
                        {performance.sentimentScore > 0 ? '+' : ''}{performance.sentimentScore.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">No brand voice performance data available.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Analytics;

