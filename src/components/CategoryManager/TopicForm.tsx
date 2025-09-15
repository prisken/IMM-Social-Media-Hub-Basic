import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save } from 'lucide-react'
import { Topic, Category } from '@/types'

interface TopicFormProps {
  topic?: Topic | null
  categories: Category[]
  selectedCategoryId?: string | null
  onSave: (topicData: Partial<Topic>) => Promise<void>
  onCancel: () => void
}

const PREDEFINED_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
]

export function TopicForm({ topic, categories, selectedCategoryId, onSave, onCancel }: TopicFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    color: PREDEFINED_COLORS[1],
    description: '',
    categoryId: selectedCategoryId || ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (topic) {
      setFormData({
        name: topic.name || '',
        color: topic.color || PREDEFINED_COLORS[1],
        description: topic.description || '',
        categoryId: topic.categoryId || ''
      })
    } else if (selectedCategoryId) {
      setFormData(prev => ({ ...prev, categoryId: selectedCategoryId }))
    }
  }, [topic, selectedCategoryId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.categoryId) return

    setIsSubmitting(true)
    try {
      await onSave({
        name: formData.name.trim(),
        color: formData.color,
        description: formData.description.trim() || undefined,
        categoryId: formData.categoryId
      })
    } catch (error) {
      console.error('Failed to save topic:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCategory = categories.find(cat => cat.id === formData.categoryId)

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {topic ? 'Edit Topic' : 'Create New Topic'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {topic ? 'Update your topic settings' : 'Create a new topic within a category'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
            
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Topic Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter topic name..."
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter topic description (optional)..."
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Color</h3>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Choose a color for this topic
              </label>
              <div className="grid grid-cols-5 gap-3">
                {PREDEFINED_COLORS.map((color) => (
                  <motion.button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-12 h-12 rounded-lg border-2 transition-all ${
                      formData.color === color 
                        ? 'border-foreground ring-2 ring-primary ring-offset-2' 
                        : 'border-border hover:border-foreground'
                    }`}
                    style={{ backgroundColor: color }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <div className="space-y-3">
                {/* Category */}
                {selectedCategory && (
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: selectedCategory.color }}
                    />
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium text-foreground">{selectedCategory.name}</p>
                    </div>
                  </div>
                )}
                
                {/* Topic */}
                <div className="flex items-center gap-3">
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: formData.color }}
                  />
                  <div>
                    <p className="text-sm text-muted-foreground">Topic</p>
                    <p className="font-medium text-foreground">{formData.name || 'Topic Name'}</p>
                    {formData.description && (
                      <p className="text-sm text-muted-foreground">{formData.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={isSubmitting || !formData.name.trim() || !formData.categoryId}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : (topic ? 'Update Topic' : 'Create Topic')}
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  )
}
