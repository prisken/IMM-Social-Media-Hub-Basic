import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Tag, Palette, Search, Filter, Check, X, Building2, Target, Sparkles } from 'lucide-react'
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
  
  // Search and filter states
  const [categorySearch, setCategorySearch] = useState('')
  const [topicSearch, setTopicSearch] = useState('')
  const [showEmptyCategories, setShowEmptyCategories] = useState(true)
  
  // Quick add states
  const [showQuickAddCategory, setShowQuickAddCategory] = useState(false)
  const [showQuickAddTopic, setShowQuickAddTopic] = useState(false)
  const [quickCategoryName, setQuickCategoryName] = useState('')
  const [quickTopicName, setQuickTopicName] = useState('')

  const predefinedColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4',
    '#84CC16', '#F97316', '#EC4899', '#6B7280', '#14B8A6', '#F43F5E'
  ]

  const getTopicsForCategory = (categoryId: string) => {
    return topics.filter(topic => topic.categoryId === categoryId)
  }

  // Filter functions
  const filteredCategories = categories.filter(category => {
    const matchesSearch = !categorySearch || 
      category.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(categorySearch.toLowerCase()))
    const matchesFilter = showEmptyCategories || category.topicCount > 0
    return matchesSearch && matchesFilter
  })

  const filteredTopics = selectedCategory ? getTopicsForCategory(selectedCategory).filter(topic => {
    return !topicSearch || 
      topic.name.toLowerCase().includes(topicSearch.toLowerCase()) ||
      (topic.description && topic.description.toLowerCase().includes(topicSearch.toLowerCase()))
  }) : []

  // Quick add functions
  const handleQuickAddCategory = () => {
    setShowCategoryForm(true)
  }

  const handleQuickAddTopic = () => {
    if (selectedCategory) {
      setShowTopicForm(true)
    }
  }

  const handleQuickCreateCategory = () => {
    if (quickCategoryName.trim()) {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: quickCategoryName.trim(),
        color: predefinedColors[Math.floor(Math.random() * predefinedColors.length)],
        topicCount: 0
      }
      setCategories(prev => [...prev, newCategory])
      setQuickCategoryName('')
      setShowQuickAddCategory(false)
    }
  }

  const handleQuickCreateTopic = () => {
    if (quickTopicName.trim() && selectedCategory) {
      const newTopic: Topic = {
        id: Date.now().toString(),
        name: quickTopicName.trim(),
        color: predefinedColors[Math.floor(Math.random() * predefinedColors.length)],
        categoryId: selectedCategory
      }
      setTopics(prev => [...prev, newTopic])
      setCategories(prev => prev.map(cat => 
        cat.id === selectedCategory 
          ? { ...cat, topicCount: cat.topicCount + 1 }
          : cat
      ))
      setQuickTopicName('')
      setShowQuickAddTopic(false)
    }
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
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Categories & Topics</h2>
            <p className="text-sm text-muted-foreground">Organize your content with categories and topics</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleQuickAddCategory}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Category
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Categories Section */}
        <div className="w-1/2 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Building2 className="w-4 h-4 mr-2" />
                Categories
                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                  {filteredCategories.length}
                </span>
              </label>
            </div>
            
            {/* Search and Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEmptyCategories(!showEmptyCategories)}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                    !showEmptyCategories 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Filter className="w-3 h-3" />
                  Hide Empty
                </button>
                <button
                  onClick={() => setShowQuickAddCategory(!showQuickAddCategory)}
                  className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Quick Add
                </button>
              </div>
            </div>
            
            {/* Quick Add Category Form */}
            {showQuickAddCategory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 p-3 bg-white border border-gray-200 rounded-md"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Category name..."
                    value={quickCategoryName}
                    onChange={(e) => setQuickCategoryName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleQuickCreateCategory()}
                    className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    autoFocus
                  />
                  <button
                    onClick={handleQuickCreateCategory}
                    disabled={!quickCategoryName.trim()}
                    className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickAddCategory(false)
                      setQuickCategoryName('')
                    }}
                    className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            )}
            </div>
          </div>

          {/* Categories List */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredCategories.length > 0 ? (
              <div className="space-y-3">
                {filteredCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      selectedCategory === category.id 
                        ? 'ring-2 ring-purple-500 bg-purple-50 border-purple-200' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-4 h-4 rounded-full mt-1"
                          style={{ backgroundColor: category.color }}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{category.name}</h4>
                          {category.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {category.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Tag className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
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
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Edit category"
                        >
                          <Edit className="w-3 h-3 text-gray-500" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteCategory(category.id)
                          }}
                          className="p-1 hover:bg-red-50 rounded transition-colors"
                          title="Delete category"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No categories found</p>
                <p className="text-sm">Create your first category to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Topics Section */}
        <div className="w-1/2 flex flex-col">
          <div className="p-4 border-b border-border bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Target className="w-4 h-4 mr-2" />
                Topics
                {selectedCategory && (
                  <>
                    <span className="ml-2 text-gray-500">-</span>
                    <span className="ml-2 text-gray-600">
                      {categories.find(c => c.id === selectedCategory)?.name}
                    </span>
                  </>
                )}
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {filteredTopics.length}
                </span>
              </label>
              {selectedCategory && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleQuickAddTopic}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  New Topic
                </motion.button>
              )}
            </div>
            
            {/* Search and Quick Add */}
            {selectedCategory && (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search topics..."
                    value={topicSearch}
                    onChange={(e) => setTopicSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowQuickAddTopic(!showQuickAddTopic)}
                    className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Quick Add
                  </button>
                </div>
                
                {/* Quick Add Topic Form */}
                {showQuickAddTopic && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-white border border-gray-200 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Topic name..."
                        value={quickTopicName}
                        onChange={(e) => setQuickTopicName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleQuickCreateTopic()}
                        className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={handleQuickCreateTopic}
                        disabled={!quickTopicName.trim()}
                        className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          setShowQuickAddTopic(false)
                          setQuickTopicName('')
                        }}
                        className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Topics List */}
          <div className="flex-1 overflow-y-auto p-4">
            {selectedCategory ? (
              filteredTopics.length > 0 ? (
                <div className="space-y-3">
                  {filteredTopics.map((topic, index) => (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div 
                            className="w-3 h-3 rounded-full mt-1"
                            style={{ backgroundColor: topic.color }}
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{topic.name}</h4>
                            {topic.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {topic.description}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingTopic(topic)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Edit topic"
                          >
                            <Edit className="w-3 h-3 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteTopic(topic.id)}
                            className="p-1 hover:bg-red-50 rounded transition-colors"
                            title="Delete topic"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No topics found</p>
                  <p className="text-sm">Create your first topic to get started</p>
                </div>
              )
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a category to view topics</p>
                <p className="text-sm">Choose a category from the left to see its topics</p>
              </div>
            )}
          </div>
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
