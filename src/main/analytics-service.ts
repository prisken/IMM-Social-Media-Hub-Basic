import { AppDatabase } from './database';

export class AnalyticsService {
  private database: AppDatabase;

  constructor(database: AppDatabase) {
    this.database = database;
  }

  async fetchAndStoreMetrics(postId: string, platform: string): Promise<void> {
    try {
      // Check if we have real social media connections
      const accounts = await this.database.getSocialMediaAccounts();
      const platformAccount = accounts.find(acc => acc.platform === platform && acc.isActive);
      
      if (!platformAccount) {
        throw new Error(`No active ${platform} account found. Please connect your ${platform} account in Settings.`);
      }

      // Attempt to fetch real metrics from the platform API
      const metrics = await this.fetchRealMetrics(postId, platform, platformAccount);
      
      if (metrics) {
        // Store the real metrics in the database
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

        console.log(`✅ Real analytics metrics stored for post ${postId} on ${platform}`);
      } else {
        throw new Error(`Unable to fetch metrics for post ${postId} from ${platform}. Please check your account connection.`);
      }
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
        // Check if we have an active account for this platform
        const accounts = await this.database.getSocialMediaAccounts();
        const platformAccount = accounts.find(acc => acc.platform === platform && acc.isActive);
        
        if (!platformAccount) {
          console.log(`⚠️ No active ${platform} account found. Skipping trend update.`);
          continue;
        }

        // Get today's real metrics for this platform
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

          // Determine top content type from real data
          const topContentType = this.determineTopContentType(todayMetrics);

          // Save the real trend
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

      console.log('✅ Daily trends updated with real data');
    } catch (error) {
      console.error('❌ Error updating daily trends:', error);
      throw error;
    }
  }

  async updateBrandVoicePerformance(): Promise<void> {
    try {
      // Get brand voice profiles
      const profiles = await this.database.getBrandVoiceProfiles();
      
      if (profiles.length === 0) {
        console.log('⚠️ No brand voice profiles found. Skipping performance update.');
        return;
      }
      
      for (const profile of profiles) {
        // Get posts using this voice profile from real data
        const posts = await this.database.getPosts();
        const profilePosts = posts.filter(post => 
          post.content.toLowerCase().includes(profile.tone.toLowerCase()) ||
          post.content.toLowerCase().includes(profile.style.toLowerCase())
        );

        if (profilePosts.length > 0) {
          // Calculate performance metrics from real engagement data
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

          // Save real performance data
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

      console.log('✅ Brand voice performance updated with real data');
    } catch (error) {
      console.error('❌ Error updating brand voice performance:', error);
      throw error;
    }
  }

  private async fetchRealMetrics(postId: string, platform: string, account: any): Promise<any | null> {
    try {
      // This would integrate with real social media APIs
      // For now, we'll return null to indicate no real data is available
      // In a real implementation, this would make actual API calls to:
      // - Facebook Graph API
      // - Instagram Basic Display API
      // - LinkedIn Marketing API
      
      console.log(`Attempting to fetch real metrics for post ${postId} from ${platform}...`);
      
      // Placeholder for real API integration
      // const response = await fetch(`${platformApiUrl}/posts/${postId}/insights`, {
      //   headers: { 'Authorization': `Bearer ${account.accessToken}` }
      // });
      // return await response.json();
      
      return null; // No real data available yet
    } catch (error) {
      console.error(`Failed to fetch real metrics from ${platform}:`, error);
      return null;
    }
  }

  private determineTopContentType(metrics: any[]): string {
    // Analyze real post content to determine top content type
    // This would use actual content analysis in a real implementation
    if (metrics.length === 0) return 'No Data';
    
    // For now, return a generic type since we don't have real content analysis
    return 'Content Analysis Required';
  }

  private calculateAverageSentiment(posts: any[]): number {
    // Calculate sentiment from real engagement data
    if (posts.length === 0) return 0;
    
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
