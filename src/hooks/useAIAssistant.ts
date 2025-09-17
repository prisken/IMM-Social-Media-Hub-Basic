import { useState, useCallback } from 'react'
import { AIService } from '@/services/AIService'
import { AIChatMessage, AIContentPlan } from '@/types'

export function useAIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const aiService = AIService.getInstance()

  const openAssistant = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeAssistant = useCallback(() => {
    setIsOpen(false)
  }, [])

  const checkConnection = useCallback(async () => {
    setIsLoading(true)
    try {
      const connected = await aiService.checkOllamaStatus()
      setIsConnected(connected)
      return connected
    } catch (error) {
      console.error('Error checking AI connection:', error)
      setIsConnected(false)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [aiService])

  const getAvailableModels = useCallback(async () => {
    try {
      return await aiService.getAvailableModels()
    } catch (error) {
      console.error('Error getting available models:', error)
      return []
    }
  }, [aiService])

  const setModel = useCallback((modelName: string) => {
    aiService.setModel(modelName)
  }, [aiService])

  const clearConversation = useCallback(() => {
    aiService.clearConversation()
  }, [aiService])

  const getConversationHistory = useCallback(() => {
    return aiService.getConversationHistory()
  }, [aiService])

  return {
    isOpen,
    isConnected,
    isLoading,
    openAssistant,
    closeAssistant,
    checkConnection,
    getAvailableModels,
    setModel,
    clearConversation,
    getConversationHistory
  }
}
