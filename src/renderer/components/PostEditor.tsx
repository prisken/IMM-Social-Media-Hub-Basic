import React, { useState, useEffect } from 'react';
import './PostEditor.css';

interface Post {
  id: string;
  platform: string;
  content: string;
  mediaFiles: string[];
  scheduledTime: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  engagement?: any;
  createdAt: string;
  updatedAt: string;
}

interface PostEditorProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPost: Post) => void;
}

const PLATFORMS = [
  { name: 'Facebook', maxLength: 63206, hashtagLimit: 30 },
  { name: 'Instagram', maxLength: 2200, hashtagLimit: 30 },
  { name: 'LinkedIn', maxLength: 3000, hashtagLimit: 5 },
  { name: 'Twitter', maxLength: 280, hashtagLimit: 10 }
];

const PostEditor: React.FC<PostEditorProps> = ({ post, isOpen, onClose, onSave }) => {
  const [platform, setPlatform] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [customHashtag, setCustomHashtag] = useState<string>('');

  const currentPlatform = PLATFORMS.find(p => p.name === platform);

  useEffect(() => {
    if (post && isOpen) {
      setPlatform(post.platform);
      setContent(post.content);
      setScheduledTime(post.scheduledTime);
      // Extract hashtags from content
      const hashtagRegex = /#[\w]+/g;
      const extractedHashtags = post.content.match(hashtagRegex) || [];
      setHashtags(extractedHashtags);
    }
  }, [post, isOpen]);

  const addHashtag = (hashtag: string) => {
    const cleanHashtag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
    if (!hashtags.includes(cleanHashtag) && hashtags.length < (currentPlatform?.hashtagLimit || 30)) {
      setHashtags([...hashtags, cleanHashtag]);
    }
  };

  const removeHashtag = (hashtag: string) => {
    setHashtags(hashtags.filter(h => h !== hashtag));
  };

  const addCustomHashtag = () => {
    if (customHashtag.trim()) {
      addHashtag(customHashtag.trim());
      setCustomHashtag('');
    }
  };

  const handleCustomHashtagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomHashtag();
    }
  };

  const getFormattedContent = () => {
    let formattedContent = content;
    
    // Add hashtags to content
    if (hashtags.length > 0) {
      formattedContent += '\n\n' + hashtags.join(' ');
    }
    
    return formattedContent;
  };

  const getMediaPreview = () => {
    if (!post?.mediaFiles || post.mediaFiles.length === 0) return null;

    return (
      <div className="post-media">
        {post.mediaFiles.map((mediaPath, index) => {
          const fileName = mediaPath.split('/').pop() || '';
          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
          
          return (
            <div key={index} className="media-preview">
              {isImage ? (
                <div className="media-thumbnail">
                  <img 
                    src={`file://${mediaPath}`} 
                    alt={fileName}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="media-fallback hidden">
                    <span className="media-icon">📷</span>
                    <span className="media-name">{fileName}</span>
                  </div>
                </div>
              ) : (
                <div className="media-thumbnail">
                  <span className="media-icon">📄</span>
                  <span className="media-name">{fileName}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const handleSave = async () => {
    if (!content.trim()) {
      alert('Please enter some content before saving.');
      return;
    }

    if (!post) return;

    setIsSaving(true);
    try {
      // Combine content with hashtags
      const contentWithHashtags = hashtags.length > 0 
        ? content + '\n\n' + hashtags.join(' ')
        : content;

      const updatedPost: Post = {
        ...post,
        platform,
        content: contentWithHashtags,
        scheduledTime,
        updatedAt: new Date().toISOString()
      };

      await window.electronAPI.db.updatePost(post.id, updatedPost);
      onSave(updatedPost);
      onClose();
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Error updating post: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !post) return null;

  return (
    <div className="post-editor-overlay">
      <div className="post-editor-modal">
        <div className="post-editor-header">
          <h2>Edit Scheduled Post</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="post-editor-content">
          <div className="editor-section">
            <h3>Post Details</h3>
            
            <div className="form-group">
              <label>Platform:</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                {PLATFORMS.map(p => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Content:</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content..."
                maxLength={currentPlatform?.maxLength || 2200}
                rows={6}
              />
              <div className="character-count">
                {content.length}/{currentPlatform?.maxLength || 2200} characters
              </div>
            </div>

            <div className="form-group">
              <label>Hashtags:</label>
              <div className="hashtags-container">
                {hashtags.map(hashtag => (
                  <span key={hashtag} className="hashtag">
                    {hashtag}
                    <button onClick={() => removeHashtag(hashtag)}>×</button>
                  </span>
                ))}
              </div>
              <div className="hashtag-input">
                <input
                  type="text"
                  value={customHashtag}
                  onChange={(e) => setCustomHashtag(e.target.value)}
                  onKeyPress={handleCustomHashtagKeyPress}
                  placeholder="Add custom hashtag..."
                />
                <button onClick={addCustomHashtag}>Add</button>
              </div>
              <div className="hashtag-limit">
                {hashtags.length} / {currentPlatform?.hashtagLimit || 30} hashtags
              </div>
            </div>

            <div className="form-group">
              <label>Scheduled Time:</label>
              <input
                type="datetime-local"
                value={scheduledTime ? scheduledTime.slice(0, 16) : ''}
                onChange={(e) => setScheduledTime(e.target.value + ':00.000Z')}
              />
            </div>
          </div>

          <div className="editor-section">
            <h3>Preview</h3>
            <div className="platform-preview">
              <div className={`social-post-preview ${platform.toLowerCase()}`}>
                {/* Post Header */}
                <div className="post-header">
                  <div className="profile-info">
                    <div className="profile-avatar">
                      <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM0MDQwNDAiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz4KPC9zdmc+Cjwvc3ZnPgo=" alt="Profile" />
                    </div>
                    <div className="profile-details">
                      <div className="profile-name">Your Brand</div>
                      <div className="post-time">Just now</div>
                    </div>
                  </div>
                  <div className="post-options">
                    <span>⋯</span>
                  </div>
                </div>

                {/* Post Content */}
                <div className="post-content">
                  <div className="post-text">
                    {getFormattedContent() || (
                      <span className="placeholder-text">Write your content here...</span>
                    )}
                  </div>
                  
                  {/* Media Preview */}
                  {getMediaPreview()}

                  {/* Engagement Stats */}
                  <div className="post-engagement">
                    <div className="engagement-stats">
                      <span>❤️ 0</span>
                      <span>💬 0</span>
                      <span>🔄 0</span>
                      <span>📤 0</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="post-actions">
                    <button className="action-btn">❤️</button>
                    <button className="action-btn">💬</button>
                    <button className="action-btn">🔄</button>
                    <button className="action-btn">📤</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="post-editor-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="save-btn"
            onClick={handleSave}
            disabled={isSaving || !content.trim()}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostEditor; 