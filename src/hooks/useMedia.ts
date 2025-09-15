import { useState, useEffect, useCallback } from 'react'
import { MediaFile } from '@/types'
import { databaseService } from '@/services/database/DatabaseService'

export function useMedia() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMediaFiles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedMedia = await databaseService.getMediaFiles()
      setMediaFiles(fetchedMedia)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch media files')
      console.error('Error fetching media files:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createMediaFile = useCallback(async (mediaData: Omit<MediaFile, 'id' | 'createdAt'>) => {
    try {
      setError(null)
      const newMediaFile = await databaseService.createMediaFile(mediaData)
      setMediaFiles(prev => [newMediaFile, ...prev])
      return newMediaFile
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create media file')
      throw err
    }
  }, [])

  const deleteMediaFile = useCallback(async (id: string) => {
    try {
      setError(null)
      const success = await databaseService.deleteMediaFile(id)
      if (success) {
        setMediaFiles(prev => prev.filter(media => media.id !== id))
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete media file')
      throw err
    }
  }, [])

  const refresh = useCallback(() => {
    fetchMediaFiles()
  }, [fetchMediaFiles])

  useEffect(() => {
    fetchMediaFiles()
  }, [fetchMediaFiles])

  return {
    mediaFiles,
    loading,
    error,
    createMediaFile,
    deleteMediaFile,
    refresh,
    refetch: fetchMediaFiles
  }
}
