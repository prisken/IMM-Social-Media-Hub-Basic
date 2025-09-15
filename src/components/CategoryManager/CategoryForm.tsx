import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, X } from 'lucide-react'
import { Category } from '@/types'

interface CategoryFormProps {
  category?: Category | null
  onSave: (categoryData: Partial<Category>) => Promise<void>
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

export function CategoryForm({ category, onSave, onCancel }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    color: PREDEFINED_COLORS[0],
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        color: category.color || PREDEFINED_COLORS[0],
        description: category.description || ''
      })
    }
  }, [category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setIsSubmitting(true)
    try {
      await onSave({
        name: formData.name.trim(),
        color: formData.color,
        description: formData.description.trim() || undefined
      })
    } catch (error) {
      console.error('Failed to save category:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

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
              {category ? 'Edit Category' : 'Create New Category'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {category ? 'Update your category settings' : 'Create a new category to organize your content'}
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
            
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter category name..."
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
                placeholder="Enter category description (optional)..."
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
                Choose a color for this category
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

            {/* Color Preview */}
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: formData.color }}
                />
                <div>
                  <h4 className="font-medium text-foreground">{formData.name || 'Category Name'}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formData.description || 'Category description will appear here'}
                  </p>
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
              disabled={isSubmitting || !formData.name.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : (category ? 'Update Category' : 'Create Category')}
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  )
}
