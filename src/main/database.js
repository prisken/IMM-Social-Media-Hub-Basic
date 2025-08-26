import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
export class AppDatabase {
    constructor() {
        this.dbPath = path.join(process.cwd(), 'user_data', 'imm_marketing_hub.db');
    }
    async initialize() {
        // Ensure user_data directory exists
        const userDataDir = path.dirname(this.dbPath);
        if (!fs.existsSync(userDataDir)) {
            fs.mkdirSync(userDataDir, { recursive: true });
        }
        this.db = new Database(this.dbPath);
        await this.createTables();
        await this.seedInitialData();
    }
    async createTables() {
        // Settings table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY,
        brand_voice TEXT,
        social_media TEXT,
        posting_schedule TEXT,
        created_at TEXT,
        updated_at TEXT
      )
    `);
        // Media files table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS media_files (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        filepath TEXT NOT NULL,
        filetype TEXT NOT NULL,
        filesize INTEGER NOT NULL,
        dimensions TEXT,
        duration INTEGER,
        upload_date TEXT NOT NULL,
        tags TEXT,
        category TEXT NOT NULL,
        used_count INTEGER DEFAULT 0,
        metadata TEXT
      )
    `);
        // Brand voice profiles table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS brand_voice_profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        tone TEXT NOT NULL,
        style TEXT NOT NULL,
        vocabulary TEXT,
        emoji_usage TEXT,
        call_to_action TEXT,
        examples TEXT,
        created_at TEXT,
        updated_at TEXT
      )
    `);
        // Posts table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        platform TEXT NOT NULL,
        content TEXT NOT NULL,
        media_files TEXT,
        scheduled_time TEXT,
        status TEXT NOT NULL,
        engagement TEXT,
        created_at TEXT,
        updated_at TEXT
      )
    `);

        // Engagement interactions table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS engagement_interactions (
        id TEXT PRIMARY KEY,
        platform TEXT NOT NULL,
        post_id TEXT,
        interaction_type TEXT NOT NULL,
        interaction_id TEXT NOT NULL,
        author_name TEXT NOT NULL,
        author_id TEXT,
        content TEXT NOT NULL,
        sentiment TEXT,
        sentiment_score REAL,
        is_processed BOOLEAN DEFAULT 0,
        processed_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (post_id) REFERENCES posts (id)
      )
    `);

        // Quick replies table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS quick_replies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        platform TEXT,
        is_active BOOLEAN DEFAULT 1,
        usage_count INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

        // Sentiment analysis cache table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS sentiment_cache (
        id TEXT PRIMARY KEY,
        content_hash TEXT UNIQUE NOT NULL,
        sentiment TEXT NOT NULL,
        sentiment_score REAL NOT NULL,
        confidence REAL NOT NULL,
        created_at TEXT NOT NULL
      )
    `);

        // Analytics metrics table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS analytics_metrics (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        platform TEXT NOT NULL,
        reach INTEGER DEFAULT 0,
        impressions INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        engagement_rate REAL DEFAULT 0,
        sentiment_score REAL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (post_id) REFERENCES posts (id)
      )
    `);

        // Analytics trends table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS analytics_trends (
        id TEXT PRIMARY KEY,
        platform TEXT NOT NULL,
        date TEXT NOT NULL,
        total_reach INTEGER DEFAULT 0,
        total_engagement INTEGER DEFAULT 0,
        total_posts INTEGER DEFAULT 0,
        avg_engagement_rate REAL DEFAULT 0,
        top_content_type TEXT,
        created_at TEXT NOT NULL
      )
    `);

        // Brand voice performance table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS brand_voice_performance (
        id TEXT PRIMARY KEY,
        voice_profile_id TEXT NOT NULL,
        tone TEXT NOT NULL,
        style TEXT NOT NULL,
        engagement_rate REAL DEFAULT 0,
        sentiment_score REAL DEFAULT 0,
        post_count INTEGER DEFAULT 0,
        period_start TEXT NOT NULL,
        period_end TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (voice_profile_id) REFERENCES brand_voice_profiles (id)
      )
    `);
    }
    async seedInitialData() {
        const now = new Date().toISOString();
        // Check if settings already exist
        const existingSettings = this.db.prepare('SELECT id FROM settings LIMIT 1').get();
        if (!existingSettings) {
            const defaultSettings = {
                id: 'default',
                brandVoice: {
                    tone: 'professional',
                    style: 'conversational',
                    vocabulary: ['innovative', 'strategic', 'results-driven'],
                    emojiUsage: 'strategic',
                    callToAction: 'soft'
                },
                socialMedia: {
                    facebook: { connected: false, accessToken: null },
                    instagram: { connected: false, accessToken: null },
                    linkedin: { connected: false, accessToken: null }
                },
                postingSchedule: {
                    facebook: { times: ['09:00', '17:00'], days: ['monday', 'wednesday', 'friday'] },
                    instagram: { times: ['10:00', '15:00', '19:00'], days: ['tuesday', 'thursday', 'saturday'] },
                    linkedin: { times: ['08:00', '12:00'], days: ['monday', 'wednesday', 'friday'] }
                },
                createdAt: now,
                updatedAt: now
            };
            this.db.prepare(`
        INSERT INTO settings (id, brand_voice, social_media, posting_schedule, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(defaultSettings.id, JSON.stringify(defaultSettings.brandVoice), JSON.stringify(defaultSettings.socialMedia), JSON.stringify(defaultSettings.postingSchedule), defaultSettings.createdAt, defaultSettings.updatedAt);
        }
    }
    async getSettings() {
        const result = this.db.prepare('SELECT * FROM settings WHERE id = ?').get('default');
        if (!result) {
            throw new Error('Settings not found');
        }
        return {
            id: result.id,
            brandVoice: JSON.parse(result.brand_voice),
            socialMedia: JSON.parse(result.social_media),
            postingSchedule: JSON.parse(result.posting_schedule),
            createdAt: result.created_at,
            updatedAt: result.updated_at
        };
    }
    async updateSettings(settings) {
        const currentSettings = await this.getSettings();
        const updatedSettings = { ...currentSettings, ...settings, updatedAt: new Date().toISOString() };
        this.db.prepare(`
      UPDATE settings 
      SET brand_voice = ?, social_media = ?, posting_schedule = ?, updated_at = ?
      WHERE id = ?
    `).run(JSON.stringify(updatedSettings.brandVoice), JSON.stringify(updatedSettings.socialMedia), JSON.stringify(updatedSettings.postingSchedule), updatedSettings.updatedAt, updatedSettings.id);
    }
    async addMediaFile(file) {
        const id = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.db.prepare(`
      INSERT INTO media_files (
        id, filename, original_name, filepath, filetype, filesize, 
        dimensions, duration, upload_date, tags, category, used_count, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, file.filename, file.originalName, file.filepath, file.filetype, file.filesize, file.dimensions, file.duration, file.uploadDate, JSON.stringify(file.tags), file.category, file.usedCount, JSON.stringify(file.metadata));
        return id;
    }
    async getMediaFiles() {
        const rows = this.db.prepare('SELECT * FROM media_files ORDER BY upload_date DESC').all();
        return rows.map((row) => ({
            id: row.id,
            filename: row.filename,
            originalName: row.original_name,
            filepath: row.filepath,
            filetype: row.filetype,
            filesize: row.filesize,
            dimensions: row.dimensions,
            duration: row.duration,
            uploadDate: row.upload_date,
            tags: JSON.parse(row.tags),
            category: row.category,
            usedCount: row.used_count,
            metadata: JSON.parse(row.metadata)
        }));
    }
    async deleteMediaFile(fileId) {
        this.db.prepare('DELETE FROM media_files WHERE id = ?').run(fileId);
    }

    // Engagement methods
    async addEngagementInteraction(interaction) {
        const id = `engagement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        
        this.db.prepare(`
      INSERT INTO engagement_interactions (
        id, platform, post_id, interaction_type, interaction_id, author_name, 
        author_id, content, sentiment, sentiment_score, is_processed, 
        processed_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
            id, interaction.platform, interaction.postId, interaction.interactionType,
            interaction.interactionId, interaction.authorName, interaction.authorId,
            interaction.content, interaction.sentiment, interaction.sentimentScore,
            interaction.isProcessed || false, interaction.processedAt, now, now
        );
        
        return id;
    }

    async getEngagementInteractions(filters = {}) {
        let query = 'SELECT * FROM engagement_interactions WHERE 1=1';
        const params = [];

        if (filters.platform) {
            query += ' AND platform = ?';
            params.push(filters.platform);
        }

        if (filters.postId) {
            query += ' AND post_id = ?';
            params.push(filters.postId);
        }

        if (filters.interactionType) {
            query += ' AND interaction_type = ?';
            params.push(filters.interactionType);
        }

        if (filters.isProcessed !== undefined) {
            query += ' AND is_processed = ?';
            params.push(filters.isProcessed);
        }

        query += ' ORDER BY created_at DESC';

        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(filters.limit);
        }

        const rows = this.db.prepare(query).all(...params);
        return rows.map(row => ({
            id: row.id,
            platform: row.platform,
            postId: row.post_id,
            interactionType: row.interaction_type,
            interactionId: row.interaction_id,
            authorName: row.author_name,
            authorId: row.author_id,
            content: row.content,
            sentiment: row.sentiment,
            sentimentScore: row.sentiment_score,
            isProcessed: row.is_processed,
            processedAt: row.processed_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    }

    async updateEngagementInteraction(id, updates) {
        const now = new Date().toISOString();
        const fields = [];
        const values = [];

        Object.keys(updates).forEach(key => {
            if (key !== 'id') {
                fields.push(`${key} = ?`);
                values.push(updates[key]);
            }
        });

        fields.push('updated_at = ?');
        values.push(now);
        values.push(id);

        this.db.prepare(`
      UPDATE engagement_interactions 
      SET ${fields.join(', ')}
      WHERE id = ?
    `).run(...values);
    }

    async addQuickReply(quickReply) {
        const id = `quick_reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        
        this.db.prepare(`
      INSERT INTO quick_replies (
        id, name, content, category, platform, is_active, usage_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
            id, quickReply.name, quickReply.content, quickReply.category,
            quickReply.platform, quickReply.isActive !== false, 0, now, now
        );
        
        return id;
    }

    async getQuickReplies(filters = {}) {
        let query = 'SELECT * FROM quick_replies WHERE 1=1';
        const params = [];

        if (filters.category) {
            query += ' AND category = ?';
            params.push(filters.category);
        }

        if (filters.platform) {
            query += ' AND platform = ?';
            params.push(filters.platform);
        }

        if (filters.isActive !== undefined) {
            query += ' AND is_active = ?';
            params.push(filters.isActive);
        }

        query += ' ORDER BY usage_count DESC, name ASC';

        const rows = this.db.prepare(query).all(...params);
        return rows.map(row => ({
            id: row.id,
            name: row.name,
            content: row.content,
            category: row.category,
            platform: row.platform,
            isActive: row.is_active,
            usageCount: row.usage_count,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    }

    async updateQuickReplyUsage(id) {
        this.db.prepare(`
      UPDATE quick_replies 
      SET usage_count = usage_count + 1, updated_at = ?
      WHERE id = ?
    `).run(new Date().toISOString(), id);
    }

    async addSentimentCache(sentimentData) {
        const id = `sentiment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        
        this.db.prepare(`
      INSERT OR REPLACE INTO sentiment_cache (
        id, content_hash, sentiment, sentiment_score, confidence, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(
            id, sentimentData.contentHash, sentimentData.sentiment,
            sentimentData.sentimentScore, sentimentData.confidence, now
        );
        
        return id;
    }

    async getSentimentCache(contentHash) {
        const row = this.db.prepare('SELECT * FROM sentiment_cache WHERE content_hash = ?').get(contentHash);
        if (!row) return null;
        
        return {
            id: row.id,
            contentHash: row.content_hash,
            sentiment: row.sentiment,
            sentimentScore: row.sentiment_score,
            confidence: row.confidence,
            createdAt: row.created_at
        };
    }

    close() {
        if (this.db) {
            this.db.close();
        }
    }

    // Analytics methods
    async getAnalyticsData() {
        // Get all published posts
        const posts = await this.getPosts();
        const publishedPosts = posts.filter(post => post.status === 'published');
        
        // Calculate metrics by platform
        const analytics = {
            facebook: { reach: 0, posts: 0, engagement: 0 },
            instagram: { reach: 0, posts: 0, engagement: 0 },
            linkedin: { reach: 0, posts: 0, engagement: 0 },
            total: { reach: 0, posts: 0, engagement: 0 }
        };

        // Count posts by platform
        publishedPosts.forEach(post => {
            const platform = post.platform.toLowerCase();
            if (analytics[platform]) {
                analytics[platform].posts++;
                
                // Calculate reach and engagement from post data
                if (post.engagement) {
                    const engagement = post.engagement;
                    const reach = engagement.reach || engagement.impressions || 0;
                    const engagementRate = engagement.likes || engagement.comments || engagement.shares || 0;
                    
                    analytics[platform].reach += reach;
                    analytics[platform].engagement += engagementRate;
                }
            }
        });

        // Calculate totals
        analytics.total.reach = analytics.facebook.reach + analytics.instagram.reach + analytics.linkedin.reach;
        analytics.total.posts = analytics.facebook.posts + analytics.instagram.posts + analytics.linkedin.posts;
        analytics.total.engagement = analytics.facebook.engagement + analytics.instagram.engagement + analytics.linkedin.engagement;

        return analytics;
    }

    async saveAnalyticsMetrics(metrics) {
        const id = `metrics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        
        this.db.prepare(`
            INSERT INTO analytics_metrics (
                id, post_id, platform, reach, impressions, likes, comments, shares, 
                clicks, engagement_rate, sentiment_score, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            id, metrics.postId, metrics.platform, metrics.reach, metrics.impressions,
            metrics.likes, metrics.comments, metrics.shares, metrics.clicks,
            metrics.engagementRate, metrics.sentimentScore, now, now
        );
        
        return id;
    }

    async getAnalyticsMetrics(postId = null, platform = null, startDate = null, endDate = null) {
        let query = 'SELECT * FROM analytics_metrics WHERE 1=1';
        const params = [];
        
        if (postId) {
            query += ' AND post_id = ?';
            params.push(postId);
        }
        
        if (platform) {
            query += ' AND platform = ?';
            params.push(platform);
        }
        
        if (startDate) {
            query += ' AND created_at >= ?';
            params.push(startDate);
        }
        
        if (endDate) {
            query += ' AND created_at <= ?';
            params.push(endDate);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const rows = this.db.prepare(query).all(...params);
        return rows.map(row => ({
            id: row.id,
            postId: row.post_id,
            platform: row.platform,
            reach: row.reach,
            impressions: row.impressions,
            likes: row.likes,
            comments: row.comments,
            shares: row.shares,
            clicks: row.clicks,
            engagementRate: row.engagement_rate,
            sentimentScore: row.sentiment_score,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    }

    async getAnalyticsTrends(platform = null, days = 30) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        let query = 'SELECT * FROM analytics_trends WHERE date >= ? AND date <= ?';
        const params = [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]];
        
        if (platform) {
            query += ' AND platform = ?';
            params.push(platform);
        }
        
        query += ' ORDER BY date ASC';
        
        const rows = this.db.prepare(query).all(...params);
        return rows.map(row => ({
            id: row.id,
            platform: row.platform,
            date: row.date,
            totalReach: row.total_reach,
            totalEngagement: row.total_engagement,
            totalPosts: row.total_posts,
            avgEngagementRate: row.avg_engagement_rate,
            topContentType: row.top_content_type,
            createdAt: row.created_at
        }));
    }

    async saveAnalyticsTrend(trend) {
        const id = `trend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        
        this.db.prepare(`
            INSERT INTO analytics_trends (
                id, platform, date, total_reach, total_engagement, total_posts,
                avg_engagement_rate, top_content_type, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            id, trend.platform, trend.date, trend.totalReach, trend.totalEngagement,
            trend.totalPosts, trend.avgEngagementRate, trend.topContentType, now
        );
        
        return id;
    }

    async getBrandVoicePerformance(voiceProfileId = null, startDate = null, endDate = null) {
        let query = 'SELECT * FROM brand_voice_performance WHERE 1=1';
        const params = [];
        
        if (voiceProfileId) {
            query += ' AND voice_profile_id = ?';
            params.push(voiceProfileId);
        }
        
        if (startDate) {
            query += ' AND period_start >= ?';
            params.push(startDate);
        }
        
        if (endDate) {
            query += ' AND period_end <= ?';
            params.push(endDate);
        }
        
        query += ' ORDER BY period_start DESC';
        
        const rows = this.db.prepare(query).all(...params);
        return rows.map(row => ({
            id: row.id,
            voiceProfileId: row.voice_profile_id,
            tone: row.tone,
            style: row.style,
            engagementRate: row.engagement_rate,
            sentimentScore: row.sentiment_score,
            postCount: row.post_count,
            periodStart: row.period_start,
            periodEnd: row.period_end,
            createdAt: row.created_at
        }));
    }

    async saveBrandVoicePerformance(performance) {
        const id = `voice_perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        
        this.db.prepare(`
            INSERT INTO brand_voice_performance (
                id, voice_profile_id, tone, style, engagement_rate, sentiment_score,
                post_count, period_start, period_end, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            id, performance.voiceProfileId, performance.tone, performance.style,
            performance.engagementRate, performance.sentimentScore, performance.postCount,
            performance.periodStart, performance.periodEnd, now
        );
        
        return id;
    }

    async getTopPosts(platform = null, limit = 10, days = 30) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        let query = `
            SELECT p.*, am.reach, am.impressions, am.likes, am.comments, am.shares, am.engagement_rate
            FROM posts p
            LEFT JOIN analytics_metrics am ON p.id = am.post_id
            WHERE p.status = 'published' 
            AND p.created_at >= ? 
            AND p.created_at <= ?
        `;
        const params = [startDate.toISOString(), endDate.toISOString()];
        
        if (platform) {
            query += ' AND p.platform = ?';
            params.push(platform);
        }
        
        query += ' ORDER BY am.engagement_rate DESC, am.reach DESC LIMIT ?';
        params.push(limit);
        
        const rows = this.db.prepare(query).all(...params);
        return rows.map(row => ({
            id: row.id,
            platform: row.platform,
            content: row.content,
            mediaFiles: row.media_files ? JSON.parse(row.media_files) : [],
            scheduledTime: row.scheduled_time,
            status: row.status,
            engagement: row.engagement ? JSON.parse(row.engagement) : {},
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            analytics: {
                reach: row.reach || 0,
                impressions: row.impressions || 0,
                likes: row.likes || 0,
                comments: row.comments || 0,
                shares: row.shares || 0,
                engagementRate: row.engagement_rate || 0
            }
        }));
    }

    async getPosts() {
        const rows = this.db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all();
        return rows.map(row => ({
            id: row.id,
            platform: row.platform,
            content: row.content,
            mediaFiles: row.media_files ? JSON.parse(row.media_files) : [],
            scheduledTime: row.scheduled_time,
            status: row.status,
            engagement: row.engagement ? JSON.parse(row.engagement) : {},
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    }

    async getSocialMediaAccounts() {
        const settings = await this.getSettings();
        const accounts = [];
        
        Object.entries(settings.socialMedia).forEach(([platform, config]) => {
            accounts.push({
                platform,
                isActive: config.connected,
                accountName: config.accountName || null,
                accessToken: config.accessToken
            });
        });
        
        return accounts;
    }

    async getPendingActions() {
        const actions = [];
        
        // Check for posts that need responses (comments)
        const posts = await this.getPosts();
        const postsWithComments = posts.filter(post => 
            post.engagement && post.engagement.comments && post.engagement.comments > 0
        );
        
        if (postsWithComments.length > 0) {
            actions.push(`${postsWithComments.length} posts have comments that need responses`);
        }
        
        // Check for pending posts
        const pendingPosts = posts.filter(post => post.status === 'scheduled');
        if (pendingPosts.length > 0) {
            actions.push(`${pendingPosts.length} posts are scheduled and pending`);
        }
        
        // Check for failed posts
        const failedPosts = posts.filter(post => post.status === 'failed');
        if (failedPosts.length > 0) {
            actions.push(`${failedPosts.length} posts failed and need attention`);
        }
        
        return actions;
    }

    async getTodaysSchedule() {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        
        const posts = await this.getPosts();
        const todaysPosts = posts.filter(post => {
            if (post.scheduledTime) {
                const scheduledDate = new Date(post.scheduledTime);
                return scheduledDate >= startOfDay && scheduledDate < endOfDay;
            }
            return false;
        });
        
        return todaysPosts.map(post => ({
            time: post.scheduledTime,
            platform: post.platform,
            content: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
            status: post.status
        }));
    }

    async getBrandVoiceProfiles() {
        const rows = this.db.prepare('SELECT * FROM brand_voice_profiles ORDER BY created_at DESC').all();
        return rows.map(row => ({
            id: row.id,
            name: row.name,
            tone: row.tone,
            style: row.style,
            vocabulary: row.vocabulary ? JSON.parse(row.vocabulary) : [],
            emojiUsage: row.emoji_usage,
            callToAction: row.call_to_action,
            examples: row.examples ? JSON.parse(row.examples) : [],
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    }
}
