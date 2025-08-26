// This script adds sample analytics data to demonstrate the analytics dashboard
// Run this in the Electron app context

console.log('📊 Adding sample analytics data...');

// Sample posts with engagement data
const samplePosts = [
  {
    id: 'post_1',
    platform: 'facebook',
    content: '🚀 Excited to share our latest marketing insights! Check out these 5 proven strategies that helped us increase engagement by 300% this quarter. #MarketingTips #GrowthHacking',
    status: 'published',
    engagement: {
      reach: 2500,
      impressions: 3200,
      likes: 145,
      comments: 23,
      shares: 12,
      clicks: 89
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
  },
  {
    id: 'post_2',
    platform: 'instagram',
    content: 'Behind the scenes at IMM Marketing! 📸 Our team working on the latest campaign. Success is built on collaboration and creativity. #TeamWork #MarketingLife',
    status: 'published',
    engagement: {
      reach: 1800,
      impressions: 2200,
      likes: 234,
      comments: 18,
      shares: 8,
      clicks: 45
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
  },
  {
    id: 'post_3',
    platform: 'linkedin',
    content: 'Professional development tip: The best marketers never stop learning. Here are 3 essential skills that will set you apart in 2024. What skills are you focusing on? #ProfessionalDevelopment #Marketing',
    status: 'published',
    engagement: {
      reach: 1200,
      impressions: 1500,
      likes: 67,
      comments: 15,
      shares: 28,
      clicks: 34
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  },
  {
    id: 'post_4',
    platform: 'facebook',
    content: '🎯 Case Study: How we helped a local business increase their social media reach by 500% in just 30 days. The key? Consistent, authentic content that resonates with their audience.',
    status: 'published',
    engagement: {
      reach: 3100,
      impressions: 3800,
      likes: 189,
      comments: 31,
      shares: 19,
      clicks: 156
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  },
  {
    id: 'post_5',
    platform: 'instagram',
    content: '✨ Client success story! From 0 to 10K followers in 6 months. Consistency + Strategy = Results. Swipe to see the transformation! #SuccessStory #SocialMediaGrowth',
    status: 'published',
    engagement: {
      reach: 2200,
      impressions: 2600,
      likes: 312,
      comments: 42,
      shares: 15,
      clicks: 78
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  }
];

// Sample analytics metrics
const sampleMetrics = [
  {
    postId: 'post_1',
    platform: 'facebook',
    reach: 2500,
    impressions: 3200,
    likes: 145,
    comments: 23,
    shares: 12,
    clicks: 89,
    engagementRate: 0.072,
    sentimentScore: 0.85
  },
  {
    postId: 'post_2',
    platform: 'instagram',
    reach: 1800,
    impressions: 2200,
    likes: 234,
    comments: 18,
    shares: 8,
    clicks: 45,
    engagementRate: 0.144,
    sentimentScore: 0.92
  },
  {
    postId: 'post_3',
    platform: 'linkedin',
    reach: 1200,
    impressions: 1500,
    likes: 67,
    comments: 15,
    shares: 28,
    clicks: 34,
    engagementRate: 0.092,
    sentimentScore: 0.78
  },
  {
    postId: 'post_4',
    platform: 'facebook',
    reach: 3100,
    impressions: 3800,
    likes: 189,
    comments: 31,
    shares: 19,
    clicks: 156,
    engagementRate: 0.077,
    sentimentScore: 0.88
  },
  {
    postId: 'post_5',
    platform: 'instagram',
    reach: 2200,
    impressions: 2600,
    likes: 312,
    comments: 42,
    shares: 15,
    clicks: 78,
    engagementRate: 0.168,
    sentimentScore: 0.95
  }
];

// Sample trends data
const sampleTrends = [
  {
    platform: 'facebook',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalReach: 2500,
    totalEngagement: 180,
    totalPosts: 1,
    avgEngagementRate: 0.072,
    topContentType: 'Marketing Tips'
  },
  {
    platform: 'instagram',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalReach: 1800,
    totalEngagement: 260,
    totalPosts: 1,
    avgEngagementRate: 0.144,
    topContentType: 'Behind the Scenes'
  },
  {
    platform: 'linkedin',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalReach: 1200,
    totalEngagement: 110,
    totalPosts: 1,
    avgEngagementRate: 0.092,
    topContentType: 'Professional Development'
  },
  {
    platform: 'facebook',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalReach: 3100,
    totalEngagement: 239,
    totalPosts: 1,
    avgEngagementRate: 0.077,
    topContentType: 'Case Study'
  },
  {
    platform: 'instagram',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalReach: 2200,
    totalEngagement: 369,
    totalPosts: 1,
    avgEngagementRate: 0.168,
    topContentType: 'Success Story'
  }
];

// Sample brand voice performance
const sampleBrandVoicePerformance = [
  {
    voiceProfileId: 'voice_1',
    tone: 'professional',
    style: 'conversational',
    engagementRate: 0.085,
    sentimentScore: 0.82,
    postCount: 3,
    periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    periodEnd: new Date().toISOString()
  },
  {
    voiceProfileId: 'voice_2',
    tone: 'friendly',
    style: 'engaging',
    engagementRate: 0.156,
    sentimentScore: 0.94,
    postCount: 2,
    periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    periodEnd: new Date().toISOString()
  }
];

console.log('✅ Sample data prepared');
console.log('📝 Posts:', samplePosts.length);
console.log('📊 Metrics:', sampleMetrics.length);
console.log('📈 Trends:', sampleTrends.length);
console.log('🎯 Brand Voice Performance:', sampleBrandVoicePerformance.length);

// Export for use in the app
window.sampleAnalyticsData = {
  posts: samplePosts,
  metrics: sampleMetrics,
  trends: sampleTrends,
  brandVoicePerformance: sampleBrandVoicePerformance
};

