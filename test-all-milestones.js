#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

console.log('🧪 Comprehensive Milestone Testing - IMM Marketing Hub\n');

// Database path
const dbPath = path.join(__dirname, 'user_data', 'imm_marketing_hub.db');

// Test results
const results = {
  milestone0: { name: 'Project Bootstrap', status: '❌', details: [] },
  milestone1: { name: 'Local File & Media Library', status: '❌', details: [] },
  milestone2: { name: 'Brand Voice Core', status: '❌', details: [] },
  milestone3: { name: 'Content Studio', status: '❌', details: [] },
  milestone4: { name: 'Calendar & Scheduling', status: '❌', details: [] },
  milestone5: { name: 'Social Posting Connectors', status: '❌', details: [] },
  milestone6: { name: 'Engagement Hub', status: '❌', details: [] },
  milestone7: { name: 'Analytics', status: '❌', details: [] },
  milestone8: { name: 'Product Library & AI Image', status: '❌', details: [] }
};

async function testMilestone0() {
  console.log('📋 Testing Milestone 0: Project Bootstrap...');
  
  try {
    // Check if database exists
    if (!fs.existsSync(dbPath)) {
      results.milestone0.details.push('Database file not found');
      return;
    }
    
    const db = new Database(dbPath);
    
    // Check if all required tables exist
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    const requiredTables = [
      'media_files', 'brand_voice_profiles', 'posts', 'scheduled_jobs',
      'social_media_accounts', 'engagement_interactions', 'analytics_metrics',
      'products', 'product_images', 'product_templates'
    ];
    
    const missingTables = requiredTables.filter(table => 
      !tables.some(t => t.name === table)
    );
    
    if (missingTables.length > 0) {
      results.milestone0.details.push(`Missing tables: ${missingTables.join(', ')}`);
    } else {
      results.milestone0.status = '✅';
      results.milestone0.details.push('All required tables exist');
    }
    
    // Check if app directories exist
    const appDirs = ['app/database', 'app/media', 'app/cache'];
    const missingDirs = appDirs.filter(dir => !fs.existsSync(path.join(__dirname, dir)));
    
    if (missingDirs.length > 0) {
      results.milestone0.details.push(`Missing directories: ${missingDirs.join(', ')}`);
    } else {
      results.milestone0.details.push('All required directories exist');
    }
    
    db.close();
  } catch (error) {
    results.milestone0.details.push(`Error: ${error.message}`);
  }
}

async function testMilestone1() {
  console.log('📁 Testing Milestone 1: Local File & Media Library...');
  
  try {
    const db = new Database(dbPath);
    
    // Check media_files table structure
    const mediaTable = db.prepare("PRAGMA table_info(media_files)").all();
    const requiredColumns = ['id', 'filename', 'filepath', 'filetype', 'filesize', 'uploadDate'];
    const missingColumns = requiredColumns.filter(col => 
      !mediaTable.some(c => c.name === col)
    );
    
    if (missingColumns.length > 0) {
      results.milestone1.details.push(`Missing columns: ${missingColumns.join(', ')}`);
    } else {
      results.milestone1.details.push('Media table structure is correct');
    }
    
    // Check if media directory exists and is writable
    const mediaDir = path.join(__dirname, 'app', 'media');
    if (!fs.existsSync(mediaDir)) {
      results.milestone1.details.push('Media directory does not exist');
    } else {
      try {
        fs.accessSync(mediaDir, fs.constants.W_OK);
        results.milestone1.details.push('Media directory is writable');
      } catch (error) {
        results.milestone1.details.push('Media directory is not writable');
      }
    }
    
    // Check for actual media files (not mock data)
    const mediaCount = db.prepare("SELECT COUNT(*) as count FROM media_files").get();
    if (mediaCount.count === 0) {
      results.milestone1.details.push('No media files found (empty library)');
    } else {
      results.milestone1.details.push(`${mediaCount.count} media files found`);
      results.milestone1.status = '✅';
    }
    
    db.close();
  } catch (error) {
    results.milestone1.details.push(`Error: ${error.message}`);
  }
}

