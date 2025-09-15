import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FolderOpen, Plus, Search, Filter } from 'lucide-react'
import { EnhancedMediaUpload } from './EnhancedMediaUpload'
import { MediaLibrary } from './MediaLibrary'
import { MediaFile } from '@/types'

interface MediaManagementProps {
  onMediaSelect?: (mediaFiles: MediaFile[]) => void
  selectedMedia?: MediaFile[]
  allowMultiple?: boolean
  maxFiles?: number
}

export function MediaManagement({ 
  onMediaSelect, 
  selectedMedia = [], 
  allowMultiple = true,
  maxFiles = 10 
}: MediaManagementProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'library'>('upload')
  const [libraryMedia, setLibraryMedia] = useState<MediaFile[]>([])

  const handleMediaUploaded = (newMediaFiles: MediaFile[]) => {
    console.log('MediaManagement: Received new media files:', newMediaFiles)
    setLibraryMedia(prev => [...prev, ...newMediaFiles])
    // Add new media files to existing selection instead of replacing
    const updatedMedia = [...selectedMedia, ...newMediaFiles]
    console.log('MediaManagement: Updated media selection:', updatedMedia)
    onMediaSelect?.(updatedMedia)
  }

  const handleLibraryMediaUpdate = (mediaFiles: MediaFile[]) => {
    setLibraryMedia(mediaFiles)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Media Management</h2>
            <p className="text-sm text-muted-foreground">
              Upload and manage your media files
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'upload'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'library'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            Library
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'upload' ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-y-auto p-4"
          >
            <EnhancedMediaUpload
              onMediaUploaded={handleMediaUploaded}
              maxFiles={maxFiles}
              showPreview={true}
              allowMultiple={allowMultiple}
              existingMedia={selectedMedia}
              onMediaUpdate={onMediaSelect}
            />
          </motion.div>
        ) : (
          <motion.div
            key="library"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <MediaLibrary
              onMediaSelect={(mediaFile) => {
                if (allowMultiple) {
                  const updatedMedia = selectedMedia.some(m => m.id === mediaFile.id)
                    ? selectedMedia.filter(m => m.id !== mediaFile.id)
                    : [...selectedMedia, mediaFile]
                  onMediaSelect?.(updatedMedia)
                } else {
                  onMediaSelect?.([mediaFile])
                }
              }}
              selectedMedia={selectedMedia}
              onMediaUpdate={handleLibraryMediaUpdate}
            />
          </motion.div>
        )}
      </div>

      {/* Selected Media Summary */}
      {selectedMedia.length > 0 && (
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedMedia.length} file{selectedMedia.length !== 1 ? 's' : ''} selected
              </span>
              {selectedMedia.map(media => (
                <span key={media.id} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                  {media.originalName}
                </span>
              ))}
            </div>
            <button
              onClick={() => onMediaSelect?.([])}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
