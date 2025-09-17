import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Bot, 
  User, 
  X, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  MessageSquare,
  Sparkles,
  FileText,
  Clock
} from 'lucide-react'
import { AIService } from '@/services/AIService'
import { 
  AIChatMessage, 
  AIContentPlan, 
  AIPostPreview,
  Category,
  Topic,
  Post,
  SocialPlatform
} from '@/types'
import { useAuth } from '@/components/Auth/AuthProvider'
import { apiService } from '@/services/ApiService'
import { AIUnderstandingForm } from './AIUnderstandingForm'
import { AIGenerationProgress } from './AIGenerationProgress'

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
  onPostsCreated?: (posts: Post[]) => void
}

export function AIAssistant({ isOpen, onClose, onPostsCreated }: AIAssistantProps) {
  const { currentOrganization } = useAuth()
  const [messages, setMessages] = useState<AIChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<AIContentPlan | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [selectedModel, setSelectedModel] = useState('llama3.1:8b')
  const [availableModels, setAvailableModels] = useState<string[]>([])
  
  // 🎯 New state for hybrid flow
  const [showUnderstandingForm, setShowUnderstandingForm] = useState(false)
  const [showGenerationProgress, setShowGenerationProgress] = useState(false)
  const [generationProgress, setGenerationProgress] = useState({
    current: 0,
    total: 0,
    action: 'Preparing...',
    estimatedTime: 0
  })
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const aiService = AIService.getInstance()

  useEffect(() => {
    if (isOpen) {
      initializeAssistant()
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Reload data when organization changes
  useEffect(() => {
    if (currentOrganization && isOpen) {
      loadOrganizationData()
    }
  }, [currentOrganization, isOpen])

  const loadOrganizationData = async () => {
    if (!currentOrganization) return
    
    try {
      const [categoriesData, topicsData] = await Promise.all([
        apiService.getCategories(),
        apiService.getTopics()
      ])
      setCategories(categoriesData)
      setTopics(topicsData)
    } catch (error) {
      console.error('Failed to load organization data:', error)
    }
  }

  const initializeAssistant = async () => {
    setIsLoading(true)
    
    try {
      // Check Ollama connection
      const connected = await aiService.checkOllamaStatus()
      setIsConnected(connected)
      
      if (connected) {
        // Get available models
        const models = await aiService.getAvailableModels()
        setAvailableModels(models)
        
        // Load categories and topics
        await loadOrganizationData()
        
        // Add welcome message
        const organizationName = currentOrganization?.name || 'your organization'
        const welcomeMessage: AIChatMessage = {
          id: 'welcome',
          type: 'ai',
          content: `Hi! I'm your AI social media assistant for ${organizationName}. I can help you create and schedule social media posts based on your needs. What would you like me to help you with today?`,
          timestamp: new Date().toISOString()
        }
        setMessages([welcomeMessage])
      } else {
        // Add connection error message
        const errorMessage: AIChatMessage = {
          id: 'error',
          type: 'ai',
          content: "I'm having trouble connecting to the AI service. Please make sure Ollama is running on your system. You can download it from https://ollama.ai",
          timestamp: new Date().toISOString()
        }
        setMessages([errorMessage])
      }
    } catch (error) {
      console.error('Failed to initialize AI assistant:', error)
      const errorMessage: AIChatMessage = {
        id: 'error',
        type: 'ai',
        content: "Sorry, I encountered an error while initializing. Please try again.",
        timestamp: new Date().toISOString()
      }
      setMessages([errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !isConnected) return

    const userMessage: AIChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      if (!currentOrganization) {
        const errorMessage: AIChatMessage = {
          id: `ai-error-${Date.now()}`,
          type: 'ai',
          content: 'I need you to select an organization first before I can help you create posts. Please go to the organization switcher in the header and select an organization.',
          timestamp: new Date().toISOString(),
          metadata: {
            isClarification: true
          }
        }
        setMessages(prev => [...prev, errorMessage])
        return
      }

      console.log('Calling aiService.processDirective...')
      const response = await aiService.processDirective(
        inputMessage,
        currentOrganization.id,
        categories,
        topics
      )
      console.log('AI service response received:', response)

      const aiMessage: AIChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: response.message,
        timestamp: new Date().toISOString(),
        metadata: {
          isClarification: response.action === 'clarify',
          isConfirmation: response.action === 'preview',
          postPreview: response.contentPlan?.posts
        }
      }

      console.log('Adding AI message to chat:', aiMessage)
      setMessages(prev => [...prev, aiMessage])
      
      // 🎯 Form will be shown manually via button, not automatically
      
      if (response.contentPlan) {
        setCurrentPlan(response.contentPlan)
      }

    } catch (error) {
      console.error('Error processing message:', error)
      const errorMessage: AIChatMessage = {
        id: `error-${Date.now()}`,
        type: 'ai',
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmation = async (confirmation: string) => {
    if (!currentOrganization) return

    setIsLoading(true)
    
    try {
      const response = await aiService.handleConfirmation(
        confirmation,
        currentOrganization.id,
        categories,
        topics
      )

      const aiMessage: AIChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: response.message,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, aiMessage])

      if (response.action === 'create' && response.metadata?.posts) {
        onPostsCreated?.(response.metadata.posts)
        setCurrentPlan(null)
      }

    } catch (error) {
      console.error('Error handling confirmation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // 🎯 New handlers for hybrid flow
  const handleFormConfirm = async (formData: any) => {
    if (!currentOrganization) return
    
    setShowUnderstandingForm(false)
    setShowGenerationProgress(true)
    
    try {
      const plan = await aiService.generatePostsFromForm(
        formData,
        currentOrganization.id,
        (current, total, action) => {
          setGenerationProgress({
            current,
            total,
            action,
            estimatedTime: Math.max(0, Math.ceil((total - current) * 0.5)) // 0.5 minutes per post
          })
        }
      )
      
      setCurrentPlan(plan)
      
      // Create actual posts in the database
      if (plan.posts && plan.posts.length > 0) {
        const createdPosts = await aiService.createPostsFromPlan(currentOrganization.id)
        onPostsCreated?.(createdPosts)
        
        // Add success message to chat
        const successMessage: AIChatMessage = {
          id: `success-${Date.now()}`,
          type: 'ai',
          content: `🎉 Successfully created and scheduled ${createdPosts.length} posts! They're now available in your calendar.`,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, successMessage])
      }
      
    } catch (error) {
      console.error('Error generating posts from form:', error)
      const errorMessage: AIChatMessage = {
        id: `error-${Date.now()}`,
        type: 'ai',
        content: 'Sorry, I encountered an error while generating your posts. Please try again.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setShowGenerationProgress(false)
    }
  }

  const handleFormCancel = () => {
    setShowUnderstandingForm(false)
  }

  const handleGenerationCancel = () => {
    setShowGenerationProgress(false)
    setGenerationProgress({ current: 0, total: 0, action: 'Preparing...', estimatedTime: 0 })
  }

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
  }

  const renderMessage = (message: AIChatMessage) => {
    const isUser = message.type === 'user'
    
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex items-start space-x-2 max-w-[80%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-blue-500' : 'bg-purple-500'
          }`}>
            {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
          </div>
          
          <div className={`rounded-lg px-4 py-2 ${
            isUser 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-900'
          }`}>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
            />
            
            {/* 🎯 Ready for Form Button - appears after AI messages */}
            {!isUser && !showUnderstandingForm && !showGenerationProgress && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => setShowUnderstandingForm(true)}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2 text-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>Ready for Form</span>
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  Click to configure your campaign parameters
                </p>
              </div>
            )}
            
            {message.metadata?.isConfirmation && message.metadata?.postPreview && (
              <div className="mt-4 space-y-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleConfirmation('CREATE POSTS')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Create Posts</span>
                  </button>
                  <button
                    onClick={() => handleConfirmation('EDIT POSTS')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Edit Posts
                  </button>
                </div>
              </div>
            )}
            
            <div className="text-xs opacity-70 mt-2">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-semibold">AI Assistant</h2>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b bg-gray-50 p-4"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => {
                      setSelectedModel(e.target.value)
                      aiService.setModel(e.target.value)
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {availableModels.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-gray-600">
                    {isConnected ? 'Connected to Ollama' : 'Not connected to Ollama'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map(renderMessage)}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* 🎯 AI Understanding Form */}
          <AnimatePresence>
            {showUnderstandingForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-4"
              >
                <AIUnderstandingForm
                  businessContext={aiService.getBusinessContext()}
                  aiFormData={aiService.generateFormDataFromContext()}
                  onConfirm={handleFormConfirm}
                  onCancel={handleFormCancel}
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* 🎯 Generation Progress */}
          <AnimatePresence>
            {showGenerationProgress && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-4"
              >
                <AIGenerationProgress
                  totalPosts={generationProgress.total}
                  currentPost={generationProgress.current}
                  isGenerating={showGenerationProgress}
                  estimatedTimeRemaining={generationProgress.estimatedTime}
                  currentAction={generationProgress.action}
                  onCancel={handleGenerationCancel}
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  !currentOrganization ? "Please select an organization first..." :
                  !isConnected ? "AI service not available" : 
                  "Type your message..."
                }
                disabled={!isConnected || isLoading || !currentOrganization}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={2}
              />
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading || !isConnected || !currentOrganization}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          {!currentOrganization && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Please select an organization from the header to start using the AI assistant.
                </span>
              </div>
            </div>
          )}
          
          {!isConnected && currentOrganization && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  AI service not available. Please install and start Ollama to use the AI assistant.
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
