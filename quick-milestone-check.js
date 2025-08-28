const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

console.log('🧪 Quick Milestone Check\n');

const dbPath = path.join(__dirname, 'user_data', 'imm_marketing_hub.db');

if (!fs.existsSync(dbPath)) {
  console.log('❌ Database not found');
  process.exit(1);
}

const db = new Database(dbPath);

// Check all tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('📋 Database tables:', tables.map(t => t.name).join(', '));

// Check data counts
const counts = {
  media: db.prepare('SELECT COUNT(*) as count FROM media_files').get().count,
  posts: db.prepare('SELECT COUNT(*) as count FROM posts').get().count,
  accounts: db.prepare('SELECT COUNT(*) as count FROM social_media_accounts').get().count,
  products: db.prepare('SELECT COUNT(*) as count FROM products').get().count,
  brandVoice: db.prepare('SELECT COUNT(*) as count FROM brand_voice_profiles').get().count,
  analytics: db.prepare('SELECT COUNT(*) as count FROM analytics_metrics').get().count,
  engagement: db.prepare('SELECT COUNT(*) as count FROM engagement_interactions').get().count,
  scheduled: db.prepare('SELECT COUNT(*) as count FROM scheduled_jobs').get().count
};

console.log('\n📊 Data Summary:');
Object.entries(counts).forEach(([key, count]) => {
  console.log(`  ${key}: ${count}`);
});

// Check for mock data
const posts = db.prepare('SELECT content FROM posts LIMIT 3').all();
const hasMockData = posts.some(post => 
  post.content && (
    post.content.includes('sample') || 
    post.content.includes('mock') ||
    post.content.includes('🚀 Exciting news')
  )
);

console.log('\n🔍 Mock Data Check:');
console.log(hasMockData ? '⚠️ Mock/sample data detected' : '✅ No obvious mock data');

db.close();
