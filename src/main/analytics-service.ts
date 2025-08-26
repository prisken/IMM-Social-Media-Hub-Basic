import { AppDatabase } from './database';

export class AnalyticsService {
  private database: AppDatabase;

  constructor(database: AppDatabase) {
    this.database = database;
  }

  async fetchAndStoreMetrics(postId: string, platform: string): Promise<void> {
    try {
      // Simulate fetching metrics from social media APIs
      // In a real implementation, this would call the actual platform APIs
      const metrics = await this.simulateFetchMetrics(postId, platform);
      
      // Store the metrics in the database
      await this.database.saveAnalyticsMetrics({
        postId,
        platform,
        reach: metrics.reach,
        impressions: metrics.impressions,
        likes: metrics.likes,
        comments: metrics.comments,
        shares: metrics.shares,
        clicks: metrics.clicks,
        engagementRate: metrics.engagementRate,
        sentimentScore: metrics.sentimentScore
      });

      console.log(`✅ Analytics metrics stored for post ${postId} on ${platform}`);
    } catch (error) {
      console.error(`❌ Error fetching metrics for post ${postId}:`, error);
      throw error;
    }
  }

  async updateDailyTrends(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const platforms = ['facebook', 'instagram', 'linkedin'];

      for (const platform of platforms) {
        // Get today's metrics for this platform
        const todayMetrics = await this.database.getAnalyticsMetrics(
          undefined, // all posts
          platform,
          today,
          today
        );

        if (todayMetrics.length > 0) {
          const totalReach = todayMetrics.reduce((sum, metric) => sum + metric.reach, 0);
          const totalEngagement = todayMetrics.reduce((sum, metric) => 
            sum + metric.likes + metric.comments + metric.shares, 0);
          const totalPosts = todayMetrics.length;
          const avgEngagementRate = totalReach > 0 ? totalEngagement / totalReach : 0;

          // Determine top content type (simplified)
          const topContentType = this.determineTopContentType(todayMetrics);

          // Save the trend
          await this.database.saveAnalyticsTrend({
            platform,
            date: today,
            totalReach,
            totalEngagement,
            totalPosts,
            avgEngagementRate,
            topContentType
          });
        }
      }

      console.log('✅ Daily trends updated');
    } catch (error) {
      console.error('❌ Error updating daily trends:', error);
      throw error;
    }
  }

  async updateBrandVoicePerformance(): Promise<void> {
    try {
      // Get brand voice profiles
      const profiles = await this.database.getBrandVoiceProfiles();
      
      for (const profile of profiles) {
        // Get posts using this voice profile (simplified - in real app would track voice profile usage)
        const posts = await this.database.getPosts();
        const profilePosts = posts.filter(post => 
          post.content.toLowerCase().includes(profile.tone.toLowerCase()) ||
          post.content.toLowerCase().includes(profile.style.toLowerCase())
        );

        if (profilePosts.length > 0) {
          // Calculate performance metrics
          const totalEngagement = profilePosts.reduce((sum, post) => {
            if (post.engagement) {
              return sum + (post.engagement.likes || 0) + (post.engagement.comments || 0) + (post.engagement.shares || 0);
            }
            return sum;
          }, 0);

          const totalReach = profilePosts.reduce((sum, post) => {
            if (post.engagement) {
              return sum + (post.engagement.reach || 0);
            }
            return sum;
          }, 0);

          const engagementRate = totalReach > 0 ? totalEngagement / totalReach : 0;
          const sentimentScore = this.calculateAverageSentiment(profilePosts);

          // Save performance data
          await this.database.saveBrandVoicePerformance({
            voiceProfileId: profile.id,
            tone: profile.tone,
            style: profile.style,
            engagementRate,
            sentimentScore,
            postCount: profilePosts.length,
            periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
            periodEnd: new Date().toISOString()
          });
        }
      }

      console.log('✅ Brand voice performance updated');
    } catch (error) {
      console.error('❌ Error updating brand voice performance:', error);
      throw error;
    }
  }

  private async simulateFetchMetrics(postId: string, platform: string): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Generate realistic mock data based on platform
    const baseReach = this.getPlatformBaseReach(platform);
    const baseEngagement = this.getPlatformBaseEngagement(platform);
    
    const reach = Math.floor(baseReach * (0.8 + Math.random() * 0.4)); // ±20% variation
    const impressions = Math.floor(reach * (1.2 + Math.random() * 0.6)); // 20-80% more than reach
    const likes = Math.floor(baseEngagement.likes * (0.7 + Math.random() * 0.6));
    const comments = Math.floor(baseEngagement.comments * (0.5 + Math.random() * 0.8));
    const shares = Math.floor(baseEngagement.shares * (0.3 + Math.random() * 1.0));
    const clicks = Math.floor(reach * (0.02 + Math.random() * 0.03)); // 2-5% click rate
    
    const totalEngagement = likes + comments + shares;
    const engagementRate = reach > 0 ? totalEngagement / reach : 0;
    
    // Calculate sentiment score (-1 to 1, where 1 is very positive)
    const sentimentScore = -0.5 + Math.random() * 1.5;

    return {
      reach,
      impressions,
      likes,
      comments,
      shares,
      clicks,
      engagementRate,
      sentimentScore
    };
  }

  private getPlatformBaseReach(platform: string): number {
    switch (platform.toLowerCase()) {
      case 'facebook': return 2500;
      case 'instagram': return 1800;
      case 'linkedin': return 900;
      default: return 1500;
    }
  }

  private getPlatformBaseEngagement(platform: string): { likes: number; comments: number; shares: number } {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return { likes: 120, comments: 15, shares: 8 };
      case 'instagram':
        return { likes: 150, comments: 12, shares: 5 };
      case 'linkedin':
        return { likes: 45, comments: 8, shares: 12 };
      default:
        return { likes: 100, comments: 12, shares: 8 };
    }
  }

  private determineTopContentType(metrics: any[]): string {
    // Simplified content type determination
    // In a real implementation, this would analyze post content
    const contentTypes = ['Tips & Advice', 'Success Stories', 'Industry Insights', 'Product Updates', 'Behind the Scenes'];
    return contentTypes[Math.floor(Math.random() * contentTypes.length)];
  }

  private calculateAverageSentiment(posts: any[]): number {
    // Simplified sentiment calculation
    // In a real implementation, this would use actual sentiment analysis
    let totalSentiment = 0;
    let count = 0;

    posts.forEach(post => {
      if (post.engagement && post.engagement.sentiment) {
        totalSentiment += post.engagement.sentiment;
        count++;
      }
    });

    return count > 0 ? totalSentiment / count : 0;
  }

  async scheduleMetricsUpdate(): Promise<void> {
    // Schedule regular metrics updates
    setInterval(async () => {
      try {
        await this.updateDailyTrends();
        await this.updateBrandVoicePerformance();
      } catch (error) {
        console.error('❌ Error in scheduled metrics update:', error);
      }
    }, 24 * 60 * 60 * 1000); // Update every 24 hours
  }
}