async function testMilestone2() {
  console.log('🎭 Testing Milestone 2: Brand Voice Core...');
  
  try {
    const db = new Database(dbPath);
    
    // Check brand_voice_profiles table
    const profilesCount = db.prepare("SELECT COUNT(*) as count FROM brand_voice_profiles").get();
    
    if (profilesCount.count === 0) {
      results.milestone2.details.push('No brand voice profiles found');
    } else {
      results.milestone2.details.push(`${profilesCount.count} brand voice profiles found`);
      results.milestone2.status = '✅';
    }
    
    // Check if Ollama is available (this would need to be tested in the app)
    results.milestone2.details.push('Ollama integration needs to be tested in app');
    
    db.close();
  } catch (error) {
    results.milestone2.details.push(`Error: ${error.message}`);
  }
}

async function testMilestone3() {
  console.log('✍️ Testing Milestone 3: Content Studio...');
  
  try {
    const db = new Database(dbPath);
    
    // Check posts table
    const postsCount = db.prepare("SELECT COUNT(*) as count FROM posts").get();
    const posts = db.prepare("SELECT * FROM posts LIMIT 3").all();
    
    if (postsCount.count === 0) {
      results.milestone3.details.push('No posts found');
    } else {
      results.milestone3.details.push(`${postsCount.count} posts found`);
      
      // Check if posts have real content or are mock data
      const hasRealContent = posts.some(post => 
        post.content && 
        post.content.length > 20 && 
        !post.content.includes('sample') &&
        !post.content.includes('mock')
      );
      
      if (hasRealContent) {
        results.milestone3.status = '✅';
        results.milestone3.details.push('Posts contain real content');
      } else {
        results.milestone3.details.push('Posts appear to be mock/sample data');
      }
    }
    
    db.close();
  } catch (error) {
    results.milestone3.details.push(`Error: ${error.message}`);
  }
}

async function testMilestone4() {
  console.log('📅 Testing Milestone 4: Calendar & Scheduling...');
  
  try {
    const db = new Database(dbPath);
    
    // Check scheduled_jobs table
    const scheduledCount = db.prepare("SELECT COUNT(*) as count FROM scheduled_jobs").get();
    
    if (scheduledCount.count === 0) {
      results.milestone4.details.push('No scheduled jobs found');
    } else {
      results.milestone4.details.push(`${scheduledCount.count} scheduled jobs found`);
      results.milestone4.status = '✅';
    }
    
    // Check if scheduling functionality exists
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='scheduled_jobs'").get();
    if (tableExists) {
      results.milestone4.details.push('Scheduling table exists');
    } else {
      results.milestone4.details.push('Scheduling table missing');
    }
    
    db.close();
  } catch (error) {
    results.milestone4.details.push(`Error: ${error.message}`);
  }
}

async function testMilestone5() {
  console.log('🔗 Testing Milestone 5: Social Posting Connectors...');
  
  try {
    const db = new Database(dbPath);
    
    // Check social_media_accounts table
    const accountsCount = db.prepare("SELECT COUNT(*) as count FROM social_media_accounts").get();
    const accounts = db.prepare("SELECT * FROM social_media_accounts").all();
    
    if (accountsCount.count === 0) {
      results.milestone5.details.push('No social media accounts found');
    } else {
      results.milestone5.details.push(`${accountsCount.count} social media accounts found`);
      
      // Check if accounts have real tokens or are mock data
      const hasRealTokens = accounts.some(account => 
        account.accessToken && 
        account.accessToken.length > 50 && 
        !account.accessToken.includes('sample') &&
        !account.accessToken.includes('mock')
      );
      
      if (hasRealTokens) {
        results.milestone5.status = '✅';
        results.milestone5.details.push('Real social media tokens found');
      } else {
        results.milestone5.details.push('Social media accounts appear to have mock tokens');
      }
    }
    
    // Check posting_logs table
    const logsCount = db.prepare("SELECT COUNT(*) as count FROM posting_logs").get();
    if (logsCount.count > 0) {
      results.milestone5.details.push(`${logsCount.count} posting logs found`);
    }
    
    db.close();
  } catch (error) {
    results.milestone5.details.push(`Error: ${error.message}`);
  }
}

