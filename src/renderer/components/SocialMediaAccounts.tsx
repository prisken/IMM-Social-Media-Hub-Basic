import React, { useState, useEffect } from 'react';
import './SocialMediaAccounts.css';

interface SocialMediaAccount {
  id: string;
  platform: string;
  accountName: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  pageId?: string;
  businessAccountId?: string;
  organizationId?: string;
  threadsAccountId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AccountFormData {
  platform: string;
  accountName: string;
  accessToken: string;
  pageId: string;
  businessAccountId: string;
  organizationId: string;
  threadsAccountId: string;
}

const SocialMediaAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<SocialMediaAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SocialMediaAccount | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{[key: string]: boolean}>({});

  const [formData, setFormData] = useState<AccountFormData>({
    platform: 'facebook',
    accountName: '',
    accessToken: '',
    pageId: '',
    businessAccountId: '',
    organizationId: '',
    threadsAccountId: ''
  });

  const platforms = [
    { value: 'facebook', label: 'Facebook', icon: '📘' },
    { value: 'threads', label: 'Threads', icon: '🧵' },
    { value: 'instagram', label: 'Instagram (Coming Soon)', icon: '📸', disabled: true },
    { value: 'linkedin', label: 'LinkedIn (Coming Soon)', icon: '💼', disabled: true },
    { value: 'twitter', label: 'Twitter (Coming Soon)', icon: '🐦', disabled: true },
    { value: 'tiktok', label: 'TikTok (Coming Soon)', icon: '🎵', disabled: true },
    { value: 'youtube', label: 'YouTube (Coming Soon)', icon: '📺', disabled: true }
  ];

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const accountsData = await window.electronAPI.social.getAccounts();
      setAccounts(accountsData);
      
