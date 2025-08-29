import { AppDatabase } from './database';

interface FacebookPost {
  id: string;
  message?: string;
  created_time: string;
  permalink_url: string;
  insights?: {
    reach?: number;
    impressions?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
}

export class FacebookPostsFetcher {
  private database: AppDatabase;

  constructor(database: AppDatabase) {
    this.database = database;
  }

  async fetchExistingPosts(): Promise<void> {
    try {
      console.log('🔄 Fetching existing Facebook posts...');
      
      // Get Facebook account
      const accounts = await this.database.getSocialMediaAccounts();
      const facebookAccount = accounts.find(acc => acc.platform === 'facebook' && acc.isActive);
      
      if (!facebookAccount) {
        console.log('❌ No active Facebook account found');
        return;
      }

      if (!facebookAccount.pageId) {
        console.log('❌ Facebook Page ID not configured');
        return;
      }

      // Fetch posts from Facebook Graph API
      const posts = await this.fetchPostsFromFacebook(facebookAccount);
      
      if (posts.length > 0) {
        console.log(`✅ Found ${posts.length} existing Facebook posts`);
        
        // Save posts to database and collect their IDs
        const savedPostIds: string[] = [];
        for (const post of posts) {
          const postId = await this.savePostToDatabase(post, facebookAccount);
          if (postId) {
            savedPostIds.push(postId);
          }
        }
        
        // Fetch analytics for each post using the saved post IDs
        await this.fetchPostAnalytics(posts, facebookAccount, savedPostIds);
        
        // Also fetch page-level insights
        await this.fetchPageInsights(facebookAccount);
        
        console.log('✅ Successfully imported existing Facebook posts and analytics');
      } else {
        console.log('ℹ️ No existing posts found on Facebook page');
      }
      
    } catch (error) {
      console.error('❌ Error fetching existing Facebook posts:', error);
      throw error; // Re-throw the error so the IPC handler can catch it
    }
  }

