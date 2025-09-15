import { MediaFile } from '@/types'

export class StorageService {
  private organizationId: string

  constructor(organizationId: string) {
    this.organizationId = organizationId
  }

  async getStorageInfo(): Promise<{
    totalSpace: number
    usedSpace: number
    availableSpace: number
    organizationUsage: number
    mediaUsage: number
    databaseUsage: number
  }> {
    try {
      const appPath = await window.electronAPI.getAppPath()
      const assetsPath = await window.electronAPI.getAssetsPath()
      
      // This is a simplified implementation
      // In a real app, you'd calculate actual disk usage
      return {
        totalSpace: 10 * 1024 * 1024 * 1024, // 10GB
        usedSpace: 2 * 1024 * 1024 * 1024,   // 2GB
        availableSpace: 8 * 1024 * 1024 * 1024, // 8GB
        organizationUsage: 500 * 1024 * 1024, // 500MB
        mediaUsage: 400 * 1024 * 1024,       // 400MB
        databaseUsage: 100 * 1024 * 1024     // 100MB
      }
    } catch (error) {
      console.error('Failed to get storage info:', error)
      throw error
    }
  }

  async uploadMediaFile(file: File): Promise<MediaFile> {
    try {
      const assetsPath = await window.electronAPI.getAssetsPath()
      const organizationPath = `${assetsPath}/organizations/${this.organizationId}`
      const mediaPath = `${organizationPath}/media`
      
      // Ensure directories exist
      await window.electronAPI.fs.createDirectory(organizationPath)
      await window.electronAPI.fs.createDirectory(mediaPath)
      
      // Generate unique filename
      const timestamp = Date.now()
      const extension = file.name.split('.').pop()
      const filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filePath = `${mediaPath}/${filename}`
      
      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      
      // Write file
      await window.electronAPI.fs.writeFile(filePath, uint8Array)
      
      // Create media file record
      const mediaFile: MediaFile = {
        id: this.generateId(),
        organizationId: this.organizationId,
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        path: filePath,
        createdAt: new Date().toISOString(),
        metadata: {
          alt: '',
          caption: '',
          tags: [],
          isOptimized: false
        }
      }
      
      // If it's an image, we could generate a thumbnail here
      if (file.type.startsWith('image/')) {
        // Thumbnail generation would go here
        // For now, we'll just use the original image
        mediaFile.thumbnailPath = filePath
      }
      
      // Save media file record to database
      await window.electronAPI.orgDb.execute(
        this.organizationId,
        `INSERT INTO media_files (
          id, organization_id, filename, original_name, mime_type, 
          size, width, height, duration, path, thumbnail_path, 
          created_at, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          mediaFile.id,
          mediaFile.organizationId,
          mediaFile.filename,
          mediaFile.originalName,
          mediaFile.mimeType,
          mediaFile.size,
          mediaFile.width || null,
          mediaFile.height || null,
          mediaFile.duration || null,
          mediaFile.path,
          mediaFile.thumbnailPath || null,
          mediaFile.createdAt,
          JSON.stringify(mediaFile.metadata)
        ]
      )
      
      console.log(`Media file saved to database: ${mediaFile.id}`)
      return mediaFile
    } catch (error) {
      console.error('Failed to upload media file:', error)
      throw error
    }
  }

  async deleteMediaFile(mediaFile: MediaFile): Promise<void> {
    try {
      // Delete the actual file
      await window.electronAPI.fs.deleteFile(mediaFile.path)
      
      // Delete thumbnail if it exists and is different from main file
      if (mediaFile.thumbnailPath && mediaFile.thumbnailPath !== mediaFile.path) {
        await window.electronAPI.fs.deleteFile(mediaFile.thumbnailPath)
      }
    } catch (error) {
      console.error('Failed to delete media file:', error)
      throw error
    }
  }

  async copyMediaFile(mediaFile: MediaFile, newPath: string): Promise<void> {
    try {
      await window.electronAPI.fs.copyFile(mediaFile.path, newPath)
    } catch (error) {
      console.error('Failed to copy media file:', error)
      throw error
    }
  }

  async getMediaFileUrl(mediaFile: MediaFile): Promise<string> {
    try {
      // Convert file path to a proper URL that can be used in the app
      if (typeof window !== 'undefined' && window.electronAPI) {
        // For Electron, we need to convert the file path to a file:// URL
        return `file://${mediaFile.path}`
      }
      
      // For web environment, we might need to create a blob URL
      return mediaFile.path
    } catch (error) {
      console.error('Failed to get media file URL:', error)
      throw error
    }
  }

  async getAllMediaFiles(): Promise<MediaFile[]> {
    try {
      // Get all media files from the database for this organization
      const rows = await window.electronAPI.orgDb.query(
        this.organizationId,
        'SELECT * FROM media_files ORDER BY created_at DESC'
      )
      
      return rows.map(row => ({
        id: row.id,
        organizationId: row.organization_id,
        filename: row.filename,
        originalName: row.original_name,
        mimeType: row.mime_type,
        size: row.size,
        width: row.width,
        height: row.height,
        duration: row.duration,
        path: row.path,
        thumbnailPath: row.thumbnail_path,
        createdAt: row.created_at,
        metadata: row.metadata ? JSON.parse(row.metadata) : {}
      }))
    } catch (error) {
      console.error('Failed to get all media files:', error)
      throw error
    }
  }

  async optimizeImage(filePath: string, options: {
    width?: number
    height?: number
    quality?: number
  }): Promise<string> {
    try {
      // This would use Sharp or similar library to optimize images
      // For now, we'll just return the original path
      return filePath
    } catch (error) {
      console.error('Failed to optimize image:', error)
      throw error
    }
  }

  async generateThumbnail(filePath: string, size: number = 200): Promise<string> {
    try {
      // This would generate a thumbnail using Sharp or similar
      // For now, we'll just return the original path
      return filePath
    } catch (error) {
      console.error('Failed to generate thumbnail:', error)
      throw error
    }
  }

  async createImagePreview(mediaFile: MediaFile, maxWidth: number = 800, maxHeight: number = 600): Promise<string> {
    try {
      // For now, return the file URL
      // In a real implementation, this would create a resized preview
      return await this.getMediaFileUrl(mediaFile)
    } catch (error) {
      console.error('Failed to create image preview:', error)
      throw error
    }
  }

  async cleanupOrphanedFiles(): Promise<void> {
    try {
      // This would scan for files that are no longer referenced in the database
      // and delete them to free up space
      console.log('Cleaning up orphaned files...')
    } catch (error) {
      console.error('Failed to cleanup orphaned files:', error)
      throw error
    }
  }

  async exportData(format: 'json' | 'csv'): Promise<Blob> {
    try {
      // This would export all organization data in the specified format
      const data = { message: 'Export functionality would be implemented here' }
      return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    } catch (error) {
      console.error('Failed to export data:', error)
      throw error
    }
  }

  async importData(file: File): Promise<void> {
    try {
      // This would import data from a file
      const text = await file.text()
      const data = JSON.parse(text)
      console.log('Importing data:', data)
    } catch (error) {
      console.error('Failed to import data:', error)
      throw error
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }
}

// Factory function to create storage service instances
export function createStorageService(organizationId: string): StorageService {
  return new StorageService(organizationId)
}