      // Test connections for all accounts
      const statusMap: {[key: string]: boolean} = {};
      for (const account of accountsData) {
        try {
          const result = await window.electronAPI.social.testConnection(account);
          statusMap[account.id] = result.success && result.connected;
        } catch (error) {
          console.error(`Failed to test connection for ${account.platform}:`, error);
          statusMap[account.id] = false;
        }
      }
      setConnectionStatus(statusMap);
    } catch (error) {
      console.error('Failed to load accounts:', error);
      setMessage('Failed to load social media accounts');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      platform: 'facebook',
      accountName: '',
      accessToken: '',
      pageId: '',
      businessAccountId: '',
      organizationId: '',
      threadsAccountId: ''
    });
    setEditingAccount(null);
    setShowAddForm(false);
  };

  const handleSubmit = async () => {
    if (!formData.accountName || !formData.accessToken) {
      setMessage('Please fill in all required fields');
      return;
    }

    try {
      setIsConnecting(true);
      
      if (editingAccount) {
        // Update existing account
        await window.electronAPI.social.updateAccount(editingAccount.id, {
          accountName: formData.accountName,
          accessToken: formData.accessToken,
          pageId: formData.pageId || null,
          businessAccountId: formData.businessAccountId || null,
          organizationId: formData.organizationId || null,
          threadsAccountId: formData.threadsAccountId || null,
          updatedAt: new Date().toISOString()
        });
        setMessage('Account updated successfully!');
      } else {
        // Add new account
        const accountId = await window.electronAPI.social.addAccount({
          platform: formData.platform,
          accountName: formData.accountName,
          accessToken: formData.accessToken,
          pageId: formData.pageId || null,
          businessAccountId: formData.businessAccountId || null,
          organizationId: formData.organizationId || null,
          threadsAccountId: formData.threadsAccountId || null,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        setMessage('Account added successfully!');
      }
      
      resetForm();
      await loadAccounts();
    } catch (error) {
      console.error('Failed to save account:', error);
      setMessage('Failed to save account');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleEdit = (account: SocialMediaAccount) => {
    setEditingAccount(account);
    setFormData({
      platform: account.platform,
      accountName: account.accountName,
      accessToken: account.accessToken,
      pageId: account.pageId || '',
      businessAccountId: account.businessAccountId || '',
      organizationId: account.organizationId || '',
      threadsAccountId: account.threadsAccountId || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (accountId: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await window.electronAPI.social.deleteAccount(accountId);
        setMessage('Account deleted successfully!');
        await loadAccounts();
      } catch (error) {
        console.error('Failed to delete account:', error);
        setMessage('Failed to delete account');
      }
    }
  };

  const handleTestConnection = async (account: SocialMediaAccount) => {
    try {
      const result = await window.electronAPI.social.testConnection(account);
      setConnectionStatus(prev => ({
        ...prev,
        [account.id]: result.success && result.connected
      }));
      setMessage(result.connected ? 'Connection successful!' : 'Connection failed');
    } catch (error) {
      console.error('Failed to test connection:', error);
      setMessage('Failed to test connection');
    }
  };

  const getPlatformIcon = (platform: string) => {
    const platformInfo = platforms.find(p => p.value === platform);
    return platformInfo?.icon || '🔗';
  };

  const getPlatformLabel = (platform: string) => {
    const platformInfo = platforms.find(p => p.value === platform);
    return platformInfo?.label || platform;
  };

  if (loading) {
    return (
      <div className="social-media-accounts">
        <div className="loading">Loading social media accounts...</div>
      </div>
    );
  }

  return (
    <div className="social-media-accounts">
      <div className="accounts-header">
        <h2>Social Media Accounts</h2>
        <button 
          className="add-button"
          onClick={() => setShowAddForm(true)}
        >
          + Add Account
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('Failed') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {/* Account Form */}
      {showAddForm && (
        <div className="account-form">
          <h3>{editingAccount ? 'Edit Account' : 'Add New Account'}</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Platform *</label>
              <select 
                value={formData.platform}
                onChange={(e) => setFormData({...formData, platform: e.target.value})}
                disabled={!!editingAccount} // Can't change platform when editing
              >
                {platforms.map(platform => (
                  <option 
                    key={platform.value} 
                    value={platform.value}
                    disabled={platform.disabled}
                  >
                    {platform.icon} {platform.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Account Name *</label>
              <input 
                type="text"
                value={formData.accountName}
                onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                placeholder="Enter account name"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Access Token *</label>
            <input 
              type="password"
              value={formData.accessToken}
              onChange={(e) => setFormData({...formData, accessToken: e.target.value})}
              placeholder="Enter access token"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Page ID</label>
              <input 
                type="text"
                value={formData.pageId}
                onChange={(e) => setFormData({...formData, pageId: e.target.value})}
                placeholder="Enter page ID (for Facebook/Instagram)"
              />
            </div>
            
            <div className="form-group">
              <label>Business Account ID</label>
              <input 
                type="text"
                value={formData.businessAccountId}
                onChange={(e) => setFormData({...formData, businessAccountId: e.target.value})}
                placeholder="Enter business account ID"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Organization ID</label>
            <input 
              type="text"
              value={formData.organizationId}
              onChange={(e) => setFormData({...formData, organizationId: e.target.value})}
              placeholder="Enter organization ID (for LinkedIn)"
            />
          </div>

          <div className="form-group">
            <label>Threads Account ID</label>
            <input 
              type="text"
              value={formData.threadsAccountId}
              onChange={(e) => setFormData({...formData, threadsAccountId: e.target.value})}
              placeholder="Enter Threads account ID"
            />
          </div>

          <div className="form-actions">
            <button 
              className="save-button"
              onClick={handleSubmit}
              disabled={isConnecting}
            >
              {isConnecting ? 'Saving...' : (editingAccount ? 'Update Account' : 'Add Account')}
            </button>
            <button 
              className="cancel-button"
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Accounts List */}
      <div className="accounts-list">
        {accounts.length === 0 ? (
          <div className="no-accounts">
            <p>No social media accounts configured yet.</p>
            <p>Click "Add Account" to get started.</p>
          </div>
        ) : (
          accounts.map(account => (
            <div key={account.id} className="account-card">
              <div className="account-header">
                <div className="account-info">
                  <span className="platform-icon">{getPlatformIcon(account.platform)}</span>
                  <div className="account-details">
                    <h4>{account.accountName}</h4>
                    <p>{getPlatformLabel(account.platform)}</p>
                  </div>
                </div>
                <div className="account-status">
                  <span className={`status-indicator ${connectionStatus[account.id] ? 'connected' : 'disconnected'}`}>
                    {connectionStatus[account.id] ? '✅ Connected' : '❌ Disconnected'}
                  </span>
                </div>
              </div>
              
              <div className="account-details-expanded">
                {account.pageId && (
                  <p><strong>Page ID:</strong> {account.pageId}</p>
                )}
                {account.businessAccountId && (
                  <p><strong>Business Account ID:</strong> {account.businessAccountId}</p>
                )}
                {account.organizationId && (
                  <p><strong>Organization ID:</strong> {account.organizationId}</p>
                )}
                <p><strong>Status:</strong> {account.isActive ? 'Active' : 'Inactive'}</p>
                <p><strong>Added:</strong> {new Date(account.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="account-actions">
                <button 
                  className="test-button"
                  onClick={() => handleTestConnection(account)}
                >
                  Test Connection
                </button>
                <button 
                  className="edit-button"
                  onClick={() => handleEdit(account)}
                >
                  Edit
                </button>
                <button 
                  className="delete-button"
                  onClick={() => handleDelete(account.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Help Section */}
      <div className="help-section">
        <h3>How to Get Your Credentials</h3>
        <div className="help-content">
          <div className="help-item">
            <h4>📘 Facebook</h4>
            <ol>
              <li><strong>Go to Facebook Developers:</strong> Visit <a href="https://developers.facebook.com/" target="_blank" rel="noopener">developers.facebook.com</a></li>
              <li><strong>Create a New App:</strong> Click "Create App" and select "Business" as the app type</li>
              <li><strong>Add Facebook Login:</strong> In your app dashboard, go to "Add Product" and add "Facebook Login"</li>
              <li><strong>Configure OAuth Settings:</strong> Set your OAuth redirect URI to: <code>https://localhost:3000/auth/facebook/callback</code></li>
              <li><strong>Get Access Token:</strong> Go to "Tools" → "Graph API Explorer" and generate a user access token with these permissions:
                <ul>
                  <li><code>pages_manage_posts</code> - Post to Facebook Pages</li>
                  <li><code>pages_read_engagement</code> - Read page insights</li>
                  <li><code>pages_show_list</code> - Access page information</li>
                </ul>
              </li>
              <li><strong>Find Your Page ID:</strong> Go to your Facebook Page → "About" → "Page Info" → Copy the Page ID</li>
              <li><strong>Get Business Account ID:</strong> In Business Manager → "Business Settings" → "Business Info" → Copy the Business ID</li>
            </ol>
          </div>
          
          <div className="help-item">
            <h4>🧵 Threads</h4>
            <ol>
              <li><strong>Connect Instagram to Facebook:</strong> Ensure your Instagram account is connected to your Facebook Page</li>
              <li><strong>Use Facebook Access Token:</strong> Threads uses the same access token as Facebook (no separate token needed)</li>
              <li><strong>Find Instagram Business Account ID:</strong> In Business Manager → "Accounts" → "Instagram accounts" → Copy the Instagram Business Account ID</li>
              <li><strong>Enable Threads Access:</strong> In your Facebook app settings, ensure you have the following permissions:
                <ul>
                  <li><code>instagram_basic</code> - Access Instagram account</li>
                  <li><code>instagram_content_publish</code> - Post to Instagram/Threads</li>
                  <li><code>pages_manage_posts</code> - Manage Facebook page posts</li>
                </ul>
              </li>
              <li><strong>Verify Threads Account:</strong> Make sure your Instagram account has Threads enabled (download the Threads app and link it to your Instagram)</li>
              <li><strong>Test Connection:</strong> Use the "Test Connection" button above to verify your credentials work</li>
            </ol>
            <div className="note">
              <p><strong>Note:</strong> Threads is currently in beta and requires an Instagram Business account connected to a Facebook Page. The same access token used for Facebook will work for Threads posting.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaAccounts; 