import React, { useEffect, useState, useRef, useCallback } from 'react';
import './MediaLibrary.css';

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  filepath: string;
  filetype: string;
  filesize: number;
  dimensions?: string;
  duration?: number;
  uploadDate: string;
  tags: string[];
  category: string;
  usedCount: number;
  metadata: any;
}

function MediaLibrary() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isGeneratingVariants, setIsGeneratingVariants] = useState(false);
  const [variants, setVariants] = useState<Record<string, any> | null>(null);
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);

  // Variant options for different file types
  const variantOptions = {
    images: [
      { id: 'social_media', name: 'Social Media', description: 'Instagram, Facebook, Twitter optimized' },
      { id: 'print', name: 'Print', description: 'High resolution for printing' },
      { id: 'web', name: 'Web', description: 'Optimized for websites' },
      { id: 'formats', name: 'Multiple Formats', description: 'JPG, PNG, WebP, AVIF' }
    ],
    videos: [
      { id: 'social_media', name: 'Social Media', description: 'Instagram, TikTok, YouTube optimized' },
      { id: 'web', name: 'Web', description: 'Optimized for web streaming' },
      { id: 'formats', name: 'Multiple Formats', description: 'MP4, WebM' }
    ],
    audio: [
      { id: 'podcast', name: 'Podcast', description: 'High quality for podcasting' },
      { id: 'web', name: 'Web', description: 'Optimized for web streaming' },
      { id: 'formats', name: 'Multiple Formats', description: 'MP3, AAC, OGG' }
    ]
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Function to refresh the file list
  const refreshFiles = async () => {
    try {
      console.log('🔄 Refreshing file list...');
      const updatedFiles = await window.electronAPI.media.getFiles();
      console.log('📋 Updated files:', updatedFiles);
      setFiles(updatedFiles);
    } catch (error) {
      console.error('❌ Error refreshing files:', error);
    }
  };

  useEffect(() => {
    refreshFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const mediaFiles = await window.electronAPI.media.getFiles();
      setFiles(mediaFiles);
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  const handleFileUpload = async (filePaths?: string[]) => {
    try {
      console.log('🚀 Starting file upload...', { filePaths });
      setIsUploading(true);
      
      let pathsToUpload: string[] = [];
      
      if (filePaths) {
        pathsToUpload = filePaths;
        console.log('📁 Using provided file paths:', pathsToUpload);
      } else {
        console.log('📂 Opening file dialog...');
        const result = await window.electronAPI.dialog.openFile();
        console.log('📂 File dialog result:', result);
        if (result) {
          // Handle both single file and multiple files
          pathsToUpload = Array.isArray(result) ? result : [result];
          console.log('📁 Dialog file paths:', pathsToUpload);
        }
      }
      
      if (pathsToUpload.length > 0) {
        const uploadedFiles: MediaFile[] = [];
        
        for (const filePath of pathsToUpload) {
          try {
            console.log('📤 Uploading file:', filePath);
            if (filePath && typeof filePath === 'string') {
              const uploadResult = await window.electronAPI.media.upload(filePath);
              console.log('📤 Upload result:', uploadResult);
              
              if (uploadResult.success && uploadResult.file) {
                console.log('✅ File uploaded successfully:', uploadResult.file);
                uploadedFiles.push(uploadResult.file);
              } else {
                console.error('❌ Upload failed:', uploadResult.error);
              }
            }
          } catch (error) {
            console.error(`❌ Failed to upload ${filePath}:`, error);
          }
        }
        
        if (uploadedFiles.length > 0) {
          console.log('📋 Adding uploaded files to state:', uploadedFiles);
          setFiles(prev => [...uploadedFiles, ...prev]);
          console.log('✅ Upload process completed - files added to state');
          
          // Refresh the file list to ensure UI is up to date
          await refreshFiles();
        } else {
          console.log('⚠️ No files were successfully uploaded');
        }
      } else {
        console.log('⚠️ No files to upload');
      }
    } catch (error) {
      console.error('❌ Failed to upload files:', error);
    } finally {
      setIsUploading(false);
      console.log('🏁 Upload process finished');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await window.electronAPI.media.deleteFile(fileId);
      setFiles(prev => prev.filter(file => file.id !== fileId));
      if (selectedFile?.id === fileId) {
        setSelectedFile(null);
      }
      
      // Refresh the file list to ensure UI is up to date
      await refreshFiles();
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const handleGenerateVariants = async () => {
    if (!selectedFile) return;
    
    if (selectedVariants.length === 0) {
      alert('Please select at least one variant type to generate.');
      return;
    }

    setIsGeneratingVariants(true);
    try {
      const result = await window.electronAPI.media.generateVariants(selectedFile.id, selectedVariants);
      if (result.success) {
        setVariants(result.variants);
        setShowVariantSelector(false);
        setSelectedVariants([]);
      } else {
        console.error('Failed to generate variants:', result.error);
        alert('Failed to generate variants: ' + result.error);
      }
    } catch (error) {
      console.error('Error generating variants:', error);
      alert('Error generating variants');
    } finally {
      setIsGeneratingVariants(false);
    }
  };

  const openVariantsFolder = async () => {
    try {
      await window.electronAPI.filePath.openFolder('app/media/variants');
    } catch (error) {
      console.error('Error opening variants folder:', error);
      alert('Error opening variants folder. You can find them at: app/media/variants/');
    }
  };

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    console.log('🎯 File dropped!', { 
      filesCount: e.dataTransfer.files?.length,
      files: Array.from(e.dataTransfer.files || []).map(f => ({ name: f.name, path: (f as any).path }))
    });
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      try {
        const filePaths: string[] = [];
        
        for (const file of Array.from(e.dataTransfer.files)) {
          const fileWithPath = file as any;
          
          // Method 1: Try direct path property
          if (fileWithPath.path) {
            console.log('✅ Found file path (direct):', fileWithPath.path);
            filePaths.push(fileWithPath.path);
            continue;
          }
          
          // Method 2: Try to resolve path using main process
          if (file.name) {
            console.log('🔍 Resolving path for file:', file.name);
            try {
              const resolvedPath = await window.electronAPI.filePath.resolve(file.name);
              if (resolvedPath) {
                console.log('✅ Found file path (resolved):', resolvedPath);
                filePaths.push(resolvedPath);
              } else {
                console.warn('⚠️ Could not resolve path for file:', file.name);
              }
            } catch (error) {
              console.error('❌ Error resolving file path:', error);
            }
          }
        }
        
        console.log('📁 Extracted file paths:', filePaths);
        
        if (filePaths.length > 0) {
          console.log('🚀 Starting upload for dropped files...');
          await handleFileUpload(filePaths);
        } else {
          console.error('❌ No valid file paths found in dropped files');
          // Fallback: Ask user to use file dialog for files from other locations
          const useFileDialog = window.confirm(
            'Some files could not be accessed directly (they may be on external drives or network locations).\n\n' +
            'Would you like to use the file browser to select these files instead?\n\n' +
            'This ensures all files can be uploaded regardless of their location.'
          );
          if (useFileDialog) {
            console.log('🔄 Falling back to file dialog...');
            await handleFileUpload(); // This will open the file dialog
          }
        }
      } catch (error) {
        console.error('❌ Error processing dropped files:', error);
      }
    } else {
      console.log('⚠️ No files in drop event');
    }
  }, []);

  const handleFileSelect = (file: MediaFile) => {
    setSelectedFile(file);
  };

  const filteredFiles = files.filter(file => {
    if (!file || !file.originalName) return false;
    
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    const matchesSearch = !searchTerm || 
                         file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (file.tags && Array.isArray(file.tags) && file.tags.some(tag => tag && typeof tag === 'string' && tag.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const categories = ['all', 'images', 'videos', 'documents', 'audio'];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filetype: string) => {
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(filetype)) return '🖼️';
    if (['.mp4', '.mov', '.avi', '.mkv'].includes(filetype)) return '🎥';
    if (['.mp3', '.wav', '.m4a'].includes(filetype)) return '🎵';
    if (['.pdf', '.doc', '.docx', '.txt'].includes(filetype)) return '📄';
    return '📁';
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="media-library">
      <div className="media-header">
        <h2>Media Library</h2>
        <div className="header-controls">
          <div className="view-toggle">
            <button 
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              📱
            </button>
            <button 
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              📋
            </button>
          </div>
          <button 
            className="upload-button"
            onClick={async () => {
              try {
                console.log('📂 Opening file dialog...');
                await handleFileUpload();
              } catch (error) {
                console.error('❌ Error opening file dialog:', error);
              }
            }}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={async (e) => {
          if (e.target.files) {
            const filePaths: string[] = [];
            
            for (const file of Array.from(e.target.files)) {
              const fileWithPath = file as any;
              
              // Method 1: Try direct path property
              if (fileWithPath.path) {
                console.log('✅ Found file path (direct):', fileWithPath.path);
                filePaths.push(fileWithPath.path);
                continue;
              }
              
              // Method 2: Try to resolve path using main process
              if (file.name) {
                console.log('🔍 Resolving path for file:', file.name);
                try {
                  const resolvedPath = await window.electronAPI.filePath.resolve(file.name);
                  if (resolvedPath) {
                    console.log('✅ Found file path (resolved):', resolvedPath);
                    filePaths.push(resolvedPath);
                  } else {
                    console.warn('⚠️ Could not resolve path for file:', file.name);
                  }
                } catch (error) {
                  console.error('❌ Error resolving file path:', error);
                }
              }
            }
            
            if (filePaths.length > 0) {
              console.log('📁 File input file paths:', filePaths);
              await handleFileUpload(filePaths);
            } else {
              console.error('❌ No valid file paths found in file input');
            }
          }
        }}
      />

      {/* Upload Area */}
      <div 
        ref={dropZoneRef}
        className={`upload-area ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="upload-zone">
          <div className="upload-icons">🖼️ 📹 📄 🎵</div>
          <p>Drag & Drop Files Here</p>
          <p>or Click to Browse</p>
          <p className="upload-info">
            Supported: JPG, PNG, MP4, MOV, PDF, MP3, and more
            <br />
            Max Size: 100MB per file
          </p>
          <button onClick={async () => {
            try {
              console.log('📂 Opening file dialog from browse button...');
              await handleFileUpload();
            } catch (error) {
              console.error('❌ Error opening file dialog:', error);
            }
          }} disabled={isUploading}>
            Browse Files
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="media-filters">
        <div className="category-filter">
          <label>Category:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="search-filter">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search files or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="file-count">
          {filteredFiles.length} of {files.length} files
        </div>
      </div>

      {/* Media Gallery */}
      <div className="media-content">
        <div className={`media-gallery ${viewMode}`}>
          {filteredFiles.length === 0 ? (
            <div className="empty-state">
              <p>No files found. Upload some files to get started!</p>
            </div>
          ) : (
            <div className={`gallery-${viewMode}`}>
              {filteredFiles.map(file => (
                <div 
                  key={file.id} 
                  className={`media-item ${selectedFile?.id === file.id ? 'selected' : ''}`}
                  onClick={() => handleFileSelect(file)}
                >
                  <div className="media-preview">
                    {file.metadata?.thumbnailPath ? (
                      <img 
                        src={`file://${file.metadata.thumbnailPath}`} 
                        alt={file.originalName}
                        className="thumbnail"
                      />
                    ) : (
                      <span className="file-icon">{getFileIcon(file.filetype)}</span>
                    )}
                    <div className="media-overlay">
                      <button 
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(file.id);
                        }}
                        title="Delete file"
                      >
                        🗑️
                      </button>
                      {file.category === 'videos' && file.duration && (
                        <span className="duration">{formatDuration(file.duration)}</span>
                      )}
                    </div>
                  </div>
                  <div className="media-info">
                    <h4 className="file-name">{file.originalName}</h4>
                    <p className="file-size">{formatFileSize(file.filesize)}</p>
                    {file.dimensions && <p className="file-dimensions">{file.dimensions}</p>}
                    <p className="file-date">
                      {new Date(file.uploadDate).toLocaleDateString()}
                    </p>
                    <div className="file-tags">
                      {file.tags && Array.isArray(file.tags) && file.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="tag">#{tag}</span>
                      ))}
                      {file.tags && Array.isArray(file.tags) && file.tags.length > 3 && (
                        <span className="tag-more">+{file.tags.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* File Details Panel */}
        {selectedFile && (
          <div className="file-details-panel">
            <div className="details-header">
              <h3>File Details</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedFile(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="details-content">
              <div className="file-preview-large">
                {selectedFile.metadata?.thumbnailPath ? (
                  <img 
                    src={`file://${selectedFile.metadata.thumbnailPath}`} 
                    alt={selectedFile.originalName}
                  />
                ) : (
                  <span className="file-icon-large">{getFileIcon(selectedFile.filetype)}</span>
                )}
              </div>
              
              <div className="file-details">
                <h4>{selectedFile.originalName}</h4>
                <p><strong>Size:</strong> {formatFileSize(selectedFile.filesize)}</p>
                <p><strong>Type:</strong> {selectedFile.filetype}</p>
                <p><strong>Category:</strong> {selectedFile.category}</p>
                {selectedFile.dimensions && (
                  <p><strong>Dimensions:</strong> {selectedFile.dimensions}</p>
                )}
                {selectedFile.duration && (
                  <p><strong>Duration:</strong> {formatDuration(selectedFile.duration)}</p>
                )}
                <p><strong>Uploaded:</strong> {new Date(selectedFile.uploadDate).toLocaleString()}</p>
                <p><strong>Used:</strong> {selectedFile.usedCount} times</p>
                
                <div className="tags-section">
                  <h5>Tags:</h5>
                  <div className="tags-list">
                    {selectedFile.tags && Array.isArray(selectedFile.tags) && selectedFile.tags.map(tag => (
                      <span key={tag} className="tag">#{tag}</span>
                    ))}
                  </div>
                </div>
                
                {selectedFile.metadata && Object.keys(selectedFile.metadata).length > 0 && (
                  <div className="metadata-section">
                    <h5>Metadata:</h5>
                    <pre className="metadata-json">
                      {JSON.stringify(selectedFile.metadata, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Variants Section */}
                <div className="variants-section">
                  <h5>Variants:</h5>
                  <div className="variants-controls">
                    <button 
                      className="generate-variants-btn"
                      onClick={() => setShowVariantSelector(true)}
                      disabled={isGeneratingVariants}
                    >
                      {isGeneratingVariants ? 'Generating...' : 'Generate Variants'}
                    </button>
                    
                    {variants && (
                      <div className="variants-list">
                        <h6>Generated Variants:</h6>
                        <p className="variants-info">
                          <strong>Location:</strong> app/media/variants/
                        </p>
                        
                        {Object.entries(variants).map(([category, categoryVariants]) => (
                          <div key={category} className="variant-category">
                            <h6>{category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}:</h6>
                            <div className="variant-grid">
                              {categoryVariants && typeof categoryVariants === 'object' && 
                                Object.entries(categoryVariants as Record<string, any>).map(([variantName, variantPath]) => (
                                  <div key={variantName} className="variant-item">
                                    <span className="variant-name">{variantName}</span>
                                    <span className="variant-status">
                                      {variantPath ? '✅ Generated' : '❌ Failed'}
                                    </span>
                                  </div>
                                ))
                              }
                            </div>
                          </div>
                        ))}
                        
                        <button 
                          className="open-variants-btn"
                          onClick={openVariantsFolder}
                        >
                          📁 Open Variants Folder
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Variant Selector Modal */}
                  {showVariantSelector && (
                    <div className="variant-selector-modal">
                      <div className="variant-selector-content">
                        <h3>Select Variants to Generate</h3>
                        <p>Choose which variants you want to generate for this file:</p>
                        
                        {(() => {
                          const ext = selectedFile.filename.split('.').pop()?.toLowerCase();
                          let options: Array<{id: string, name: string, description: string}> = [];
                          
                          if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext || '')) {
                            options = variantOptions.images;
                          } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(ext || '')) {
                            options = variantOptions.videos;
                          } else if (['mp3', 'wav', 'aac', 'ogg', 'flac'].includes(ext || '')) {
                            options = variantOptions.audio;
                          }
                          
                          return (
                            <div className="variant-options">
                              {options.map((option) => (
                                <label key={option.id} className="variant-option">
                                  <input
                                    type="checkbox"
                                    checked={selectedVariants.includes(option.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedVariants([...selectedVariants, option.id]);
                                      } else {
                                        setSelectedVariants(selectedVariants.filter(id => id !== option.id));
                                      }
                                    }}
                                  />
                                  <div className="variant-option-content">
                                    <strong>{option.name}</strong>
                                    <span>{option.description}</span>
                                  </div>
                                </label>
                              ))}
                            </div>
                          );
                        })()}
                        
                        <div className="variant-selector-actions">
                          <button 
                            onClick={() => {
                              setShowVariantSelector(false);
                              setSelectedVariants([]);
                            }}
                            className="cancel-btn"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={handleGenerateVariants}
                            disabled={selectedVariants.length === 0 || isGeneratingVariants}
                            className="generate-btn"
                          >
                            {isGeneratingVariants ? 'Generating...' : 'Generate Selected Variants'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MediaLibrary; 