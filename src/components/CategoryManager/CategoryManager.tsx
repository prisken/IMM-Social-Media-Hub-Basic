import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Tag, Palette } from 'lucide-react'
import { useAuth } from '@/components/Auth/AuthProvider'
import { apiService } from '@/services/ApiService'
import { Category, Topic } from '@/types'

interface CategoryWithCount extends Category {
  topicCount: number
}

export function CategoryManager() {
  const { organization } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (organization) {
      loadData()
    }
  }, [organization])

  const loadData = async () => {
    try {
      setLoading(true)
      const [categoriesData, topicsData] = await Promise.all([
        apiService.getCategories(),
        // Load all topics for all categories
        apiService.getTopics()
      ])
      setCategories(categoriesData)
      setTopics(topicsData)
    } catch (error) {
      console.error('Failed to load category data:', error)
    } finally {
      setLoading(false)
    }
  }

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showTopicForm, setShowTopicForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)

  const predefinedColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4',
    '#84CC16', '#F97316', '#EC4899', '#6B7280', '#14B8A6', '#F43F5E'
  ]

  const getTopicsForCategory = (categoryId: string) => {
    return topics.filter(topic => topic.categoryId === categoryId)
  }

  const handleCreateCategory = (categoryData: Omit<Category, 'id' | 'topicCount'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: Date.now().toString(),
      topicCount: 0
    }
    setCategories(prev => [...prev, newCategory])
    setShowCategoryForm(false)
  }

  const handleUpdateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    ))
    setEditingCategory(null)
  }

  const handleDeleteCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id))
    setTopics(prev => prev.filter(topic => topic.categoryId !== id))
    setSelectedCategory(null)
  }

  const handleCreateTopic = (topicData: Omit<Topic, 'id'>) => {
    const newTopic: Topic = {
      ...topicData,
      id: Date.now().toString()
    }
    setTopics(prev => [...prev, newTopic])
    setCategories(prev => prev.map(cat => 
      cat.id === topicData.categoryId 
        ? { ...cat, topicCount: cat.topicCount + 1 }
        : cat
    ))
    setShowTopicForm(false)
  }

  const handleUpdateTopic = (id: string, updates: Partial<Topic>) => {
    setTopics(prev => prev.map(topic => 
      topic.id === id ? { ...topic, ...updates } : topic
    ))
    setEditingTopic(null)
  }

  const handleDeleteTopic = (id: string) => {
    const topic = topics.find(t => t.id === id)
    if (topic) {
      setTopics(prev => prev.filter(t => t.id !== id))
      setCategories(prev => prev.map(cat => 
        cat.id === topic.categoryId 
          ? { ...cat, topicCount: Math.max(0, cat.topicCount - 1) }
          : cat
      ))
    }
  }

  return (
    <div className="h-full flex">
      {/* Categories List */}
      <div className="w-1/2 border-r border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Categories</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCategoryForm(true)}
              className="btn btn-primary btn-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Category
            </motion.button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 rounded-lg border border-border cursor-pointer transition-all hover:shadow-md ${
                selectedCategory === category.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div 
                    className="w-4 h-4 rounded-full mt-1"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{category.name}</h4>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {category.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Tag className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {category.topicCount} topics
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingCategory(category)
                    }}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <Edit className="w-3 h-3 text-muted-foreground" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteCategory(category.id)
                    }}
                    className="p-1 hover:bg-destructive/10 rounded"
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Topics List */}
      <div className="w-1/2">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">
              Topics {selectedCategory && `- ${categories.find(c => c.id === selectedCategory)?.name}`}
            </h3>
            {selectedCategory && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTopicForm(true)}
                className="btn btn-primary btn-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Topic
              </motion.button>
            )}
          </div>
        </div>

        <div className="p-4">
          {selectedCategory ? (
            <div className="space-y-3">
              {getTopicsForCategory(selectedCategory).map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-3 h-3 rounded-full mt-1"
                        style={{ backgroundColor: topic.color }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{topic.name}</h4>
                        {topic.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {topic.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingTopic(topic)}
                        className="p-1 hover:bg-muted rounded"
                      >
                        <Edit className="w-3 h-3 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDeleteTopic(topic.id)}
                        className="p-1 hover:bg-destructive/10 rounded"
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {getTopicsForCategory(selectedCategory).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No topics in this category</p>
                  <p className="text-sm">Create your first topic to get started</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a category to view topics</p>
            </div>
          )}
        </div>
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <CategoryForm
          onSave={handleCreateCategory}
          onCancel={() => setShowCategoryForm(false)}
          colors={predefinedColors}
        />
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <CategoryForm
          category={editingCategory}
          onSave={(data) => handleUpdateCategory(editingCategory.id, data)}
          onCancel={() => setEditingCategory(null)}
          colors={predefinedColors}
        />
      )}

      {/* Topic Form Modal */}
      {showTopicForm && selectedCategory && (
        <TopicForm
          categoryId={selectedCategory}
          onSave={handleCreateTopic}
          onCancel={() => setShowTopicForm(false)}
          colors={predefinedColors}
        />
      )}

      {/* Edit Topic Modal */}
      {editingTopic && (
        <TopicForm
          topic={editingTopic}
          onSave={(data) => handleUpdateTopic(editingTopic.id, data)}
          onCancel={() => setEditingTopic(null)}
          colors={predefinedColors}
        />
      )}
    </div>
  )
}

// Category Form Component
function CategoryForm({ 
  category, 
  onSave, 
  onCancel, 
  colors 
}: { 
  category?: Category
  onSave: (data: Omit<Category, 'id' | 'topicCount'>) => void
  onCancel: () => void
  colors: string[]
}) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    color: category?.color || colors[0],
    description: category?.description || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim()) {
      onSave(formData)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background rounded-lg border border-border p-6 w-full max-w-md"
      >
        <h3 className="font-semibold text-foreground mb-4">
          {category ? 'Edit Category' : 'Create Category'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input mt-1"
              placeholder="Category name"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground">Color</label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color ? 'border-foreground' : 'border-border'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input mt-1"
              placeholder="Optional description"
              rows={3}
            />
          </div>
          
          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className="btn btn-outline flex-1">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              {category ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// Topic Form Component
function TopicForm({ 
  topic, 
  categoryId, 
  onSave, 
  onCancel, 
  colors 
}: { 
  topic?: Topic
  categoryId?: string
  onSave: (data: Omit<Topic, 'id'>) => void
  onCancel: () => void
  colors: string[]
}) {
  const [formData, setFormData] = useState({
    name: topic?.name || '',
    color: topic?.color || colors[0],
    description: topic?.description || '',
    categoryId: topic?.categoryId || categoryId || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim() && formData.categoryId) {
      onSave(formData)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background rounded-lg border border-border p-6 w-full max-w-md"
      >
        <h3 className="font-semibold text-foreground mb-4">
          {topic ? 'Edit Topic' : 'Create Topic'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input mt-1"
              placeholder="Topic name"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground">Color</label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color ? 'border-foreground' : 'border-border'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input mt-1"
              placeholder="Optional description"
              rows={3}
            />
          </div>
          
          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className="btn btn-outline flex-1">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              {topic ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