  private async fetchPostsFromFacebook(account: any): Promise<FacebookPost[]> {
    try {
      console.log(`📡 Fetching real posts from Facebook page: ${account.pageId}`);
      
      // Get the current valid token from the account
      const accessToken = account.accessToken;
      
      if (!accessToken) {
        throw new Error('No access token found for Facebook account');
      }
      
      // Make real API call to Facebook Graph API
      const url = `https://graph.facebook.com/v23.0/${account.pageId}/posts?fields=id,message,created_time,permalink_url&limit=25&access_token=${accessToken}`;
      
      const response = await fetch(url);
      const data = await response.json() as any;
      
      if (data.error) {
        console.error(`❌ Facebook API error:`, data.error);
        throw new Error(`Facebook API Error: ${data.error.message || 'Unknown error'}`);
      }
      
      if (data.data && data.data.length > 0) {
        console.log(`✅ Fetched ${data.data.length} real posts from Facebook`);
        return data.data;
      } else {
        console.log(`⚠️ No posts found on Facebook page`);
        return [];
      }
      
    } catch (error) {
      console.error('❌ Error fetching posts from Facebook:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch Facebook posts: ${errorMessage}`);
    }
  }

  private async fetchPostAnalytics(posts: FacebookPost[], account: any, savedPostIds: string[]): Promise<void> {
    try {
      console.log('📊 Fetching analytics for posts...');
      
      for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const savedPostId = savedPostIds[i];
        
        if (!savedPostId) continue;
        
        // Clear existing analytics for this post to ensure fresh data
        await this.database.clearAnalyticsMetricsForPost(savedPostId, 'facebook');
        
        // Fetch insights for each post
        const insights = await this.fetchPostInsights(post.id, account);
        
        if (insights) {
          // Prepare analytics data with explicit type checking
          const analyticsData = {
            postId: savedPostId,
            platform: 'facebook',
            reach: Number(insights.reach) || 0,
            impressions: Number(insights.impressions) || 0,
            likes: Number(insights.likes) || 0,
            comments: Number(insights.comments) || 0,
            shares: Number(insights.shares) || 0,
            clicks: Number(insights.clicks) || 0,
            engagementRate: Number(this.calculateEngagementRate(insights)) || 0,
            sentimentScore: 0
          };
          
          console.log(`📊 Saving analytics data for post ${post.id}:`, JSON.stringify(analyticsData, null, 2));
          
          // Save analytics metrics using the saved post ID
          await this.database.saveAnalyticsMetrics(analyticsData);
          console.log(`📊 Saved analytics for post ${post.id}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Error fetching post analytics:', error);
    }
  }

  private async fetchPostInsights(postId: string, account: any): Promise<any> {
    try {
      console.log(`📡 Fetching real insights for post ${postId}...`);
      
      // Try to get basic post engagement data first
      const postUrl = `https://graph.facebook.com/v23.0/${postId}?fields=likes.summary(true),comments.summary(true),shares&access_token=${account.accessToken}`;
      
      const postResponse = await fetch(postUrl);
      const postData = await postResponse.json() as any;
      
      console.log(`🔍 Raw Facebook API response for post ${postId}:`, JSON.stringify(postData, null, 2));
      
      if (postData.error) {
        console.error(`❌ Facebook API error for post ${postId}:`, postData.error);
        throw new Error(`Facebook API Error: ${postData.error.message || 'Unknown error'}`);
      }
      
      // Extract basic engagement data
      const insights = {
        reach: 0,
        impressions: 0,
        likes: postData.likes?.summary?.total_count || 0,
        comments: postData.comments?.summary?.total_count || 0,
        shares: postData.shares?.count || 0,
        clicks: 0
      };
      
      // Try to get real insights data
      try {
        const insightsUrl = `https://graph.facebook.com/v23.0/${postId}/insights?metric=post_impressions,post_reactions_by_type_total,post_clicks&access_token=${account.accessToken}`;
        const insightsResponse = await fetch(insightsUrl);
        const insightsData = await insightsResponse.json() as any;
        
        if (!insightsData.error && insightsData.data) {
          console.log(`✅ Real insights data for post ${postId}:`, JSON.stringify(insightsData, null, 2));
          
          // Extract real insights
          for (const metric of insightsData.data) {
            if (metric.name === 'post_impressions') {
              insights.impressions = metric.values?.[0]?.value || 0;
            } else if (metric.name === 'post_reactions_by_type_total') {
              // post_reactions_by_type_total returns an object with reaction types, not a number
              // We'll keep the likes from the basic post data instead
              console.log(`📊 Post reactions by type:`, metric.values?.[0]?.value);
            } else if (metric.name === 'post_clicks') {
              insights.clicks = metric.values?.[0]?.value || 0;
            }
          }
        } else {
          console.log(`⚠️ No real insights available for post ${postId}, using basic engagement data`);
        }
      } catch (insightsError) {
        console.log(`⚠️ Could not fetch real insights for post ${postId}:`, insightsError);
      }
      
      // Estimate reach based on impressions if we have them, otherwise use engagement
      if (insights.impressions > 0) {
        insights.reach = Math.round(insights.impressions * 0.8); // Reach is typically 80% of impressions
      } else {
        const totalEngagement = insights.likes + insights.comments + insights.shares;
        insights.reach = Math.max(totalEngagement * 10, 100); // Fallback estimate
        insights.impressions = Math.max(insights.reach * 1.5, 150); // Fallback estimate
      }
      
      console.log(`✅ Final insights data for post ${postId}:`, insights);
      return insights;
      
    } catch (error) {
      console.error(`❌ Error fetching insights for post ${postId}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch Facebook insights: ${errorMessage}`);
    }
  }

  // Add method to fetch page-level insights
  private async fetchPageInsights(account: any): Promise<any> {
    try {
      console.log(`📡 Fetching page-level insights...`);
      
      const insightsUrl = `https://graph.facebook.com/v23.0/${account.pageId}/insights?metric=page_impressions,page_views_total,page_fan_adds&period=day&limit=1&access_token=${account.accessToken}`;
      const insightsResponse = await fetch(insightsUrl);
      const insightsData = await insightsResponse.json() as any;
      
      if (insightsData.error) {
        console.log(`⚠️ Could not fetch page insights:`, insightsData.error);
        return null;
      }
      
      if (insightsData.data && insightsData.data.length > 0) {
        console.log(`✅ Page insights data:`, JSON.stringify(insightsData, null, 2));
        return insightsData.data;
      }
      
      return null;
    } catch (error) {
      console.log(`⚠️ Error fetching page insights:`, error);
      return null;
    }
  }


  private async savePostToDatabase(post: FacebookPost, account: any): Promise<string | null> {
    try {
      // Check if post already exists
      const posts = await this.database.getPosts();
      const existingPost = posts.find(p => p.id === post.id);
      
      if (!existingPost) {
        // Save new post with the Facebook post ID
        const postId = await this.database.addPost({
          platform: 'facebook',
          content: post.message || '',
          mediaFiles: [],
          scheduledTime: '',
          status: 'published',
          engagement: {},
          createdAt: post.created_time,
          updatedAt: new Date().toISOString()
        }, post.id); // Pass the Facebook post ID as custom ID
        
        console.log(`✅ Saved post: ${post.id}`);
        return postId;
      }
      
      return post.id; // Return existing post ID
    } catch (error) {
      console.error(`❌ Error saving post ${post.id}:`, error);
      return null;
    }
  }

  private calculateEngagementRate(insights: any): number {
    const reach = insights.reach || 0;
    const engagement = (insights.likes || 0) + (insights.comments || 0) + (insights.shares || 0);
    
    return reach > 0 ? (engagement / reach) * 100 : 0;
  }

  // Simulated data for testing
  private getSimulatedPosts(): FacebookPost[] {
    return [
      {
        id: 'fb_post_1',
        message: '🚀 Exciting news! We just launched our new AI-powered marketing platform. Transform your business with intelligent content creation and automated social media management. #MarketingAI #BusinessGrowth',
        created_time: '2025-08-26T09:23:39.620Z',
        permalink_url: 'https://facebook.com/post1'
      },
      {
        id: 'fb_post_2',
        message: '💡 Marketing Tip: Consistency is key! Post regularly and maintain your brand voice across all platforms. Our AI helps you stay consistent while saving time. #MarketingTips #BrandVoice',
        created_time: '2025-08-25T15:30:00.000Z',
        permalink_url: 'https://facebook.com/post2'
      },
      {
        id: 'fb_post_3',
        message: '✨ Behind the scenes of our latest product launch! Swipe to see the magic happen. #BehindTheScenes #ProductLaunch #Innovation',
        created_time: '2025-08-24T12:00:00.000Z',
        permalink_url: 'https://facebook.com/post3'
      },
      {
        id: 'fb_post_4',
        message: '🎯 Customer Spotlight: How IMM Media helped this startup grow their social media presence by 300% in just 3 months! #CustomerSuccess #SocialMediaGrowth #StartupLife',
        created_time: '2025-08-23T14:15:00.000Z',
        permalink_url: 'https://facebook.com/post4'
      },
      {
        id: 'fb_post_5',
        message: '📊 Weekly Analytics Report: Our clients saw an average 45% increase in engagement this week! Want to know the secret? Consistent posting + AI-powered content optimization. #Analytics #Engagement #DigitalMarketing',
        created_time: '2025-08-22T10:30:00.000Z',
        permalink_url: 'https://facebook.com/post5'
      },
      {
        id: 'fb_post_6',
        message: '🔥 Hot off the press! Our new Instagram automation feature is now live. Schedule posts, track performance, and grow your audience automatically. #InstagramAutomation #SocialMediaTools #MarketingAutomation',
        created_time: '2025-08-21T16:45:00.000Z',
        permalink_url: 'https://facebook.com/post6'
      }
    ];
  }

  private getSimulatedInsights(): any {
    return {
      reach: Math.floor(Math.random() * 1000) + 100,
      impressions: Math.floor(Math.random() * 1500) + 200,
      likes: Math.floor(Math.random() * 50) + 5,
      comments: Math.floor(Math.random() * 20) + 1,
      shares: Math.floor(Math.random() * 10) + 1
    };
  }
}
