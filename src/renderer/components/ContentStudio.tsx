import React, { useState, useEffect } from 'react';
import './ContentStudio.css';

interface PostDraft {
  id: string;
  platform: string;
  contentType: 'text' | 'carousel' | 'story';
  content: string;
  mediaFiles: string[];
  hashtags: string[];
  callToAction: string;
  status: 'draft' | 'scheduled' | 'published';
  createdAt: string;
  updatedAt: string;
}

const PLATFORMS = [
  { name: 'Facebook', maxLength: 63206, supportsCarousel: true, supportsStories: false, mediaLimit: 10, hashtagLimit: 30 },
  { name: 'Instagram', maxLength: 2200, supportsCarousel: true, supportsStories: true, mediaLimit: 10, hashtagLimit: 30 },
  { name: 'LinkedIn', maxLength: 3000, supportsCarousel: false, supportsStories: false, mediaLimit: 1, hashtagLimit: 5 },
  { name: 'Twitter', maxLength: 280, supportsCarousel: true, supportsStories: false, mediaLimit: 4, hashtagLimit: 10 }
];

const SUGGESTED_HASHTAGS = [
  '#marketing', '#business', '#socialmedia', '#digitalmarketing', '#branding',
  '#contentmarketing', '#growth', '#entrepreneur', '#startup', '#innovation'
];

const CALL_TO_ACTIONS = [
  'Learn more', 'Get started', 'Sign up', 'Download now', 'Book a call'
];

