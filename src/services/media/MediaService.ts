import { MediaFile, MediaMetadata } from '@/types'
import { createStorageService } from '../storage/StorageService'

export class MediaService {
  private storageService: ReturnType<typeof createStorageService>

  constructor(organizationId: string) {
    this.storageService = createStorageService(organizationId)
  }

  async uploadFile(file: File): Promise<MediaFile> {
    try {
      // Validate file
      this.validateFile(file)
      
      // Upload to storage
      const mediaFile = await this.storageService.uploadMediaFile(file)
      
      // Process file based on type
      if (file.type.startsWith('image/')) {
        await this.processImage(mediaFile)
      } else if (file.type.startsWith('video/')) {
        await this.processVideo(mediaFile)
      } else if (file.type.startsWith('audio/')) {
        await this.processAudio(mediaFile)
      }
      
      return mediaFile
    } catch (error) {
      console.error('Failed to upload file:', error)
      throw error
    }
  }

  async uploadMultipleFiles(files: File[]): Promise<MediaFile[]> {
    const uploadPromises = files.map(file => this.uploadFile(file))
    return Promise.all(uploadPromises)
  }

  async deleteFile(mediaFile: MediaFile): Promise<void> {
    try {
      await this.storageService.deleteMediaFile(mediaFile)
    } catch (error) {
      console.error('Failed to delete file:', error)
      throw error
    }
  }

  async getFileUrl(mediaFile: MediaFile): Promise<string> {
    try {
      return await this.storageService.getMediaFileUrl(mediaFile)
    } catch (error) {
      console.error('Failed to get file URL:', error)
      throw error
    }
  }

  async updateMetadata(mediaFile: MediaFile, metadata: Partial<MediaMetadata>): Promise<MediaFile> {
    try {
      const updatedFile = {
        ...mediaFile,
        metadata: { ...mediaFile.metadata, ...metadata }
      }
      
      // In a real app, you'd save this to the database
      return updatedFile
    } catch (error) {
      console.error('Failed to update metadata:', error)
      throw error
    }
  }

  async optimizeFile(mediaFile: MediaFile): Promise<MediaFile> {
    try {
      if (mediaFile.mimeType.startsWith('image/')) {
        const optimizedPath = await this.storageService.optimizeImage(mediaFile.path, {
          quality: 85,
          width: 1920,
          height: 1080
        })
        
        return {
          ...mediaFile,
          path: optimizedPath,
          metadata: {
            ...mediaFile.metadata,
            isOptimized: true,
            compressionRatio: 0.85
          }
        }
      }
      
      return mediaFile
    } catch (error) {
      console.error('Failed to optimize file:', error)
      throw error
    }
  }

  async generateThumbnail(mediaFile: MediaFile, size: number = 200): Promise<string> {
    try {
      if (mediaFile.mimeType.startsWith('image/')) {
        return await this.storageService.generateThumbnail(mediaFile.path, size)
      } else if (mediaFile.mimeType.startsWith('video/')) {
        // Video thumbnail generation would go here
        return mediaFile.path
      }
      
      return mediaFile.path
    } catch (error) {
      console.error('Failed to generate thumbnail:', error)
      throw error
    }
  }

  async searchFiles(query: string, filters?: {
    type?: 'image' | 'video' | 'audio'
    tags?: string[]
    dateFrom?: string
    dateTo?: string
  }): Promise<MediaFile[]> {
    try {
      // This would search through the database for matching files
      // For now, return empty array
      return []
    } catch (error) {
      console.error('Failed to search files:', error)
      throw error
    }
  }

  async getAllMediaFiles(): Promise<MediaFile[]> {
    try {
      // Get all media files for this organization from the database
      const mediaFiles = await this.storageService.getAllMediaFiles()
      return mediaFiles
    } catch (error) {
      console.error('Failed to get media files:', error)
      throw error
    }
  }

  async getFileStats(): Promise<{
    totalFiles: number
    totalSize: number
    byType: Record<string, { count: number; size: number }>
  }> {
    try {
      // This would calculate statistics from the database
      return {
        totalFiles: 0,
        totalSize: 0,
        byType: {}
      }
    } catch (error) {
      console.error('Failed to get file stats:', error)
      throw error
    }
  }

  private validateFile(file: File): void {
    const maxSize = 50 * 1024 * 1024 // 50MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/mov',
      'video/avi',
      'audio/mp3',
      'audio/wav',
      'audio/aac'
    ]

    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`)
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not supported`)
    }
  }

  private async processImage(mediaFile: MediaFile): Promise<void> {
    try {
      // Generate thumbnail
      const thumbnailPath = await this.generateThumbnail(mediaFile, 300)
      
      // Update metadata with dimensions if possible
      // This would typically involve reading the image and getting its dimensions
      mediaFile.metadata = {
        ...mediaFile.metadata,
        alt: mediaFile.originalName
      }
    } catch (error) {
      console.error('Failed to process image:', error)
    }
  }

  private async processVideo(mediaFile: MediaFile): Promise<void> {
    try {
      // Generate thumbnail from video
      const thumbnailPath = await this.generateThumbnail(mediaFile, 300)
      
      // Extract video metadata (duration, dimensions, etc.)
      // This would typically involve using FFmpeg or similar
      mediaFile.metadata = {
        ...mediaFile.metadata,
        alt: mediaFile.originalName
      }
    } catch (error) {
      console.error('Failed to process video:', error)
    }
  }

  private async processAudio(mediaFile: MediaFile): Promise<void> {
    try {
      // Extract audio metadata (duration, bitrate, etc.)
      // This would typically involve using a library like music-metadata
      mediaFile.metadata = {
        ...mediaFile.metadata,
        alt: mediaFile.originalName
      }
    } catch (error) {
      console.error('Failed to process audio:', error)
    }
  }
}

// Factory function to create media service instances
export function createMediaService(organizationId: string): MediaService {
  return new MediaService(organizationId)
}
