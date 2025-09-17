import React, { useState, useEffect } from 'react'

interface AIGenerationProgressProps {
  totalPosts: number
  currentPost: number
  isGenerating: boolean
  estimatedTimeRemaining?: number
  currentAction?: string
  onCancel?: () => void
}

export const AIGenerationProgress: React.FC<AIGenerationProgressProps> = ({
  totalPosts,
  currentPost,
  isGenerating,
  estimatedTimeRemaining,
  currentAction = 'Generating posts',
  onCancel
}) => {
  const [progress, setProgress] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (totalPosts > 0) {
      const newProgress = Math.round((currentPost / totalPosts) * 100)
      setProgress(newProgress)
    }
  }, [currentPost, totalPosts])

  useEffect(() => {
    if (estimatedTimeRemaining && isGenerating) {
      setTimeRemaining(estimatedTimeRemaining)
      
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 0) return 0
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [estimatedTimeRemaining, isGenerating])

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`
    }
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getProgressColor = (progress: number): string => {
    if (progress < 30) return 'bg-red-500'
    if (progress < 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStatusMessage = (): string => {
    if (!isGenerating) {
      return 'Ready to generate posts'
    }
    
    if (currentPost >= totalPosts) {
      return '✅ Generation complete!'
    }
    
    return `${currentAction}... (${currentPost}/${totalPosts})`
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="text-center">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🤖 AI Post Generation
          </h2>
          <p className="text-gray-600">
            Creating {totalPosts} posts based on your specifications
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {getStatusMessage()}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {progress}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out ${getProgressColor(progress)}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Detailed Progress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{currentPost}</div>
            <div className="text-sm text-blue-800">Posts Generated</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{totalPosts - currentPost}</div>
            <div className="text-sm text-green-800">Posts Remaining</div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {timeRemaining !== null ? formatTime(timeRemaining) : '--'}
            </div>
            <div className="text-sm text-purple-800">Time Remaining</div>
          </div>
        </div>

        {/* Current Action */}
        {isGenerating && currentPost < totalPosts && (
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">
                {currentAction} post {currentPost + 1} of {totalPosts}...
              </span>
            </div>
          </div>
        )}

        {/* Generation Steps */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Generation Process:</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className={`flex items-center space-x-2 ${currentPost > 0 ? 'text-green-600' : ''}`}>
              <span className="w-4 h-4 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">✓</span>
              <span>Analyzing business context</span>
            </div>
            <div className={`flex items-center space-x-2 ${currentPost > 0 ? 'text-green-600' : ''}`}>
              <span className="w-4 h-4 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">✓</span>
              <span>Generating post content</span>
            </div>
            <div className={`flex items-center space-x-2 ${currentPost >= totalPosts ? 'text-green-600' : 'text-gray-400'}`}>
              <span className={`w-4 h-4 rounded-full text-white text-xs flex items-center justify-center ${
                currentPost >= totalPosts ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                {currentPost >= totalPosts ? '✓' : '⏳'}
              </span>
              <span>Scheduling posts</span>
            </div>
          </div>
        </div>

        {/* Cancel Button */}
        {isGenerating && currentPost < totalPosts && onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Cancel Generation
          </button>
        )}

        {/* Completion Message */}
        {!isGenerating && currentPost >= totalPosts && (
          <div className="text-center">
            <div className="text-green-600 text-lg font-semibold mb-2">
              🎉 Generation Complete!
            </div>
            <p className="text-gray-600 text-sm">
              Successfully created and scheduled {totalPosts} posts
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