const ContentStudio: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Instagram');
  const [contentType, setContentType] = useState<'text' | 'carousel' | 'story'>('text');
  const [content, setContent] = useState<string>('');
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [selectedCTA, setSelectedCTA] = useState<string>('');
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<PostDraft[]>([]);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState<boolean>(false);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [selectedMediaFiles, setSelectedMediaFiles] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [customHashtag, setCustomHashtag] = useState<string>('');
  const [brandVoiceProfiles, setBrandVoiceProfiles] = useState<any[]>([]);
  const [selectedBrandVoice, setSelectedBrandVoice] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  
  // Post functionality
  const [isPosting, setIsPosting] = useState<boolean>(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState<boolean>(false);
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [scheduleTime, setScheduleTime] = useState<string>('');

  const currentPlatform = PLATFORMS.find(p => p.name === selectedPlatform);

  useEffect(() => {
    loadDrafts();
    loadMediaFiles();
    loadBrandVoiceProfiles();
  }, []);

  const loadMediaFiles = async () => {
    try {
      if (window.electronAPI?.media?.getFiles) {
        const files = await window.electronAPI.media.getFiles();
        setMediaFiles(files);
      }
    } catch (error) {
      console.error('Error loading media files:', error);
    }
  };

  const loadBrandVoiceProfiles = async () => {
    try {
      if (window.electronAPI?.brandVoice?.getProfiles) {
        const profiles = await window.electronAPI.brandVoice.getProfiles();
        setBrandVoiceProfiles(profiles);
        if (profiles.length > 0) {
          setSelectedBrandVoice(profiles[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading brand voice profiles:', error);
    }
  };

  const loadDrafts = async () => {
    try {
      if (window.electronAPI?.db?.getPosts) {
        const posts = await window.electronAPI.db.getPosts();
        setDrafts(posts);
      }
    } catch (error) {
      console.error('Error loading drafts:', error);
    }
  };

  const saveDraft = async () => {
    if (!content.trim()) {
      alert('Please enter some content before saving.');
      return;
    }

    setIsSaving(true);

    const draft: Omit<PostDraft, 'id'> = {
      platform: selectedPlatform,
      contentType,
      content: content.trim(),
      mediaFiles: selectedMedia,
      hashtags: selectedHashtags,
      callToAction: selectedCTA,
      status: 'draft',
      createdAt: currentDraftId ? drafts.find(d => d.id === currentDraftId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      console.log('Saving draft:', draft);
      
      if (currentDraftId) {
        // Update existing draft
        console.log('Updating existing draft:', currentDraftId);
        await window.electronAPI.db.updatePost(currentDraftId, draft);
        console.log('Draft updated successfully');
      } else {
        // Create new draft
        console.log('Creating new draft');
        const newDraftId = await window.electronAPI.db.addPost(draft);
        console.log('New draft created with ID:', newDraftId);
        setCurrentDraftId(newDraftId);
      }
      
      // Reload drafts
      await loadDrafts();
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Error saving draft: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const createNewDraft = () => {
    setCurrentDraftId(null);
    setContent('');
    setSelectedHashtags([]);
    setSelectedCTA('');
    setSelectedMedia([]);
  };

  const loadDraft = (draft: PostDraft) => {
    console.log('Loading draft:', draft);
    setCurrentDraftId(draft.id);
    setSelectedPlatform(draft.platform);
    setContentType(draft.contentType);
    setContent(draft.content);
    setSelectedHashtags(draft.hashtags || []);
    setSelectedCTA(draft.callToAction || '');
    setSelectedMedia(draft.mediaFiles || []);
    alert('Draft loaded successfully!');
  };

  const addHashtag = (hashtag: string) => {
    const cleanHashtag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
    if (!selectedHashtags.includes(cleanHashtag) && selectedHashtags.length < (currentPlatform?.hashtagLimit || 30)) {
      setSelectedHashtags([...selectedHashtags, cleanHashtag]);
    }
  };

  const removeHashtag = (hashtag: string) => {
    setSelectedHashtags(selectedHashtags.filter(h => h !== hashtag));
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

  const generateContentWithAI = async () => {
    if (!selectedBrandVoice || !aiPrompt.trim()) {
      alert('Please select a brand voice profile and enter a prompt.');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Generating content with AI:', { selectedBrandVoice, aiPrompt, platform: selectedPlatform });
      
      const generatedContent = await window.electronAPI.brandVoice.generateWithVoice(
        aiPrompt,
        selectedBrandVoice,
        'llama3:8b'
      );
      
      console.log('AI generated content:', generatedContent);
      setContent(generatedContent);
      alert('Content generated successfully!');
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Error generating content: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSampleContent = async () => {
    if (!selectedBrandVoice) {
      alert('Please select a brand voice profile first.');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Generating sample content:', { selectedBrandVoice, platform: selectedPlatform, contentType });
      
      const sampleContent = await window.electronAPI.brandVoice.generateSamples(
        selectedBrandVoice,
        selectedPlatform,
        contentType,
        'llama3:8b'
      );
      
      console.log('Sample content generated:', sampleContent);
      
      // Parse the sample content (it might contain multiple variations)
      if (sampleContent && typeof sampleContent === 'string') {
        const variations = sampleContent.split('---').map(v => v.trim()).filter(v => v);
        if (variations.length > 0) {
          setContent(variations[0]); // Use the first variation
          alert(`Generated ${variations.length} content variations! Using the first one.`);
        }
      }
    } catch (error) {
      console.error('Error generating sample content:', error);
      alert('Error generating sample content: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsGenerating(false);
    }
  };

  const openMediaLibrary = () => {
    setShowMediaLibrary(true);
    loadMediaFiles();
  };

  const selectMediaFile = (file: any) => {
    const isSelected = selectedMediaFiles.find(f => f.id === file.id);
    if (isSelected) {
      setSelectedMediaFiles(selectedMediaFiles.filter(f => f.id !== file.id));
    } else {
      if (selectedMediaFiles.length < (currentPlatform?.mediaLimit || 1)) {
        setSelectedMediaFiles([...selectedMediaFiles, file]);
      }
    }
  };

  const confirmMediaSelection = () => {
    setSelectedMedia(selectedMediaFiles.map(f => f.filename));
    setShowMediaLibrary(false);
  };

  const removeSelectedMedia = (filename: string) => {
    setSelectedMedia(selectedMedia.filter(f => f !== filename));
    setSelectedMediaFiles(selectedMediaFiles.filter(f => f.filename !== filename));
  };

  const deleteDraft = async (draftId: string) => {
    try {
      await window.electronAPI.db.deletePost(draftId);
      await loadDrafts();
      
      if (currentDraftId === draftId) {
        createNewDraft();
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  };

  const postImmediately = async () => {
    if (!content.trim()) {
      alert('Please enter some content before posting.');
      return;
    }

    if (!selectedPlatform) {
      alert('Please select a platform before posting.');
      return;
    }

    setIsPosting(true);

    try {
      const postData = {
        platform: selectedPlatform,
        contentType,
        content: content.trim(),
        mediaFiles: selectedMedia,
        hashtags: selectedHashtags,
        callToAction: selectedCTA,
        status: 'published',
        scheduledTime: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Posting immediately:', postData);
      
      // Add to database
      const postId = await window.electronAPI.db.addPost(postData);
      
      // Trigger immediate posting
      const postingResult = await window.electronAPI.posting.postNow(postId);
      
      if (!postingResult.success) {
        throw new Error(postingResult.error || 'Posting failed');
      }
      
      // Reload drafts
      await loadDrafts();
      
      alert(`Post published to ${selectedPlatform} successfully!`);
      
      // Clear the form for next post
      createNewDraft();
      
    } catch (error) {
      console.error('Error posting immediately:', error);
      alert('Error posting: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsPosting(false);
    }
  };

  const schedulePost = async () => {
    if (!content.trim()) {
      alert('Please enter some content before scheduling.');
      return;
    }

    if (!selectedPlatform) {
      alert('Please select a platform before scheduling.');
      return;
    }

    if (!scheduleDate || !scheduleTime) {
      alert('Please select both date and time for scheduling.');
      return;
    }

    setIsPosting(true);

    try {
      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}:00`);
      
      if (scheduledDateTime <= new Date()) {
        alert('Please select a future date and time for scheduling.');
        setIsPosting(false);
        return;
      }

      const postData = {
        platform: selectedPlatform,
        contentType,
        content: content.trim(),
        mediaFiles: selectedMedia,
        hashtags: selectedHashtags,
        callToAction: selectedCTA,
        status: 'scheduled',
        scheduledTime: scheduledDateTime.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Scheduling post:', postData);
      
      // Add to database
      const postId = await window.electronAPI.db.addPost(postData);
      
      // Schedule the post
      const schedulingResult = await window.electronAPI.posting.schedulePost(postId, scheduledDateTime.toISOString());
      
      if (!schedulingResult.success) {
        throw new Error(schedulingResult.error || 'Scheduling failed');
      }
      
      // Reload drafts
      await loadDrafts();
      
      alert(`Post scheduled for ${selectedPlatform} on ${scheduleDate} at ${scheduleTime}!`);
      
      // Clear the form and close dialog
      createNewDraft();
      setShowScheduleDialog(false);
      setScheduleDate('');
      setScheduleTime('');
      
    } catch (error) {
      console.error('Error scheduling post:', error);
      alert('Error scheduling post: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsPosting(false);
    }
  };

  const openScheduleDialog = () => {
    if (!content.trim()) {
      alert('Please enter some content before scheduling.');
      return;
    }
    
    // Set default date to tomorrow and time to 9 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduleDate(tomorrow.toISOString().split('T')[0]);
    setScheduleTime('09:00');
    setShowScheduleDialog(true);
  };

  const closeScheduleDialog = () => {
    setShowScheduleDialog(false);
    setScheduleDate('');
    setScheduleTime('');
  };

  const getCharacterCount = () => {
    const baseContent = content;
    const hashtagContent = selectedHashtags.join(' ');
    const ctaContent = selectedCTA ? ` ${selectedCTA}` : '';
    return baseContent.length + hashtagContent.length + ctaContent.length;
  };

  const getPreviewContent = () => {
    return content;
  };

  const getFormattedContent = () => {
    let formatted = content;
    if (selectedHashtags.length > 0) {
      formatted += '\n\n' + selectedHashtags.join(' ');
    }
    if (selectedCTA) {
      formatted += '\n\n' + selectedCTA;
    }
    return formatted;
  };

  return (
    <div className="content-studio">
      <div className="content-studio-header">
        <h2>Content Studio</h2>
        <div className="content-studio-actions">
          <button className="btn btn-secondary" onClick={createNewDraft}>
            New Draft
          </button>
          <button 
            className="btn btn-primary" 
            onClick={saveDraft} 
            disabled={!content.trim() || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
          <button 
            className="btn btn-success" 
            onClick={postImmediately} 
            disabled={!content.trim() || isPosting}
          >
            {isPosting ? 'Posting...' : '🚀 Post Now'}
          </button>
          <button 
            className="btn btn-warning" 
            onClick={openScheduleDialog} 
            disabled={!content.trim() || isPosting}
          >
            📅 Schedule Post
          </button>
        </div>
      </div>

      <div className="content-studio-layout">
        <div className="editor-panel">
          <div className="platform-selector">
            <label>Platform:</label>
            <select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)}>
              {PLATFORMS.map(platform => (
                <option key={platform.name} value={platform.name}>{platform.name}</option>
              ))}
            </select>
          </div>

          {/* AI Content Generation */}
          <div className="ai-generation-section">
            <label>AI Content Generation:</label>
            
            {/* Brand Voice Selection */}
            <div className="brand-voice-selector">
              <label>Brand Voice Profile:</label>
              <select 
                value={selectedBrandVoice} 
                onChange={(e) => setSelectedBrandVoice(e.target.value)}
                disabled={brandVoiceProfiles.length === 0}
              >
                {brandVoiceProfiles.length === 0 ? (
                  <option value="">No brand voice profiles available</option>
                ) : (
                  brandVoiceProfiles.map(profile => (
                    <option key={profile.id} value={profile.id}>{profile.name}</option>
                  ))
                )}
              </select>
            </div>

            {/* AI Prompt Input */}
            <div className="ai-prompt-input">
              <label>AI Prompt:</label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe what content you want to generate (e.g., 'Create a post about our new product launch')"
                rows={3}
                disabled={!selectedBrandVoice}
              />
            </div>

            {/* AI Action Buttons */}
            <div className="ai-actions">
              <button
                className="btn btn-ai"
                onClick={generateContentWithAI}
                disabled={!selectedBrandVoice || !aiPrompt.trim() || isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate with AI'}
              </button>
              
              <button
                className="btn btn-ai-secondary"
                onClick={generateSampleContent}
                disabled={!selectedBrandVoice || isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Sample'}
              </button>
            </div>

            {brandVoiceProfiles.length === 0 && (
              <div className="ai-notice">
                <p>💡 <strong>No brand voice profiles found.</strong> Create a brand voice profile in the Brand Voice section to enable AI content generation.</p>
              </div>
            )}
          </div>

          <div className="content-type-selector">
            <label>Content Type:</label>
            <div className="content-type-buttons">
              <button
                className={`content-type-btn ${contentType === 'text' ? 'active' : ''}`}
                onClick={() => setContentType('text')}
              >
                Text Post
              </button>
              {currentPlatform?.supportsCarousel && (
                <button
                  className={`content-type-btn ${contentType === 'carousel' ? 'active' : ''}`}
                  onClick={() => setContentType('carousel')}
                >
                  Carousel
                </button>
              )}
              {currentPlatform?.supportsStories && (
                <button
                  className={`content-type-btn ${contentType === 'story' ? 'active' : ''}`}
                  onClick={() => setContentType('story')}
                >
                  Story
                </button>
              )}
            </div>
          </div>

          <div className="content-editor">
            <label>Content:</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your content here..."
              rows={8}
            />
            <div className="character-count">
              {getCharacterCount()} / {currentPlatform?.maxLength || 2200} characters
            </div>
          </div>

          <div className="hashtag-section">
            <label>Hashtags:</label>
            <div className="selected-hashtags">
              {selectedHashtags.map(hashtag => (
                <span key={hashtag} className="hashtag-tag">
                  {hashtag}
                  <button onClick={() => removeHashtag(hashtag)}>×</button>
                </span>
              ))}
            </div>
            
            {/* Custom Hashtag Input */}
            <div className="custom-hashtag-input">
              <div className="input-group">
                <input
                  type="text"
                  value={customHashtag}
                  onChange={(e) => setCustomHashtag(e.target.value)}
                  onKeyPress={handleCustomHashtagKeyPress}
                  placeholder="Add custom hashtag..."
                  className="hashtag-input"
                  disabled={selectedHashtags.length >= (currentPlatform?.hashtagLimit || 30)}
                />
                <button
                  onClick={addCustomHashtag}
                  disabled={!customHashtag.trim() || selectedHashtags.length >= (currentPlatform?.hashtagLimit || 30)}
                  className="add-hashtag-btn"
                >
                  Add
                </button>
              </div>
              <div className="hashtag-limit">
                {selectedHashtags.length} / {currentPlatform?.hashtagLimit || 30} hashtags
              </div>
            </div>

            <div className="hashtag-suggestions">
              <h4>Suggested Hashtags:</h4>
              <div className="hashtag-grid">
                {SUGGESTED_HASHTAGS.map(hashtag => (
                  <button
                    key={hashtag}
                    className="hashtag-suggestion"
                    onClick={() => addHashtag(hashtag)}
                    disabled={selectedHashtags.includes(hashtag) || selectedHashtags.length >= (currentPlatform?.hashtagLimit || 30)}
                  >
                    {hashtag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="cta-section">
            <label>Call to Action:</label>
            <div className="cta-suggestions">
              {CALL_TO_ACTIONS.map(cta => (
                <button
                  key={cta}
                  className={`cta-suggestion ${selectedCTA === cta ? 'active' : ''}`}
                  onClick={() => setSelectedCTA(cta)}
                >
                  {cta}
                </button>
              ))}
            </div>
          </div>

          <div className="media-section">
            <label>Media:</label>
            <button 
              className="btn btn-secondary"
              onClick={openMediaLibrary}
            >
              Add Media from Library
            </button>
            {selectedMedia.length > 0 && (
              <div className="selected-media">
                <h4>Selected Media ({selectedMedia.length}/{currentPlatform?.mediaLimit || 1}):</h4>
                <div className="media-grid">
                  {selectedMedia.map((media, index) => (
                    <div key={index} className="media-item">
                      <span>{media}</span>
                      <button onClick={() => removeSelectedMedia(media)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="preview-panel">
          <div className="platform-preview">
            <h3>{selectedPlatform} Preview</h3>
            <div className={`social-post-preview ${selectedPlatform.toLowerCase()}`}>
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
                {selectedMedia.length > 0 && (
                  <div className="post-media">
                    {selectedMedia.map((media, index) => (
                      <div key={index} className="media-preview">
                        <div className="media-thumbnail">
                          <span className="media-icon">📷</span>
                          <span className="media-name">{media}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

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

          <div className="drafts-section">
            <h3>Drafts</h3>
            <div className="drafts-list">
              {drafts.length === 0 ? (
                <p className="no-drafts">No drafts yet. Create your first post!</p>
              ) : (
                drafts.map(draft => (
                  <div key={draft.id} className={`draft-item ${currentDraftId === draft.id ? 'active' : ''}`}>
                    <div className="draft-header">
                      <span className="draft-platform">{draft.platform}</span>
                      <span className="draft-type">{draft.contentType}</span>
                    </div>
                    <div className="draft-content">
                      {draft.content.substring(0, 100)}...
                    </div>
                    <div className="draft-actions">
                      <button onClick={() => loadDraft(draft)}>Load</button>
                      <button onClick={() => deleteDraft(draft.id)}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Select Media</h3>
              <button onClick={() => setShowMediaLibrary(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="media-library-grid">
                {mediaFiles.length === 0 ? (
                  <p>No media files found. Upload some files in the Media Library first.</p>
                ) : (
                  mediaFiles.map(file => (
                    <div 
                      key={file.id} 
                      className={`media-file-item ${selectedMediaFiles.find(f => f.id === file.id) ? 'selected' : ''}`}
                      onClick={() => selectMediaFile(file)}
                    >
                      <div className="media-file-preview">
                        {file.filetype.startsWith('image/') ? (
                          <img src={`file://${file.filepath}`} alt={file.originalName} />
                        ) : (
                          <div className="media-file-icon">
                            {file.filetype.startsWith('video/') ? '🎥' : '📄'}
                          </div>
                        )}
                      </div>
                      <div className="media-file-info">
                        <span className="media-file-name">{file.originalName}</span>
                        <span className="media-file-type">{file.filetype}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowMediaLibrary(false)}>Cancel</button>
              <button 
                onClick={confirmMediaSelection}
                disabled={selectedMediaFiles.length === 0}
                className="btn btn-primary"
              >
                Add Selected ({selectedMediaFiles.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Post Dialog */}
      {showScheduleDialog && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>📅 Schedule Post</h3>
              <button onClick={closeScheduleDialog}>×</button>
            </div>
            <div className="modal-body">
              <div className="schedule-form">
                <div className="form-group">
                  <label>Platform:</label>
                  <div className="platform-display">
                    <span className="platform-badge">{selectedPlatform}</span>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Date:</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="form-group">
                  <label>Time:</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>Content Preview:</label>
                  <div className="content-preview">
                    <p>{content.substring(0, 100)}...</p>
                    {selectedHashtags.length > 0 && (
                      <p className="hashtags-preview">
                        {selectedHashtags.join(' ')}
                      </p>
                    )}
                    {selectedCTA && (
                      <p className="cta-preview">{selectedCTA}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeScheduleDialog}>Cancel</button>
              <button 
                onClick={schedulePost}
                disabled={!scheduleDate || !scheduleTime || isPosting}
                className="btn btn-primary"
              >
                {isPosting ? 'Scheduling...' : 'Schedule Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentStudio;
