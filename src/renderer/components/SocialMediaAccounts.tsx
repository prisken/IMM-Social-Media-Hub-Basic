import React, { useState, useEffect } from 'react';
import './SocialMediaAccounts.css';

interface SocialMediaAccount {
  id: string;
  platform: 'facebook' | 'instagram' | 'linkedin';
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
  platform: 'facebook' | 'instagram' | 'linkedin';
  accountName: string;
  accessToken: string;
  pageId?: string;
  businessAccountId?: string;
  organizationId?: string;
}

const SocialMediaAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<SocialMediaAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SocialMediaAccount | null>(null);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [formData, setFormData] = useState<AccountFormData>({
    platform: 'facebook',
    accountName: '',
    accessToken: '',
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const accountsData = await window.electronAPI.social.getAccounts();
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      platform: 'facebook',
      accountName: '',
      accessToken: '',
    });
    setEditingAccount(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const accountData = {
        ...formData,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingAccount) {
        await window.electronAPI.social.updateAccount(editingAccount.id, accountData);
      } else {
        await window.electronAPI.social.addAccount(accountData);
      }

      await loadAccounts();
      resetForm();
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  const handleEdit = (account: SocialMediaAccount) => {
    setEditingAccount(account);
    setFormData({
      platform: account.platform,
      accountName: account.accountName,
      accessToken: account.accessToken,
      pageId: account.pageId,
      businessAccountId: account.businessAccountId,
      organizationId: account.organizationId,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (accountId: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await window.electronAPI.social.deleteAccount(accountId);
        await loadAccounts();
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  const handleTestConnection = async (account: SocialMediaAccount) => {
    setTestingConnection(account.id);
    try {
      const result = await window.electronAPI.social.testConnection(account);
      if (result.success && result.connected) {
        alert('Connection successful!');
      } else {
        alert(`Connection failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Error testing connection');
    } finally {
      setTestingConnection(null);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return '📘';
      case 'instagram':
        return '📷';
      case 'linkedin':
        return '💼';
      default:
        return '🌐';
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return 'Facebook';
      case 'instagram':
        return 'Instagram';
      case 'linkedin':
        return 'LinkedIn';
      default:
        return platform;
    }
  };

  if (loading) {
    return <div className="social-accounts-loading">Loading accounts...</div>;
  }

  return (
    <div className="social-media-accounts">
      <div className="social-accounts-header">
        <h2>Social Media Accounts</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          Add Account
        </button>
      </div>

      {showAddForm && (
        <div className="account-form-overlay">
          <div className="account-form">
            <h3>{editingAccount ? 'Edit Account' : 'Add New Account'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="platform">Platform</label>
                <select
                  id="platform"
                  name="platform"
                  value={formData.platform}
                  onChange={handleInputChange}
                  required
                >
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="accountName">Account Name</label>
                <input
                  type="text"
                  id="accountName"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleInputChange}
                  placeholder="Enter account name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="accessToken">Access Token</label>
                <input
                  type="password"
                  id="accessToken"
                  name="accessToken"
                  value={formData.accessToken}
                  onChange={handleInputChange}
                  placeholder="Enter access token"
                  required
                />
              </div>

              {formData.platform === 'facebook' && (
                <div className="form-group">
                  <label htmlFor="pageId">Page ID (Optional)</label>
                  <input
                    type="text"
                    id="pageId"
                    name="pageId"
                    value={formData.pageId || ''}
                    onChange={handleInputChange}
                    placeholder="Enter Facebook page ID"
                  />
                </div>
              )}

              {formData.platform === 'instagram' && (
                <div className="form-group">
                  <label htmlFor="businessAccountId">Business Account ID</label>
                  <input
                    type="text"
                    id="businessAccountId"
                    name="businessAccountId"
                    value={formData.businessAccountId || ''}
                    onChange={handleInputChange}
                    placeholder="Enter Instagram business account ID"
                  />
                </div>
              )}

              {formData.platform === 'linkedin' && (
                <div className="form-group">
                  <label htmlFor="organizationId">Organization ID (Optional)</label>
                  <input
                    type="text"
                    id="organizationId"
                    name="organizationId"
                    value={formData.organizationId || ''}
                    onChange={handleInputChange}
                    placeholder="Enter LinkedIn organization ID"
                  />
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingAccount ? 'Update Account' : 'Add Account'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="accounts-list">
        {accounts.length === 0 ? (
          <div className="no-accounts">
            <p>No social media accounts configured yet.</p>
            <p>Add your first account to start posting to social media platforms.</p>
          </div>
        ) : (
          accounts.map(account => (
            <div key={account.id} className="account-card">
              <div className="account-header">
                <div className="account-info">
                  <span className="platform-icon">{getPlatformIcon(account.platform)}</span>
                  <div className="account-details">
                    <h4>{account.accountName}</h4>
                    <p className="platform-name">{getPlatformName(account.platform)}</p>
                  </div>
                </div>
                <div className="account-status">
                  <span className={`status-indicator ${account.isActive ? 'active' : 'inactive'}`}>
                    {account.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="account-actions">
                <button
                  className="btn btn-small btn-secondary"
                  onClick={() => handleTestConnection(account)}
                  disabled={testingConnection === account.id}
                >
                  {testingConnection === account.id ? 'Testing...' : 'Test Connection'}
                </button>
                <button
                  className="btn btn-small btn-secondary"
                  onClick={() => handleEdit(account)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-small btn-danger"
                  onClick={() => handleDelete(account.id)}
                >
                  Delete
                </button>
              </div>

              <div className="account-meta">
                <p>Added: {new Date(account.createdAt).toLocaleDateString()}</p>
                {account.pageId && <p>Page ID: {account.pageId}</p>}
                {account.businessAccountId && <p>Business Account ID: {account.businessAccountId}</p>}
                {account.organizationId && <p>Organization ID: {account.organizationId}</p>}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="setup-instructions">
        <h3>Setup Instructions</h3>
        <div className="instructions-grid">
          <div className="instruction-card">
            <h4>Facebook</h4>
            <ol>
              <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer">Facebook Developers</a></li>
              <li>Create a new app or use an existing one</li>
              <li>Add Facebook Login product</li>
              <li>Generate an access token with required permissions</li>
              <li>For pages, also add the page ID</li>
            </ol>
          </div>

          <div className="instruction-card">
            <h4>Instagram</h4>
            <ol>
              <li>Convert your Instagram account to a Business account</li>
              <li>Connect it to a Facebook page</li>
              <li>Use the same Facebook app from above</li>
              <li>Add Instagram Basic Display or Graph API</li>
              <li>Generate an access token with required permissions</li>
            </ol>
          </div>

          <div className="instruction-card">
            <h4>LinkedIn</h4>
            <ol>
              <li>Go to <a href="https://www.linkedin.com/developers" target="_blank" rel="noopener noreferrer">LinkedIn Developers</a></li>
              <li>Create a new app</li>
              <li>Request access to Marketing Developer Platform</li>
              <li>Generate an access token with required permissions</li>
              <li>For organizations, add the organization ID</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaAccounts; 