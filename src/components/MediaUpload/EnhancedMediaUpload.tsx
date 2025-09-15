import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Image, Video, File, X, Check, AlertCircle, Trash2, Edit, Eye, Download } from 'lucide-react'
import { useAuth } from '@/components/Auth/AuthProvider'
import { MediaService, createMediaService } from '@/services/media/MediaService'
import { MediaFile } from '@/types'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface EnhancedMediaUploadProps {
  onMediaUploaded?: (mediaFiles: MediaFile[]) => void
  maxFiles?: number
  acceptedTypes?: string[]
  maxSize?: number // in MB
  showPreview?: boolean
  allowMultiple?: boolean
  existingMedia?: MediaFile[]
  onMediaUpdate?: (mediaFiles: MediaFile[]) => void
}

export function EnhancedMediaUpload({ 
  onMediaUploaded,
  maxFiles = 10, 
  acceptedTypes = ['image/*', 'video/*', 'audio/*'],
  maxSize = 50,
  showPreview = true,
  allowMultiple = true,
  existingMedia = [],
  onMediaUpdate
}: EnhancedMediaUploadProps) {
  const { currentOrganization } = useAuth()
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [errors, setErrors] = useState<string[]>([])
  const [selectedMedia, setSelectedMedia] = useState<MediaFile[]>(existingMedia)
  const [previewMedia, setPreviewMedia] = useState<MediaFile | null>(null)
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaService = useRef<MediaService | null>(null)

  // Initialize media service when organization changes
  React.useEffect(() => {
    if (currentOrganization) {
      mediaService.current = createMediaService(currentOrganization.id)
    }
  }, [currentOrganization])

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File ${file.name} is too large. Maximum size is ${maxSize}MB.`
    }

    // Check file type
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1))
      }
      return file.type === type
    })

    if (!isValidType) {
      return `File ${file.name} has an unsupported format.`
    }

    return null
  }

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    if (!mediaService.current) {
      setErrors(['Media service not initialized'])
      return
    }

    const fileArray = Array.from(files)
    const newErrors: string[] = []
    const validFiles: File[] = []

    // Validate files
    fileArray.forEach(file => {
      const error = validateFile(file)
      if (error) {
        newErrors.push(error)
      } else {
        validFiles.push(file)
      }
    })

    if (validFiles.length + selectedMedia.length > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} files allowed.`)
    }

    setErrors(newErrors)
    
    if (validFiles.length > 0) {
      await uploadFiles(validFiles)
    }
  }, [selectedMedia.length, maxFiles, maxSize, acceptedTypes])

  const uploadFiles = async (files: File[]) => {
    if (!mediaService.current) return

    setUploading(true)
    const newMediaFiles: MediaFile[] = []
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
        
        try {
          console.log(`Starting upload for ${file.name}...`)
          const mediaFile = await mediaService.current.uploadFile(file)
          console.log(`Successfully uploaded ${file.name}:`, mediaFile)
          newMediaFiles.push(mediaFile)
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error)
          setErrors(prev => [...prev, `Failed to upload ${file.name}`])
        }
      }

      const updatedMedia = [...selectedMedia, ...newMediaFiles]
      setSelectedMedia(updatedMedia)
      
      if (onMediaUploaded) {
        onMediaUploaded(newMediaFiles)
      }
      
      if (onMediaUpdate) {
        onMediaUpdate(updatedMedia)
      }

    } finally {
      setUploading(false)
      setUploadProgress({})
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const removeMedia = async (mediaFile: MediaFile) => {
    if (!mediaService.current) return

    try {
      await mediaService.current.deleteFile(mediaFile)
      const updatedMedia = selectedMedia.filter(m => m.id !== mediaFile.id)
      setSelectedMedia(updatedMedia)
      
      if (onMediaUpdate) {
        onMediaUpdate(updatedMedia)
      }
    } catch (error) {
      console.error('Failed to delete media:', error)
      setErrors(prev => [...prev, `Failed to delete ${mediaFile.originalName}`])
    }
  }

  const openPreview = (mediaFile: MediaFile) => {
    setPreviewMedia(mediaFile)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image
    if (mimeType.startsWith('video/')) return Video
    return File
  }

  const generatePreviewUrl = (mediaFile: MediaFile): string => {
    // For now, we'll use a placeholder. In a real app, this would generate proper URLs
    if (mediaFile.mimeType.startsWith('image/')) {
      return `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=`
    }
    return ''
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={allowMultiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <motion.div
          animate={{ scale: dragActive ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Drop files here or click to upload
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Supports images, videos, and audio files up to {maxSize}MB
          </p>
          <div className="text-xs text-muted-foreground">
            Maximum {maxFiles} files • {allowMultiple ? 'Multiple files allowed' : 'Single file only'}
          </div>
        </motion.div>
      </motion.div>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploading && Object.keys(uploadProgress).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            <h4 className="font-medium text-foreground">Uploading...</h4>
            {Object.entries(uploadProgress).map(([filename, progress]) => (
              <div key={filename} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground truncate">{filename}</span>
                  <span className="text-muted-foreground">{progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Errors */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {errors.map((error, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
                <button
                  onClick={() => setErrors(prev => prev.filter((_, i) => i !== index))}
                  className="ml-auto p-1 hover:bg-destructive/20 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Preview Grid */}
      {showPreview && selectedMedia.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">Uploaded Media ({selectedMedia.length})</h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMediaLibrary(!showMediaLibrary)}
                className="text-sm text-primary hover:text-primary/80"
              >
                {showMediaLibrary ? 'Hide Library' : 'Show Library'}
              </button>
            </div>
          </div>

          <div className={`grid gap-4 ${showMediaLibrary ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {selectedMedia.map((mediaFile, index) => {
              const IconComponent = getFileIcon(mediaFile.mimeType)
              const isImage = mediaFile.mimeType.startsWith('image/')
              
              return (
                <motion.div
                  key={mediaFile.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="group relative bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-all"
                >
                  {/* Media Preview */}
                  <div className="aspect-video bg-muted/50 relative">
                    {isImage ? (
                      <img
                        src={generatePreviewUrl(mediaFile)}
                        alt={mediaFile.metadata.alt || mediaFile.originalName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to icon if image fails to load
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <IconComponent className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => openPreview(mediaFile)}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => removeMedia(mediaFile)}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Media Info */}
                  <div className="p-3">
                    <p className="text-sm font-medium text-foreground truncate">
                      {mediaFile.originalName}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                      <span>{formatFileSize(mediaFile.size)}</span>
                      <span>{mediaFile.mimeType.split('/')[1].toUpperCase()}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Media Preview Modal */}
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
                    src={generatePreviewUrl(previewMedia)}
                    alt={previewMedia.metadata.alt || previewMedia.originalName}
                    className="max-w-full max-h-[60vh] object-contain mx-auto"
                  />
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <IconComponent className="w-16 h-16 text-muted-foreground" />
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
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
