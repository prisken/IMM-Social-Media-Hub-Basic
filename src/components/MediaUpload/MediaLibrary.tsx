import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Grid, List, Trash2, Eye, Download, Edit, Tag, Calendar, X } from 'lucide-react'
import { useAuth } from '@/components/Auth/AuthProvider'
import { MediaService, createMediaService } from '@/services/media/MediaService'
import { MediaFile } from '@/types'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface MediaLibraryProps {
  onMediaSelect?: (mediaFile: MediaFile) => void
  selectedMedia?: MediaFile[]
  onMediaUpdate?: (mediaFiles: MediaFile[]) => void
  refreshTrigger?: number // Add this to trigger refresh
}

export function MediaLibrary({ onMediaSelect, selectedMedia = [], onMediaUpdate, refreshTrigger }: MediaLibraryProps) {
  const { currentOrganization } = useAuth()
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [previewMedia, setPreviewMedia] = useState<MediaFile | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; mediaFile: MediaFile } | null>(null)
  const [editingMedia, setEditingMedia] = useState<MediaFile | null>(null)
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map())
  
  const mediaService = React.useRef<MediaService | null>(null)

  // Initialize media service when organization changes
  useEffect(() => {
    if (currentOrganization) {
      mediaService.current = createMediaService(currentOrganization.id)
      loadMediaFiles()
    }
  }, [currentOrganization])

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined && currentOrganization) {
      loadMediaFiles()
    }
  }, [refreshTrigger, currentOrganization])

  // Load preview URL when a media item is opened in the preview modal
  useEffect(() => {
    const loadPreview = async () => {
      if (!previewMedia) {
        setPreviewUrl('')
        return
      }
      if (previewMedia.mimeType.startsWith('image/')) {
        try {
          const url = await generatePreviewUrl(previewMedia)
          setPreviewUrl(url)
        } catch (e) {
          console.error('Failed generating preview URL:', e)
          setPreviewUrl('')
        }
      } else {
        setPreviewUrl('')
      }
    }
    loadPreview()
  }, [previewMedia])

  // Load image URLs when mediaFiles change
  useEffect(() => {
    const loadImageUrls = async () => {
      console.log(`Loading image URLs for ${mediaFiles.length} media files...`)
      const newImageUrls = new Map<string, string>()
      
      // Process images sequentially to avoid overwhelming the IPC
      for (const mediaFile of mediaFiles) {
        if (mediaFile.mimeType.startsWith('image/')) {
          try {
            console.log(`Loading URL for image: ${mediaFile.originalName}`)
            const url = await generatePreviewUrl(mediaFile)
            if (url) {
              newImageUrls.set(mediaFile.id, url)
              console.log(`Successfully loaded URL for: ${mediaFile.originalName}`)
            } else {
              console.warn(`No URL generated for: ${mediaFile.originalName}`)
            }
          } catch (error) {
            console.error(`Failed to load image URL for ${mediaFile.id}:`, error)
          }
        }
      }
      
      console.log(`Loaded ${newImageUrls.size} image URLs`)
      setImageUrls(newImageUrls)
    }

    if (mediaFiles.length > 0) {
      loadImageUrls()
    } else {
      setImageUrls(new Map())
    }
  }, [mediaFiles])

  const loadMediaFiles = async () => {
    if (!mediaService.current) return

    setLoading(true)
    try {
      console.log('Loading media files from database...')
      console.log('Current organization:', currentOrganization?.id)
      const files = await mediaService.current.getAllMediaFiles()
      console.log('Loaded media files:', files)
      console.log('Number of files loaded:', files.length)
      setMediaFiles(files)
    } catch (error) {
      console.error('Failed to load media files:', error)
      console.error('Error details:', error)
      setMediaFiles([])
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedMedia = React.useMemo(() => {
    let filtered = mediaFiles.filter(media => {
      // Search filter
      if (searchTerm && !media.originalName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Type filter
      if (filterType !== 'all') {
        if (filterType === 'image' && !media.mimeType.startsWith('image/')) return false
        if (filterType === 'video' && !media.mimeType.startsWith('video/')) return false
        if (filterType === 'audio' && !media.mimeType.startsWith('audio/')) return false
      }

      return true
    })

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.originalName.localeCompare(b.originalName)
          break
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'size':
          comparison = a.size - b.size
          break
        case 'type':
          comparison = a.mimeType.localeCompare(b.mimeType)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [mediaFiles, searchTerm, filterType, sortBy, sortOrder])

  const handleDeleteMedia = async (mediaFile: MediaFile) => {
    if (!mediaService.current) return

    try {
      await mediaService.current.deleteFile(mediaFile)
      setMediaFiles(prev => prev.filter(m => m.id !== mediaFile.id))
      
      if (onMediaUpdate) {
        onMediaUpdate(mediaFiles.filter(m => m.id !== mediaFile.id))
      }
    } catch (error) {
      console.error('Failed to delete media:', error)
    }
  }

  const handleUpdateMetadata = async (mediaFile: MediaFile, metadata: Partial<MediaFile['metadata']>) => {
    if (!mediaService.current) return

    try {
      const updatedFile = await mediaService.current.updateMetadata(mediaFile, metadata)
      setMediaFiles(prev => prev.map(m => m.id === mediaFile.id ? updatedFile : m))
    } catch (error) {
      console.error('Failed to update metadata:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️'
    if (mimeType.startsWith('video/')) return '🎥'
    if (mimeType.startsWith('audio/')) return '🎵'
    return '📄'
  }

  const generatePreviewUrl = async (mediaFile: MediaFile): Promise<string> => {
    // Use Electron's IPC to serve media files securely
    if (mediaFile.mimeType.startsWith('image/')) {
      try {
        return await window.electronAPI.fs.serveMediaFile(mediaFile.path)
      } catch (error) {
        console.error('Failed to serve media file:', error)
        return ''
      }
    }
    return ''
  }

  const handleRevealInFolder = async (mediaFile: MediaFile) => {
    try {
      const result = await window.electronAPI.revealInFolder(mediaFile.path)
      if (!result.success) {
        console.error('Failed to reveal file in folder:', result.error)
        alert(`Failed to reveal file in folder: ${result.error}`)
      }
    } catch (error) {
      console.error('Error revealing file in folder:', error)
      alert('Error revealing file in folder')
    }
    setContextMenu(null)
  }

  const handleContextMenu = (e: React.MouseEvent, mediaFile: MediaFile) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      mediaFile
    })
  }

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
        <p className="text-muted-foreground mt-4 ml-4">Loading media library...</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Media Library</h2>
            <p className="text-sm text-muted-foreground">
              {filteredAndSortedMedia.length} of {mediaFiles.length} files
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search media files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-')
              setSortBy(newSortBy as any)
              setSortOrder(newSortOrder as any)
            }}
            className="px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="size-desc">Largest First</option>
            <option value="size-asc">Smallest First</option>
            <option value="type-asc">Type A-Z</option>
          </select>
        </div>
      </div>

      {/* Media Grid/List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredAndSortedMedia.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-4">📁</div>
              <p className="text-lg font-medium">No media files found</p>
              <p className="text-sm">Upload some files to get started</p>
            </div>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4' 
            : 'space-y-2'
          }>
            {filteredAndSortedMedia.map((mediaFile, index) => {
              const isSelected = selectedMedia.some(m => m.id === mediaFile.id)
              const isImage = mediaFile.mimeType.startsWith('image/')
              
              return (
                <motion.div
                  key={mediaFile.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`group relative bg-card border rounded-lg overflow-hidden hover:shadow-md transition-all cursor-pointer ${
                    isSelected ? 'ring-2 ring-primary border-primary' : 'border-border'
                  } ${viewMode === 'list' ? 'flex items-center p-3' : ''}`}
                  onClick={() => onMediaSelect?.(mediaFile)}
                  onContextMenu={(e) => handleContextMenu(e, mediaFile)}
                >
                  {viewMode === 'grid' ? (
                    <>
                      {/* Grid View */}
                      <div className="aspect-video bg-muted/50 relative">
                        {isImage ? (
                          imageUrls.has(mediaFile.id) ? (
                            <img
                              src={imageUrls.get(mediaFile.id)}
                              alt={mediaFile.metadata.alt || mediaFile.originalName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Image failed to load:', imageUrls.get(mediaFile.id))
                                console.error('Media file path:', mediaFile.path)
                                e.currentTarget.style.display = 'none'
                              }}
                              onLoad={() => {
                                console.log('Image loaded successfully:', imageUrls.get(mediaFile.id))
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                          )
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-2xl">{getFileIcon(mediaFile.mimeType)}</span>
                          </div>
                        )}
                        
                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setPreviewMedia(mediaFile)
                            }}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingMedia(mediaFile)
                            }}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteMedia(mediaFile)
                            }}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>

                      <div className="p-2">
                        <p className="text-xs font-medium text-foreground truncate">
                          {mediaFile.originalName}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                          <span>{formatFileSize(mediaFile.size)}</span>
                          <span>{mediaFile.mimeType.split('/')[1].toUpperCase()}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* List View */}
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-muted/50 rounded flex items-center justify-center">
                          {isImage ? (
                            imageUrls.has(mediaFile.id) ? (
                              <img
                                src={imageUrls.get(mediaFile.id)}
                                alt={mediaFile.metadata.alt || mediaFile.originalName}
                                className="w-full h-full object-cover rounded"
                                onError={(e) => {
                                  console.error('List view image failed to load:', imageUrls.get(mediaFile.id))
                                  console.error('Media file path:', mediaFile.path)
                                  e.currentTarget.style.display = 'none'
                                }}
                                onLoad={() => {
                                  console.log('List view image loaded successfully:', imageUrls.get(mediaFile.id))
                                }}
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                              </div>
                            )
                          ) : (
                            <span className="text-lg">{getFileIcon(mediaFile.mimeType)}</span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {mediaFile.originalName}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{formatFileSize(mediaFile.size)}</span>
                            <span>{mediaFile.mimeType.split('/')[1].toUpperCase()}</span>
                            <span>{new Date(mediaFile.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setPreviewMedia(mediaFile)
                          }}
                          className="p-2 hover:bg-muted rounded transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingMedia(mediaFile)
                          }}
                          className="p-2 hover:bg-muted rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteMedia(mediaFile)
                          }}
                          className="p-2 hover:bg-muted rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewMedia(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-lg max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  {previewMedia.originalName}
                </h3>
                <button
                  onClick={() => setPreviewMedia(null)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              
              <div className="p-4">
                {previewMedia.mimeType.startsWith('image/') ? (
                  <img
                    src={previewUrl}
                    alt={previewMedia.metadata.alt || previewMedia.originalName}
                    className="max-w-full max-h-[60vh] object-contain mx-auto"
                  />
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <span className="text-6xl">{getFileIcon(previewMedia.mimeType)}</span>
                    <span className="ml-4 text-muted-foreground">
                      Preview not available for {previewMedia.mimeType.split('/')[1]}
                    </span>
                  </div>
                )}
                
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span>{formatFileSize(previewMedia.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span>{previewMedia.mimeType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uploaded:</span>
                    <span>{new Date(previewMedia.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Path:</span>
                    <span className="text-xs break-all max-w-xs">{previewMedia.path}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleRevealInFolder(previewMedia)}
                    className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
                  >
                    Reveal in Finder
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bg-card border border-border rounded-md shadow-lg z-50 py-1"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => handleRevealInFolder(contextMenu.mediaFile)}
              className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors"
            >
              Reveal in Finder
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
