#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

console.log('🧪 Testing Database Connection\n');

const dbPath = path.join(__dirname, 'user_data', 'imm_marketing_hub.db');

try {
  console.log('📁 Database path:', dbPath);
  console.log('🔧 Attempting to connect...');
  
  const db = new Database(dbPath);
  console.log('✅ Database connected successfully!');
  
  // Test a simple query
  const result = db.prepare('SELECT COUNT(*) as count FROM analytics_metrics').get();
  console.log('📊 Analytics records:', result.count);
  
  db.close();
  console.log('✅ Database test completed successfully!');
  
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
  console.error('Full error:', error);
  process.exit(1);
}
