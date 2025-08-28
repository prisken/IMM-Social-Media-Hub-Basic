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
    organizationId: ''
  });

  const platforms = [
    { value: 'facebook', label: 'Facebook', icon: '📘' },
    { value: 'instagram', label: 'Instagram', icon: '📸' },
    { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { value: 'twitter', label: 'Twitter', icon: '🐦' },
    { value: 'tiktok', label: 'TikTok', icon: '🎵' },
    { value: 'youtube', label: 'YouTube', icon: '📺' }
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
      organizationId: ''
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
      organizationId: account.organizationId || ''
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
                  <option key={platform.value} value={platform.value}>
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
              <li>Go to <a href="https://developers.facebook.com/" target="_blank" rel="noopener">Facebook Developers</a></li>
              <li>Create an app and get your access token</li>
              <li>Find your Page ID in Page Info</li>
            </ol>
          </div>
          
          <div className="help-item">
            <h4>📸 Instagram</h4>
            <ol>
              <li>Connect Instagram to your Facebook Page</li>
              <li>Use the same access token as Facebook</li>
              <li>Find your Business Account ID in Business Manager</li>
            </ol>
          </div>
          
          <div className="help-item">
            <h4>💼 LinkedIn</h4>
            <ol>
              <li>Go to <a href="https://www.linkedin.com/developers/" target="_blank" rel="noopener">LinkedIn Developers</a></li>
              <li>Create an app and get your access token</li>
              <li>Find your Organization ID in your company page</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaAccounts; 