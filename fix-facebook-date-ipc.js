// This script should be run in the Electron renderer process
// You can run this in the browser console when the app is open

console.log('🔧 Fixing Facebook account date via IPC...');

// Update the Facebook account's added date
window.electronAPI.updateSocialMediaAccount({
  platform: 'facebook',
  pageId: '100088250407706',
  addedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week ago
}).then(result => {
  console.log('✅ Facebook account date updated:', result);
  
  // Refresh the page to show the updated date
  window.location.reload();
}).catch(error => {
  console.error('❌ Error updating Facebook date:', error);
});
