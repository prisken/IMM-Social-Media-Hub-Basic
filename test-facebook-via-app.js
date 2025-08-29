const { ipcRenderer } = require('electron');

// This script needs to be run in the renderer process
console.log('🔍 Checking Facebook connection via app...');

// Try to get social media accounts
ipcRenderer.invoke('get-social-media-accounts')
  .then(accounts => {
    const facebookAccounts = accounts.filter(acc => acc.platform === 'facebook');
    console.log('📱 Facebook Accounts:', facebookAccounts);
  })
  .catch(error => {
    console.error('❌ Error getting accounts:', error);
  });

// Try to get posts
ipcRenderer.invoke('get-posts')
  .then(posts => {
    const facebookPosts = posts.filter(post => post.platform === 'facebook');
    console.log('📝 Facebook Posts:', facebookPosts.length);
  })
  .catch(error => {
    console.error('❌ Error getting posts:', error);
  });
