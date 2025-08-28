import React, { useState, useEffect } from 'react';
import './Settings.css';
import SocialMediaAccounts from './SocialMediaAccounts';

interface BrandVoice {
  tone: string;
  style: string;
  vocabulary: string[];
  emojiUsage: string;
  callToAction: string;
}

interface SocialMediaAccount {
  connected: boolean;
  accessToken: string | null;
}

interface PostingSchedule {
  times: string[];
  days: string[];
}

interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
  digest: string;
}

interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
  digest: string;
}

interface AppSettings {
  id: string;
  brandVoice: BrandVoice;
  socialMedia: {
    facebook: SocialMediaAccount;
    instagram: SocialMediaAccount;
    linkedin: SocialMediaAccount;
  };
  postingSchedule: {
    facebook: PostingSchedule;
    instagram: PostingSchedule;
    linkedin: PostingSchedule;
  };
  createdAt: string;
  updatedAt: string;
}

function Settings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('brand-voice');
  
  // Social Media Accounts state
  const [socialAccounts, setSocialAccounts] = useState<any[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{[key: string]: boolean}>({});
  
  // Form states for adding new accounts
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccount, setNewAccount] = useState({
    platform: 'facebook',
    accountName: '',
    accessToken: '',
    accountId: '',
    pageId: '',
    businessAccountId: '',
    organizationId: ''
  });
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Posting Management state
  const [postingSettings, setPostingSettings] = useState({
    autoPosting: false,
    postingSchedule: {
      facebook: { enabled: false, times: ['09:00', '18:00'], days: ['monday', 'wednesday', 'friday'] },
      instagram: { enabled: false, times: ['10:00', '19:00'], days: ['tuesday', 'thursday', 'saturday'] },
      linkedin: { enabled: false, times: ['08:00', '17:00'], days: ['monday', 'wednesday', 'friday'] }
    },
    contentRules: {
      maxPostsPerDay: 3,
      minEngagementThreshold: 10,
      autoRespondToComments: false
    }
  });
  
  // AI Model state
  const [ollamaStatus, setOllamaStatus] = useState<boolean>(false);
  const [availableModels, setAvailableModels] = useState<OllamaModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('llama3:8b');
  const [isPullingModel, setIsPullingModel] = useState(false);
  const [pullProgress, setPullProgress] = useState('');

  useEffect(() => {
    loadSettings();
    checkOllamaStatus();
    loadSocialAccounts();
  }, []);

  const loadSettings = async () => {
    try {
      const result = await window.electronAPI.db.getSettings();
      setSettings(result);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setMessage('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const checkOllamaStatus = async () => {
    try {
      const status = await window.electronAPI.ollama.checkStatus();
      setOllamaStatus(status);
      
      if (status) {
        const models = await window.electronAPI.ollama.getModels();
        setAvailableModels(models);
      }
    } catch (error) {
      console.error('Failed to check Ollama status:', error);
      setOllamaStatus(false);
    }
  };

  const loadSocialAccounts = async () => {
    try {
      setIsLoadingAccounts(true);
      const accounts = await window.electronAPI.social.getAccounts();
      setSocialAccounts(accounts);
      
      // Test connections for all accounts
      const statusMap: {[key: string]: boolean} = {};
      for (const account of accounts) {
        try {
          const result = await window.electronAPI.social.testConnection(account);
          statusMap[String(account.id)] = result.success && result.connected ? true : false;
        } catch (error) {
          console.error(`Failed to test connection for ${account.platform}:`, error);
          statusMap[String(account.id)] = false;
        }
      }
      setConnectionStatus(statusMap);
    } catch (error) {
      console.error('Failed to load social accounts:', error);
      setMessage('Failed to load social media accounts');
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const addSocialAccount = async () => {
    try {
      setIsConnecting(true);
      const accountId = await window.electronAPI.social.addAccount(newAccount);
      
      // Test the connection
      const result = await window.electronAPI.social.testConnection({
        ...newAccount,
        id: accountId
      });
      
      setConnectionStatus(prev => ({
        ...prev,
        [String(accountId)]: result.success && result.connected ? true : false
      }));
      
      // Reset form and reload accounts
      setNewAccount({
        platform: 'facebook',
        accountName: '',
        accessToken: '',
        accountId: '',
        pageId: '',
        businessAccountId: '',
        organizationId: ''
      });
      setShowAddForm(false);
      await loadSocialAccounts();
      
      setMessage(result.connected ? 'Account added and connected successfully!' : 'Account added but connection failed');
    } catch (error) {
      console.error('Failed to add social account:', error);
      setMessage('Failed to add social media account');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAccountAction = async (accountId: string, action: 'toggle' | 'refresh' | 'delete') => {
    try {
      switch (action) {
        case 'toggle':
          // Toggle connection status
          const currentStatus = connectionStatus[accountId];
          setConnectionStatus(prev => ({
            ...prev,
            [String(accountId)]: !currentStatus
          }));
          break;
        case 'refresh':
          // Refresh token
          const account = socialAccounts.find(acc => acc.id === accountId);
          if (account) {
            const result = await window.electronAPI.social.testConnection(account);
            setConnectionStatus(prev => ({
              ...prev,
              [String(accountId)]: result.success && result.connected ? true : false
            }));
          }
          break;
        case 'delete':
          // Delete account
          await window.electronAPI.social.deleteAccount(accountId);
          await loadSocialAccounts();
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} account:`, error);
      setMessage(`Failed to ${action} account`);
    }
  };

  const deleteSocialAccount = async (accountId: string) => {
    try {
      await window.electronAPI.social.deleteAccount(accountId);
      await loadSocialAccounts();
      setMessage('Account deleted successfully');
    } catch (error) {
      console.error('Failed to delete social account:', error);
      setMessage('Failed to delete social media account');
    }
  };

  const refreshToken = async (accountId: string) => {
    try {
      const account = socialAccounts.find(acc => acc.id === accountId);
      if (!account) return;
      
      const result = await window.electronAPI.social.testConnection(account);
      const isConnected = result.success && result.connected ? true : false;
      setConnectionStatus(prev => ({
        ...prev,
        [String(accountId)]: isConnected
      }));
      
      setMessage(isConnected ? 'Token refreshed successfully!' : 'Token refresh failed');
    } catch (error) {
      console.error('Failed to refresh token:', error);
      setMessage('Failed to refresh token');
    }
  };

  const pullModel = async (modelName: string) => {
    setIsPullingModel(true);
    setPullProgress('Starting download...');
    
    try {
      const success = await window.electronAPI.ollama.pullModel(modelName);
      if (success) {
        setPullProgress('Model downloaded successfully!');
        await checkOllamaStatus(); // Refresh model list
        setTimeout(() => setPullProgress(''), 3000);
      } else {
        setPullProgress('Failed to download model');
      }
    } catch (error) {
      console.error('Failed to pull model:', error);
      setPullProgress('Error downloading model');
    } finally {
      setIsPullingModel(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      await window.electronAPI.db.updateSettings(settings);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateBrandVoice = (field: keyof BrandVoice, value: string | string[]) => {
    if (!settings) return;
    setSettings({
      ...settings,
      brandVoice: {
        ...settings.brandVoice,
        [field]: value
      }
    });
  };

  if (isLoading) {
    return (
      <div className="settings-container">
        <div className="loading">Loading Settings...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="settings-container">
        <div className="error">Failed to load settings</div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <button 
          className="save-button" 
          onClick={saveSettings}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('Failed') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="settings-tabs">
        <button 
          className={`tab-button ${activeTab === 'brand-voice' ? 'active' : ''}`}
          onClick={() => setActiveTab('brand-voice')}
        >
          🎨 Brand Voice
        </button>
        <button 
          className={`tab-button ${activeTab === 'ai-model' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-model')}
        >
          🤖 AI Model
        </button>
        <button 
          className={`tab-button ${activeTab === 'social-media' ? 'active' : ''}`}
          onClick={() => setActiveTab('social-media')}
        >
          🔗 Social Media Accounts
        </button>
        <button 
          className={`tab-button ${activeTab === 'posting-management' ? 'active' : ''}`}
          onClick={() => setActiveTab('posting-management')}
        >
          📝 Posting Management
        </button>
      </div>

      <div className="settings-sections">
        {/* Brand Voice Section */}
        {activeTab === 'brand-voice' && (
          <section className="settings-section">
            <h2>Brand Voice Configuration</h2>
            <div className="form-group">
              <label>Tone:</label>
              <select 
                value={settings.brandVoice.tone}
                onChange={(e) => updateBrandVoice('tone', e.target.value)}
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="friendly">Friendly</option>
                <option value="authoritative">Authoritative</option>
                <option value="conversational">Conversational</option>
              </select>
            </div>

            <div className="form-group">
              <label>Style:</label>
              <select 
                value={settings.brandVoice.style}
                onChange={(e) => updateBrandVoice('style', e.target.value)}
              >
                <option value="conversational">Conversational</option>
                <option value="formal">Formal</option>
                <option value="creative">Creative</option>
                <option value="technical">Technical</option>
                <option value="storytelling">Storytelling</option>
              </select>
            </div>

            <div className="form-group">
              <label>Vocabulary (comma-separated):</label>
              <input 
                type="text"
                value={settings.brandVoice.vocabulary.join(', ')}
                onChange={(e) => updateBrandVoice('vocabulary', e.target.value.split(',').map(v => v.trim()))}
                placeholder="innovative, strategic, results-driven"
              />
            </div>

            <div className="form-group">
              <label>Emoji Usage:</label>
              <select 
                value={settings.brandVoice.emojiUsage}
                onChange={(e) => updateBrandVoice('emojiUsage', e.target.value)}
              >
                <option value="none">None</option>
                <option value="minimal">Minimal</option>
                <option value="strategic">Strategic</option>
                <option value="abundant">Abundant</option>
              </select>
            </div>

            <div className="form-group">
              <label>Call to Action:</label>
              <select 
                value={settings.brandVoice.callToAction}
                onChange={(e) => updateBrandVoice('callToAction', e.target.value)}
              >
                <option value="soft">Soft</option>
                <option value="moderate">Moderate</option>
                <option value="strong">Strong</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>
          </section>
        )}

        {/* AI Model Section */}
        {activeTab === 'ai-model' && (
          <section className="settings-section">
            <h2>AI Model Configuration</h2>
            
            <div className="ollama-status">
              <h3>Ollama Status</h3>
              <div className={`status-indicator ${ollamaStatus ? 'connected' : 'disconnected'}`}>
                {ollamaStatus ? '✅ Running' : '❌ Not Running'}
              </div>
              <button 
                className="refresh-button"
                onClick={checkOllamaStatus}
              >
                🔄 Refresh Status
              </button>
            </div>

            {!ollamaStatus && (
              <div className="ollama-install">
                <h3>Install Ollama</h3>
                <p>Ollama is required for AI content generation. Please install it first:</p>
                <div className="install-commands">
                  <code># macOS</code>
                  <code>brew install ollama</code>
                  <code># Then start it:</code>
                  <code>ollama serve</code>
                </div>
                <a 
                  href="https://ollama.ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="install-link"
                >
                  📥 Download Ollama
                </a>
              </div>
            )}

            {ollamaStatus && (
              <>
                <div className="model-selection">
                  <h3>Model Selection</h3>
                  <div className="form-group">
                    <label>Default Model:</label>
                    <select 
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                    >
                      {availableModels.map(model => (
                        <option key={model.name} value={model.name}>
                          {model.name} ({Math.round(model.size / 1024 / 1024 / 1024)}GB)
                        </option>
                      ))}
                      <option value="llama3:8b">llama3:8b (Recommended)</option>
                      <option value="mistral:7b">mistral:7b (Fast)</option>
                      <option value="llama3.1:8b">llama3.1:8b (Latest)</option>
                    </select>
                  </div>
                </div>

                <div className="model-management">
                  <h3>Model Management</h3>
                  <div className="available-models">
                    <h4>Available Models:</h4>
                    {availableModels.length === 0 ? (
                      <p>No models installed. Pull a model to get started.</p>
                    ) : (
                      <ul>
                        {availableModels.map(model => (
                          <li key={model.name}>
                            <strong>{model.name}</strong> - {Math.round(model.size / 1024 / 1024 / 1024)}GB
                            <span className="model-date">
                              {new Date(model.modified_at).toLocaleDateString()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="pull-model">
                    <h4>Pull New Model:</h4>
                    <div className="pull-controls">
                      <select 
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        disabled={isPullingModel}
                      >
                        <option value="llama3:8b">llama3:8b (4.7GB) - Recommended</option>
                        <option value="mistral:7b">mistral:7b (4.1GB) - Fast & Efficient</option>
                        <option value="llama3.1:8b">llama3.1:8b (4.7GB) - Latest</option>
                        <option value="phi3:mini">phi3:mini (1.8GB) - Lightweight</option>
                      </select>
                      <button 
                        className="pull-button"
                        onClick={() => pullModel(selectedModel)}
                        disabled={isPullingModel}
                      >
                        {isPullingModel ? '⏳ Downloading...' : '📥 Pull Model'}
                      </button>
                    </div>
                    {pullProgress && (
                      <div className="pull-progress">
                        {pullProgress}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        {/* Social Media Accounts */}
        {activeTab === 'social-media' && (
          <section className="settings-section">
            <SocialMediaAccounts />
          </section>
        )}

        {/* Posting Management */}
        {activeTab === 'posting-management' && (
          <section className="settings-section">
            <h2>Posting Management</h2>
            
            <div className="posting-settings">
              <div className="setting-group">
                <h3>Auto Posting</h3>
                <div className="form-group">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={postingSettings.autoPosting}
                      onChange={(e) => setPostingSettings({
                        ...postingSettings,
                        autoPosting: e.target.checked
                      })}
                    />
                    Enable automatic posting
                  </label>
                </div>
              </div>

              <div className="setting-group">
                <h3>Posting Schedule</h3>
                <div className="platform-schedules">
                  <div className="platform-schedule">
                    <h4>Facebook</h4>
                    <div className="schedule-controls">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={postingSettings.postingSchedule.facebook.enabled}
                          onChange={(e) => setPostingSettings({
                            ...postingSettings,
                            postingSchedule: {
                              ...postingSettings.postingSchedule,
                              facebook: {
                                ...postingSettings.postingSchedule.facebook,
                                enabled: e.target.checked
                              }
                            }
                          })}
                        />
                        Enable Facebook posting
                      </label>
                      <div className="time-inputs">
                        <input 
                          type="time" 
                          value={postingSettings.postingSchedule.facebook.times[0]}
                          onChange={(e) => {
                            const newTimes = [...postingSettings.postingSchedule.facebook.times];
                            newTimes[0] = e.target.value;
                            setPostingSettings({
                              ...postingSettings,
                              postingSchedule: {
                                ...postingSettings.postingSchedule,
                                facebook: {
                                  ...postingSettings.postingSchedule.facebook,
                                  times: newTimes
                                }
                              }
                            });
                          }}
                        />
                        <input 
                          type="time" 
                          value={postingSettings.postingSchedule.facebook.times[1]}
                          onChange={(e) => {
                            const newTimes = [...postingSettings.postingSchedule.facebook.times];
                            newTimes[1] = e.target.value;
                            setPostingSettings({
                              ...postingSettings,
                              postingSchedule: {
                                ...postingSettings.postingSchedule,
                                facebook: {
                                  ...postingSettings.postingSchedule.facebook,
                                  times: newTimes
                                }
                              }
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="platform-schedule">
                    <h4>Instagram</h4>
                    <div className="schedule-controls">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={postingSettings.postingSchedule.instagram.enabled}
                          onChange={(e) => setPostingSettings({
                            ...postingSettings,
                            postingSchedule: {
                              ...postingSettings.postingSchedule,
                              instagram: {
                                ...postingSettings.postingSchedule.instagram,
                                enabled: e.target.checked
                              }
                            }
                          })}
                        />
                        Enable Instagram posting
                      </label>
                      <div className="time-inputs">
                        <input 
                          type="time" 
                          value={postingSettings.postingSchedule.instagram.times[0]}
                          onChange={(e) => {
                            const newTimes = [...postingSettings.postingSchedule.instagram.times];
                            newTimes[0] = e.target.value;
                            setPostingSettings({
                              ...postingSettings,
                              postingSchedule: {
                                ...postingSettings.postingSchedule,
                                instagram: {
                                  ...postingSettings.postingSchedule.instagram,
                                  times: newTimes
                                }
                              }
                            });
                          }}
                        />
                        <input 
                          type="time" 
                          value={postingSettings.postingSchedule.instagram.times[1]}
                          onChange={(e) => {
                            const newTimes = [...postingSettings.postingSchedule.instagram.times];
                            newTimes[1] = e.target.value;
                            setPostingSettings({
                              ...postingSettings,
                              postingSchedule: {
                                ...postingSettings.postingSchedule,
                                instagram: {
                                  ...postingSettings.postingSchedule.instagram,
                                  times: newTimes
                                }
                              }
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="platform-schedule">
                    <h4>LinkedIn</h4>
                    <div className="schedule-controls">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={postingSettings.postingSchedule.linkedin.enabled}
                          onChange={(e) => setPostingSettings({
                            ...postingSettings,
                            postingSchedule: {
                              ...postingSettings.postingSchedule,
                              linkedin: {
                                ...postingSettings.postingSchedule.linkedin,
                                enabled: e.target.checked
                              }
                            }
                          })}
                        />
                        Enable LinkedIn posting
                      </label>
                      <div className="time-inputs">
                        <input 
                          type="time" 
                          value={postingSettings.postingSchedule.linkedin.times[0]}
                          onChange={(e) => {
                            const newTimes = [...postingSettings.postingSchedule.linkedin.times];
                            newTimes[0] = e.target.value;
                            setPostingSettings({
                              ...postingSettings,
                              postingSchedule: {
                                ...postingSettings.postingSchedule,
                                linkedin: {
                                  ...postingSettings.postingSchedule.linkedin,
                                  times: newTimes
                                }
                              }
                            });
                          }}
                        />
                        <input 
                          type="time" 
                          value={postingSettings.postingSchedule.linkedin.times[1]}
                          onChange={(e) => {
                            const newTimes = [...postingSettings.postingSchedule.linkedin.times];
                            newTimes[1] = e.target.value;
                            setPostingSettings({
                              ...postingSettings,
                              postingSchedule: {
                                ...postingSettings.postingSchedule,
                                linkedin: {
                                  ...postingSettings.postingSchedule.linkedin,
                                  times: newTimes
                                }
                              }
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="setting-group">
                <h3>Content Rules</h3>
                <div className="form-group">
                  <label>Maximum posts per day:</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10"
                    value={postingSettings.contentRules.maxPostsPerDay}
                    onChange={(e) => setPostingSettings({
                      ...postingSettings,
                      contentRules: {
                        ...postingSettings.contentRules,
                        maxPostsPerDay: parseInt(e.target.value)
                      }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Minimum engagement threshold:</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100"
                    value={postingSettings.contentRules.minEngagementThreshold}
                    onChange={(e) => setPostingSettings({
                      ...postingSettings,
                      contentRules: {
                        ...postingSettings.contentRules,
                        minEngagementThreshold: parseInt(e.target.value)
                      }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={postingSettings.contentRules.autoRespondToComments}
                      onChange={(e) => setPostingSettings({
                        ...postingSettings,
                        contentRules: {
                          ...postingSettings.contentRules,
                          autoRespondToComments: e.target.checked
                        }
                      })}
                    />
                    Auto-respond to comments
                  </label>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Settings; 