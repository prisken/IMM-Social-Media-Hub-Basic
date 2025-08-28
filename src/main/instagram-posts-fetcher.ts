import { AppDatabase } from './database';

interface InstagramPost {
  id: string;
  caption?: string;
  media_type: string;
  media_url?: string;
  permalink: string;
  timestamp: string;
  insights?: {
    reach?: number;
    impressions?: number;
    likes?: number;
    comments?: number;
    saves?: number;
  };
}

export class InstagramPostsFetcher {
  private database: AppDatabase;

  constructor(database: AppDatabase) {
    this.database = database;
  }

  async fetchExistingPosts(): Promise<void> {
    try {
      console.log('🔄 Fetching existing Instagram posts...');
      
      // Get Instagram account and Facebook account (for token)
      const accounts = await this.database.getSocialMediaAccounts();
      const instagramAccount = accounts.find(acc => acc.platform === 'instagram' && acc.isActive);
      const facebookAccount = accounts.find(acc => acc.platform === 'facebook' && acc.isActive);
      
      if (!instagramAccount) {
        console.log('❌ No active Instagram account found');
        throw new Error('No active Instagram account found');
      }

      if (!facebookAccount) {
        console.log('❌ No active Facebook account found (needed for Instagram access)');
        throw new Error('No active Facebook account found');
      }

      // Use Instagram Business Account ID from Instagram account
      let instagramBusinessAccountId = instagramAccount.businessAccountId;
      
      if (!instagramBusinessAccountId && instagramAccount.pageId) {
        console.log('📋 Using Facebook Page ID to find Instagram Business Account:', instagramAccount.pageId);
        // In a real implementation, we would make an API call to get the Instagram Business Account ID
        // For now, we'll use simulated data
        instagramBusinessAccountId = 'simulated_instagram_business_id';
      }
      
      if (!instagramBusinessAccountId) {
        console.log('⚠️ Instagram Business Account ID not configured - using simulated data for testing');
        console.log('📋 Instagram account details:', {
          id: instagramAccount.id,
          accountName: instagramAccount.accountName,
          isActive: instagramAccount.isActive,
          businessAccountId: instagramAccount.businessAccountId,
          pageId: instagramAccount.pageId
        });
        // For testing purposes, we'll continue with simulated data
        instagramBusinessAccountId = 'simulated_instagram_business_id';
      }

      // Fetch posts from Instagram Basic Display API using Facebook account token
      const posts = await this.fetchPostsFromInstagram(facebookAccount, instagramBusinessAccountId);
      
      if (posts.length > 0) {
        console.log(`✅ Found ${posts.length} existing Instagram posts`);
        
        // Save posts to database and collect their IDs
        const savedPostIds: string[] = [];
        for (const post of posts) {
          const postId = await this.savePostToDatabase(post, instagramAccount);
          if (postId) {
            savedPostIds.push(postId);
          }
        }
        
        // Fetch analytics for each post using the saved post IDs and Facebook account token
        await this.fetchPostAnalytics(posts, facebookAccount, savedPostIds);
        
        console.log('✅ Successfully imported existing Instagram posts and analytics');
      } else {
        console.log('ℹ️ No existing posts found on Instagram account');
      }
      
    } catch (error) {
      console.error('❌ Error fetching existing Instagram posts:', error);
      throw error; // Re-throw the error so the IPC handler can catch it
    }
  }

