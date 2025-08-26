import React, { useState, useEffect } from 'react';
import './BrandVoiceTraining.css';

interface TrainingPost {
  id: string;
  content: string;
  platform: string;
  date: string;
  feedback?: 'positive' | 'negative' | null;
}

interface BrandVoiceProfile {
  id: string;
  name: string;
  tone: string;
  style: string;
  vocabulary: string[];
  emojiUsage: string;
  callToAction: string;
  confidence: number;
  examples: string[];
  createdAt: string;
  updatedAt: string;
}

interface GeneratedSample {
  id: string;
  content: string;
  platform: string;
  feedback?: 'positive' | 'negative' | null;
}

function BrandVoiceTraining() {
  const [trainingPosts, setTrainingPosts] = useState<TrainingPost[]>([]);
  const [brandVoiceProfiles, setBrandVoiceProfiles] = useState<BrandVoiceProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [generatedSamples, setGeneratedSamples] = useState<GeneratedSample[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostPlatform, setNewPostPlatform] = useState('facebook');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('llama3:8b');
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'chinese' | 'bilingual'>('english');

  useEffect(() => {
    loadBrandVoiceProfiles();
    loadAvailableModels();
  }, []);

  const loadBrandVoiceProfiles = async () => {
    try {
      const profiles = await window.electronAPI.brandVoice.getProfiles();
      setBrandVoiceProfiles(profiles);
      if (profiles.length > 0) {
        setSelectedProfile(profiles[0].id);
      }
    } catch (error) {
      console.error('Failed to load brand voice profiles:', error);
    }
  };

  const loadAvailableModels = async () => {
    try {
      const models = await window.electronAPI.ollama.getModels();
      setAvailableModels(models.map((m: any) => m.name));
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const addTrainingPost = () => {
    if (!newPostContent.trim()) return;

    const newPost: TrainingPost = {
      id: Date.now().toString(),
      content: newPostContent.trim(),
      platform: newPostPlatform,
      date: new Date().toISOString(),
    };

    setTrainingPosts([...trainingPosts, newPost]);
    setNewPostContent('');
  };

  const removeTrainingPost = (id: string) => {
    setTrainingPosts(trainingPosts.filter(post => post.id !== id));
  };

  const updatePostFeedback = (id: string, feedback: 'positive' | 'negative') => {
    setTrainingPosts(trainingPosts.map(post => 
      post.id === id ? { ...post, feedback } : post
    ));
  };

  const analyzePosts = async () => {
    if (trainingPosts.length === 0) return;

    setIsAnalyzing(true);
    try {
      const content = trainingPosts.map(post => post.content);
      const analysis = await window.electronAPI.brandVoice.analyzeWithLanguage(content, selectedLanguage, selectedModel);
      setAnalysisResult(analysis);
    } catch (error) {
      console.error('Failed to analyze posts:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createBrandVoiceProfile = async () => {
    if (!analysisResult) return;

    const positivePosts = trainingPosts.filter(post => post.feedback === 'positive');
    const negativePosts = trainingPosts.filter(post => post.feedback === 'negative');

    try {
      const profile = await window.electronAPI.brandVoice.trainWithLanguage(
        trainingPosts.map(post => post.content),
        {
          positive: positivePosts.map(post => post.content),
          negative: negativePosts.map(post => post.content)
        },
        selectedLanguage,
        selectedModel
      );

      await loadBrandVoiceProfiles();
      setAnalysisResult(null);
    } catch (error) {
      console.error('Failed to create brand voice profile:', error);
    }
  };

  const generateSamples = async () => {
    if (!selectedProfile) return;

    setIsGenerating(true);
    try {
      const profile = brandVoiceProfiles.find(p => p.id === selectedProfile);
      if (!profile) return;

      const platforms = ['facebook', 'instagram', 'linkedin'];
      const contentTypes = ['post', 'caption', 'story'];

      const samples: GeneratedSample[] = [];

      for (const platform of platforms) {
        for (const contentType of contentTypes) {
          const sample = await window.electronAPI.brandVoice.generateSamplesWithLanguage(
            profile,
            platform,
            contentType,
            selectedLanguage,
            selectedModel
          );
          
          samples.push({
            id: Date.now().toString() + Math.random(),
            content: sample,
            platform,
          });
        }
      }

      setGeneratedSamples(samples);
    } catch (error) {
      console.error('Failed to generate samples:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateSampleFeedback = (id: string, feedback: 'positive' | 'negative') => {
    setGeneratedSamples(samples => 
      samples.map(sample => 
        sample.id === id ? { ...sample, feedback } : sample
      )
    );
  };

  const regenerateSample = async (id: string) => {
    const sample = generatedSamples.find(s => s.id === id);
    if (!sample || !selectedProfile) return;

    try {
      const profile = brandVoiceProfiles.find(p => p.id === selectedProfile);
      if (!profile) return;

      const newContent = await window.electronAPI.brandVoice.generateSamplesWithLanguage(
        profile,
        sample.platform,
        'post',
        selectedLanguage,
        selectedModel
      );

      setGeneratedSamples(samples => 
        samples.map(s => 
          s.id === id ? { ...s, content: newContent, feedback: undefined } : s
        )
      );
    } catch (error) {
      console.error('Failed to regenerate sample:', error);
    }
  };

  return (
    <div className="brand-voice-training">
      <div className="training-header">
        <h1>Brand Voice Training</h1>
        <p>Upload your existing posts to train AI on your writing style</p>
      </div>

      <div className="training-sections">
        {/* Training Data Input */}
        <section className="training-section">
          <h2>📝 Add Training Posts</h2>
          <div className="post-input">
            <div className="input-group">
              <div className="input-row">
                <select 
                  value={newPostPlatform}
                  onChange={(e) => setNewPostPlatform(e.target.value)}
                >
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">Twitter</option>
                </select>
                <select 
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as 'english' | 'chinese' | 'bilingual')}
                >
                  <option value="english">English</option>
                  <option value="chinese">中文</option>
                  <option value="bilingual">English + 中文</option>
                </select>
              </div>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Paste your existing post content here..."
                rows={4}
              />
              <button onClick={addTrainingPost} disabled={!newPostContent.trim()}>
                ➕ Add Post
              </button>
            </div>
          </div>

          <div className="training-posts">
            <h3>Training Posts ({trainingPosts.length})</h3>
            {trainingPosts.length === 0 ? (
              <p className="empty-state">No training posts added yet. Add some posts to get started!</p>
            ) : (
              <div className="posts-list">
                {trainingPosts.map(post => (
                  <div key={post.id} className="training-post">
                    <div className="post-header">
                      <span className="platform-badge">{post.platform}</span>
                      <button 
                        className="remove-button"
                        onClick={() => removeTrainingPost(post.id)}
                      >
                        ❌
                      </button>
                    </div>
                    <div className="post-content">{post.content}</div>
                    <div className="post-feedback">
                      <button 
                        className={`feedback-btn ${post.feedback === 'positive' ? 'positive' : ''}`}
                        onClick={() => updatePostFeedback(post.id, 'positive')}
                      >
                        👍 Sounds Like Me
                      </button>
                      <button 
                        className={`feedback-btn ${post.feedback === 'negative' ? 'negative' : ''}`}
                        onClick={() => updatePostFeedback(post.id, 'negative')}
                      >
                        👎 Not My Style
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {trainingPosts.length > 0 && (
            <div className="analysis-actions">
              <button 
                className="analyze-button"
                onClick={analyzePosts}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? '🔍 Analyzing...' : '🔍 Analyze Posts'}
              </button>
            </div>
          )}
        </section>

        {/* Analysis Results */}
        {analysisResult && (
          <section className="training-section">
            <h2>📊 Analysis Results</h2>
            <div className="analysis-results">
              <div className="analysis-grid">
                <div className="analysis-item">
                  <label>Tone:</label>
                  <span>{analysisResult.tone}</span>
                </div>
                <div className="analysis-item">
                  <label>Style:</label>
                  <span>{analysisResult.style}</span>
                </div>
                <div className="analysis-item">
                  <label>Emoji Usage:</label>
                  <span>{analysisResult.emojiUsage}</span>
                </div>
                <div className="analysis-item">
                  <label>Call to Action:</label>
                  <span>{analysisResult.callToAction}</span>
                </div>
                <div className="analysis-item full-width">
                  <label>Vocabulary:</label>
                  <div className="vocabulary-tags">
                    {analysisResult.vocabulary?.map((word: string, index: number) => (
                      <span key={index} className="vocabulary-tag">{word}</span>
                    ))}
                  </div>
                </div>
                <div className="analysis-item full-width">
                  <label>Confidence Score:</label>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill" 
                      style={{ width: `${analysisResult.confidence * 100}%` }}
                    ></div>
                    <span>{Math.round(analysisResult.confidence * 100)}%</span>
                  </div>
                </div>
              </div>
              
              <button 
                className="create-profile-button"
                onClick={createBrandVoiceProfile}
              >
                💾 Create Brand Voice Profile
              </button>
            </div>
          </section>
        )}

        {/* Brand Voice Profiles */}
        {brandVoiceProfiles.length > 0 && (
          <section className="training-section">
            <h2>🎨 Brand Voice Profiles</h2>
            <div className="profiles-list">
              {brandVoiceProfiles.map(profile => (
                <div key={profile.id} className="profile-card">
                  <div className="profile-header">
                    <h3>{profile.name}</h3>
                    <span className="confidence-badge">
                      {Math.round(profile.confidence * 100)}% confidence
                    </span>
                  </div>
                  <div className="profile-details">
                    <p><strong>Tone:</strong> {profile.tone}</p>
                    <p><strong>Style:</strong> {profile.style}</p>
                    <p><strong>Emoji Usage:</strong> {profile.emojiUsage}</p>
                  </div>
                  <div className="profile-actions">
                    <button 
                      className="select-profile-button"
                      onClick={() => setSelectedProfile(profile.id)}
                    >
                      {selectedProfile === profile.id ? '✅ Selected' : 'Select'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Voice Test Playground */}
        {selectedProfile && (
          <section className="training-section">
            <h2>🧪 Voice Test Playground</h2>
            <div className="playground-controls">
              <button 
                className="generate-samples-button"
                onClick={generateSamples}
                disabled={isGenerating}
              >
                {isGenerating ? '🎲 Generating...' : '🎲 Generate Sample Posts'}
              </button>
            </div>

            {generatedSamples.length > 0 && (
              <div className="generated-samples">
                <h3>Generated Samples</h3>
                <div className="samples-grid">
                  {generatedSamples.map(sample => (
                    <div key={sample.id} className="sample-card">
                      <div className="sample-header">
                        <span className="platform-badge">{sample.platform}</span>
                        <div className="sample-actions">
                          <button 
                            className={`feedback-btn ${sample.feedback === 'positive' ? 'positive' : ''}`}
                            onClick={() => updateSampleFeedback(sample.id, 'positive')}
                          >
                            👍
                          </button>
                          <button 
                            className={`feedback-btn ${sample.feedback === 'negative' ? 'negative' : ''}`}
                            onClick={() => updateSampleFeedback(sample.id, 'negative')}
                          >
                            👎
                          </button>
                          <button 
                            className="regenerate-btn"
                            onClick={() => regenerateSample(sample.id)}
                          >
                            🔄
                          </button>
                        </div>
                      </div>
                      <div className="sample-content">{sample.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default BrandVoiceTraining; 