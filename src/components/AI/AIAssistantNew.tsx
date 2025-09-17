import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'
import { AIFormFlow } from './AIFormFlow'

interface AIAssistantNewProps {
  isOpen: boolean
  onClose: () => void
  onPostsCreated?: (posts: any[]) => void
}

export function AIAssistantNew({ isOpen, onClose, onPostsCreated }: AIAssistantNewProps) {
  const [showFormFlow, setShowFormFlow] = useState(false)

  const handleOpenFormFlow = () => {
    setShowFormFlow(true)
  }

  const handleCloseFormFlow = () => {
    setShowFormFlow(false)
  }

  const handlePostsCreated = (posts: any[]) => {
    onPostsCreated?.(posts)
    setShowFormFlow(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
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
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-semibold">AI Post Generation</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            <div className="mb-6">
              <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Generate AI-Powered Posts</h3>
              <p className="text-gray-600 mb-6">
                Create a complete social media calendar with AI-generated posts tailored to your business.
                Simply fill out a quick form and let AI do the rest!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl mb-2">📝</div>
                <h4 className="font-semibold text-purple-900 mb-1">Step 1</h4>
                <p className="text-sm text-purple-700">Fill in your company details</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl mb-2">⚙️</div>
                <h4 className="font-semibold text-blue-900 mb-1">Step 2</h4>
                <p className="text-sm text-blue-700">AI pre-populates campaign settings</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl mb-2">🚀</div>
                <h4 className="font-semibold text-green-900 mb-1">Step 3</h4>
                <p className="text-sm text-green-700">Generate and schedule posts</p>
              </div>
            </div>

            <button
              onClick={handleOpenFormFlow}
              className="px-8 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold text-lg"
            >
              Start AI Post Generation
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Form Flow Modal */}
      <AIFormFlow
        isOpen={showFormFlow}
        onClose={handleCloseFormFlow}
        onPostsCreated={handlePostsCreated}
      />
    </>
  )
}