  private async fetchPostsFromInstagram(account: any, businessAccountId: string): Promise<InstagramPost[]> {
    try {
      console.log(`📡 Fetching real posts from Instagram Business Account: ${businessAccountId}`);
      
      // Make real API call to Instagram Basic Display API
      const url = `https://graph.facebook.com/v23.0/${businessAccountId}/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${account.accessToken}`;
      
      const response = await fetch(url);
      const data = await response.json() as any;
      
      if (data.error) {
        console.error(`❌ Instagram API error:`, data.error);
        throw new Error(`Instagram API Error: ${data.error.message || 'Unknown error'}`);
      }
      
      if (data.data && data.data.length > 0) {
        console.log(`✅ Fetched ${data.data.length} real posts from Instagram`);
        return data.data;
      } else {
        console.log(`⚠️ No posts found on Instagram account`);
        return [];
      }
      
    } catch (error) {
      console.error('❌ Error fetching posts from Instagram:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch Instagram posts: ${errorMessage}`);
    }
  }

  private async fetchPostAnalytics(posts: InstagramPost[], account: any, savedPostIds: string[]): Promise<void> {
    try {
      console.log('📊 Fetching analytics for Instagram posts...');
      
      for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const savedPostId = savedPostIds[i];
        
        if (!savedPostId) continue;
        
        // Check if analytics already exist for this post
        const existingMetrics = await this.database.getAnalyticsMetrics(savedPostId, 'instagram');
        if (existingMetrics.length > 0) {
          console.log(`📊 Analytics already exist for Instagram post ${post.id}, skipping...`);
          continue;
        }
        
        // Fetch insights for each post
        const insights = await this.fetchPostInsights(post.id, account);
        
        if (insights) {
          // Save analytics metrics using the saved post ID
          await this.database.saveAnalyticsMetrics({
            postId: savedPostId,
            platform: 'instagram',
            reach: insights.reach || 0,
            impressions: insights.impressions || 0,
            likes: insights.likes || 0,
            comments: insights.comments || 0,
            shares: insights.saves || 0, // Instagram uses "saves" instead of "shares"
            clicks: 0, // Instagram doesn't provide click data for posts
            engagementRate: this.calculateEngagementRate(insights),
            sentimentScore: 0 // Would need sentiment analysis
          });
          console.log(`📊 Saved analytics for Instagram post ${post.id}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Error fetching Instagram post analytics:', error);
    }
  }

  private async fetchPostInsights(postId: string, account: any): Promise<any> {
    try {
      console.log(`📡 Fetching real insights for Instagram post ${postId}...`);
      
      // Make real API call to Instagram Basic Display API
      const url = `https://graph.facebook.com/v23.0/${postId}/insights?metric=impressions,reach,engagement,saved&access_token=${account.accessToken}`;
      
      const response = await fetch(url);
      const data = await response.json() as any;
      
      if (data.error) {
        console.error(`❌ Instagram API error for post ${postId}:`, data.error);
        throw new Error(`Instagram Insights API Error: ${data.error.message || 'Unknown error'}`);
      }
      
      if (data.data && data.data.length > 0) {
        const insights = this.parseInsights(data.data);
        console.log(`✅ Real insights fetched for Instagram post ${postId}:`, insights);
        return insights;
      } else {
        console.log(`⚠️ No insights data for Instagram post ${postId}`);
        return null;
      }
      
    } catch (error) {
      console.error(`❌ Error fetching insights for Instagram post ${postId}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch Instagram insights: ${errorMessage}`);
    }
  }

  private parseInsights(insightsData: any[]): any {
    const insights: any = {
      reach: 0,
      impressions: 0,
      likes: 0,
      comments: 0,
      saves: 0
    };
    
    insightsData.forEach(metric => {
      switch (metric.name) {
        case 'reach':
          insights.reach = parseInt(metric.values[0].value) || 0;
          break;
        case 'impressions':
          insights.impressions = parseInt(metric.values[0].value) || 0;
          break;
        case 'engagement':
          insights.likes = parseInt(metric.values[0].value) || 0;
          break;
        case 'saved':
          insights.saves = parseInt(metric.values[0].value) || 0;
          break;
      }
    });
    
    return insights;
  }

  private async savePostToDatabase(post: InstagramPost, account: any): Promise<string | null> {
    try {
      // Check if post already exists
      const posts = await this.database.getPosts();
      const existingPost = posts.find(p => p.id === post.id);
      
      if (!existingPost) {
        // Save new post with the Instagram post ID
        const postId = await this.database.addPost({
          platform: 'instagram',
          content: post.caption || '',
          mediaFiles: post.media_url ? [post.media_url] : [],
          scheduledTime: '',
          status: 'published',
          engagement: {},
          createdAt: post.timestamp,
          updatedAt: new Date().toISOString()
        }, post.id); // Pass the Instagram post ID as custom ID
        
        console.log(`✅ Saved Instagram post: ${post.id}`);
        return postId;
      }
      
      return post.id; // Return existing post ID
    } catch (error) {
      console.error(`❌ Error saving Instagram post ${post.id}:`, error);
      return null;
    }
  }

  private calculateEngagementRate(insights: any): number {
    const reach = insights.reach || 0;
    const engagement = (insights.likes || 0) + (insights.comments || 0) + (insights.saves || 0);
    
    return reach > 0 ? (engagement / reach) * 100 : 0;
  }

  // Simulated data for testing
  private getSimulatedPosts(): InstagramPost[] {
    return [
      {
        id: 'ig_post_1',
        caption: '🌟 Transform your business with AI-powered marketing! Our platform helps you create engaging content, schedule posts, and track performance all in one place. #MarketingAI #BusinessGrowth #DigitalMarketing',
        media_type: 'IMAGE',
        media_url: 'https://example.com/instagram-image-1.jpg',
        permalink: 'https://instagram.com/p/example1',
        timestamp: '2025-08-26T10:30:00.000Z'
      },
      {
        id: 'ig_post_2',
        caption: '💡 Pro tip: Consistency is the key to Instagram success! Post regularly, use relevant hashtags, and engage with your audience. Our AI tools make it easy to maintain your brand voice across all posts. #InstagramTips #SocialMediaMarketing #BrandVoice',
        media_type: 'IMAGE',
        media_url: 'https://example.com/instagram-image-2.jpg',
        permalink: 'https://instagram.com/p/example2',
        timestamp: '2025-08-25T16:45:00.000Z'
      },
      {
        id: 'ig_post_3',
        caption: '✨ Behind the scenes of our latest product launch! Swipe to see the magic happen. #BehindTheScenes #ProductLaunch #Innovation #StartupLife',
        media_type: 'CAROUSEL_ALBUM',
        media_url: 'https://example.com/instagram-carousel.jpg',
        permalink: 'https://instagram.com/p/example3',
        timestamp: '2025-08-24T14:20:00.000Z'
      },
      {
        id: 'ig_post_4',
        caption: '🎯 Success Story: How we helped @startupname grow from 0 to 10K followers in just 2 months! The secret? Strategic content planning + AI-powered hashtag optimization. #SuccessStory #GrowthHacking #InstagramGrowth',
        media_type: 'IMAGE',
        media_url: 'https://example.com/instagram-image-4.jpg',
        permalink: 'https://instagram.com/p/example4',
        timestamp: '2025-08-23T12:00:00.000Z'
      },
      {
        id: 'ig_post_5',
        caption: '📈 Analytics don\'t lie! Our clients see an average 67% increase in engagement when using our AI-powered content optimization. Want to see these results for your brand? #Analytics #Engagement #Results',
        media_type: 'VIDEO',
        media_url: 'https://example.com/instagram-video-5.mp4',
        permalink: 'https://instagram.com/p/example5',
        timestamp: '2025-08-22T09:15:00.000Z'
      },
      {
        id: 'ig_post_6',
        caption: '🔥 New Feature Alert! Our Instagram automation tool is now live. Schedule posts, track hashtag performance, and grow your audience automatically. #NewFeature #InstagramAutomation #SocialMediaTools',
        media_type: 'IMAGE',
        media_url: 'https://example.com/instagram-image-6.jpg',
        permalink: 'https://instagram.com/p/example6',
        timestamp: '2025-08-21T15:30:00.000Z'
      }
    ];
  }

  private getSimulatedInsights(): any {
    return {
      reach: Math.floor(Math.random() * 800) + 50,
      impressions: Math.floor(Math.random() * 1200) + 100,
      likes: Math.floor(Math.random() * 40) + 3,
      comments: Math.floor(Math.random() * 15) + 1,
      saves: Math.floor(Math.random() * 8) + 1
    };
  }
}