async function testMilestone6() {
  console.log('💬 Testing Milestone 6: Engagement Hub...');
  
  try {
    const db = new Database(dbPath);
    
    // Check engagement_interactions table
    const interactionsCount = db.prepare("SELECT COUNT(*) as count FROM engagement_interactions").get();
    
    if (interactionsCount.count === 0) {
      results.milestone6.details.push('No engagement interactions found');
    } else {
      results.milestone6.details.push(`${interactionsCount.count} engagement interactions found`);
      results.milestone6.status = '✅';
    }
    
    // Check quick_replies table
    const repliesCount = db.prepare("SELECT COUNT(*) as count FROM quick_replies").get();
    if (repliesCount.count > 0) {
      results.milestone6.details.push(`${repliesCount.count} quick replies found`);
    }
    
    db.close();
  } catch (error) {
    results.milestone6.details.push(`Error: ${error.message}`);
  }
}

async function testMilestone7() {
  console.log('📊 Testing Milestone 7: Analytics...');
  
  try {
    const db = new Database(dbPath);
    
    // Check analytics_metrics table
    const metricsCount = db.prepare("SELECT COUNT(*) as count FROM analytics_metrics").get();
    
    if (metricsCount.count === 0) {
      results.milestone7.details.push('No analytics metrics found');
    } else {
      results.milestone7.details.push(`${metricsCount.count} analytics metrics found`);
      results.milestone7.status = '✅';
    }
    
    // Check analytics_trends table
    const trendsCount = db.prepare("SELECT COUNT(*) as count FROM analytics_trends").get();
    if (trendsCount.count > 0) {
      results.milestone7.details.push(`${trendsCount.count} analytics trends found`);
    }
    
    // Check brand_voice_performance table
    const performanceCount = db.prepare("SELECT COUNT(*) as count FROM brand_voice_performance").get();
    if (performanceCount.count > 0) {
      results.milestone7.details.push(`${performanceCount.count} brand voice performance records found`);
    }
    
    db.close();
  } catch (error) {
    results.milestone7.details.push(`Error: ${error.message}`);
  }
}

async function testMilestone8() {
  console.log('🛍️ Testing Milestone 8: Product Library & AI Image...');
  
  try {
    const db = new Database(dbPath);
    
    // Check products table
    const productsCount = db.prepare("SELECT COUNT(*) as count FROM products").get();
    
    if (productsCount.count === 0) {
      results.milestone8.details.push('No products found');
    } else {
      results.milestone8.details.push(`${productsCount.count} products found`);
      results.milestone8.status = '✅';
    }
    
    // Check product_images table
    const imagesCount = db.prepare("SELECT COUNT(*) as count FROM product_images").get();
    if (imagesCount.count > 0) {
      results.milestone8.details.push(`${imagesCount.count} product images found`);
    }
    
    // Check product_templates table
    const templatesCount = db.prepare("SELECT COUNT(*) as count FROM product_templates").get();
    if (templatesCount.count > 0) {
      results.milestone8.details.push(`${templatesCount.count} product templates found`);
    }
    
    db.close();
  } catch (error) {
    results.milestone8.details.push(`Error: ${error.message}`);
  }
}

async function runAllTests() {
  await testMilestone0();
  await testMilestone1();
  await testMilestone2();
  await testMilestone3();
  await testMilestone4();
  await testMilestone5();
  await testMilestone6();
  await testMilestone7();
  await testMilestone8();
  
  // Print results
  console.log('\n📋 MILESTONE TEST RESULTS:\n');
  
  Object.entries(results).forEach(([key, result]) => {
    console.log(`${result.status} ${result.name}`);
    result.details.forEach(detail => {
      console.log(`   • ${detail}`);
    });
    console.log('');
  });
  
  // Summary
  const passed = Object.values(results).filter(r => r.status === '✅').length;
  const total = Object.keys(results).length;
  
  console.log(`\n📊 SUMMARY: ${passed}/${total} milestones passed`);
  
  if (passed === total) {
    console.log('🎉 All milestones are working correctly!');
  } else {
    console.log('⚠️ Some milestones need attention. Check the details above.');
  }
}

// Run the tests
runAllTests().catch(console.error);
