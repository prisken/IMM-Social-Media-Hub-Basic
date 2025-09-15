import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Tag, Folder, MoreVertical } from 'lucide-react'
import { useAuth } from '@/components/Auth/AuthProvider'
import { CategoryForm } from './CategoryForm'
import { TopicForm } from './TopicForm'
import { Category, Topic } from '@/types'
import { PostService } from '@/services/PostService'
import { databaseService } from '@/services/database/DatabaseService'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export function CategoryManagement() {
  const { currentOrganization } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showTopicForm, setShowTopicForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Initialize services
  const postService = new PostService()

  useEffect(() => {
    if (currentOrganization) {
      initializeServices()
    }
  }, [currentOrganization])

  const initializeServices = async () => {
    try {
      // Ensure database is initialized for the current organization
      await databaseService.initializeDatabase(currentOrganization!.id)
      loadData()
    } catch (error) {
      console.error('Failed to initialize services:', error)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [categoriesData, topicsData] = await Promise.all([
        postService.getCategories(),
        postService.getTopics()
      ])
      setCategories(categoriesData)
      setTopics(topicsData)
      
      // Select first category if none selected
      if (categoriesData.length > 0 && !selectedCategory) {
        setSelectedCategory(categoriesData[0].id)
      }
    } catch (error) {
      console.error('Failed to load categories and topics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newCategory = await postService.createCategory(categoryData)
      setCategories(prev => [...prev, newCategory])
      setShowCategoryForm(false)
      
      // Select the new category
      setSelectedCategory(newCategory.id)
    } catch (error) {
      console.error('Failed to create category:', error)
    }
  }

  const handleUpdateCategory = async (categoryData: Partial<Category>) => {
    if (!editingCategory) return
    
    try {
      const updatedCategory = await postService.updateCategory(editingCategory.id, categoryData)
      if (updatedCategory) {
        setCategories(prev => prev.map(cat => 
          cat.id === editingCategory.id ? updatedCategory : cat
        ))
      }
      setEditingCategory(null)
      setShowCategoryForm(false)
    } catch (error) {
      console.error('Failed to update category:', error)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const success = await postService.deleteCategory(categoryId)
      if (success) {
        setCategories(prev => prev.filter(cat => cat.id !== categoryId))
        
        // Delete associated topics
        setTopics(prev => prev.filter(topic => topic.categoryId !== categoryId))
        
        // Select another category if the deleted one was selected
        if (selectedCategory === categoryId) {
          const remainingCategories = categories.filter(cat => cat.id !== categoryId)
          setSelectedCategory(remainingCategories.length > 0 ? remainingCategories[0].id : null)
        }
      }
    } catch (error) {
      console.error('Failed to delete category:', error)
    }
  }

  const handleCreateTopic = async (topicData: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTopic = await postService.createTopic(topicData)
      setTopics(prev => [...prev, newTopic])
      setShowTopicForm(false)
    } catch (error) {
      console.error('Failed to create topic:', error)
    }
  }

  const handleUpdateTopic = async (topicData: Partial<Topic>) => {
    if (!editingTopic) return
    
    try {
      const updatedTopic = await postService.updateTopic(editingTopic.id, topicData)
      if (updatedTopic) {
        setTopics(prev => prev.map(topic => 
          topic.id === editingTopic.id ? updatedTopic : topic
        ))
      }
      setEditingTopic(null)
      setShowTopicForm(false)
    } catch (error) {
      console.error('Failed to update topic:', error)
    }
  }

  const handleDeleteTopic = async (topicId: string) => {
    try {
      const success = await postService.deleteTopic(topicId)
      if (success) {
        setTopics(prev => prev.filter(topic => topic.id !== topicId))
      }
    } catch (error) {
      console.error('Failed to delete topic:', error)
    }
  }

  const getTopicsForCategory = (categoryId: string) => {
    return topics.filter(topic => topic.categoryId === categoryId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    )
  }

  if (showCategoryForm) {
    return (
      <CategoryForm
        category={editingCategory}
        onSave={editingCategory ? handleUpdateCategory : handleCreateCategory}
        onCancel={() => {
          setShowCategoryForm(false)
          setEditingCategory(null)
        }}
      />
    )
  }

  if (showTopicForm) {
    return (
      <TopicForm
        topic={editingTopic}
        categories={categories}
        selectedCategoryId={selectedCategory}
        onSave={editingTopic ? handleUpdateTopic : handleCreateTopic}
        onCancel={() => {
          setShowTopicForm(false)
          setEditingTopic(null)
        }}
      />
    )
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
              onClick={() => {
                setEditingTopic(null)
                setShowTopicForm(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Topic
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingCategory(null)
                setShowCategoryForm(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Category
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Categories Panel */}
          <div className="w-1/2 border-r border-border">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Folder className="w-5 h-5" />
                Categories ({categories.length})
              </h3>
            </div>
            <div className="p-4 overflow-y-auto">
              {categories.length === 0 ? (
                <div className="text-center py-8">
                  <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No categories yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Create your first category to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-lg border border-border cursor-pointer transition-all hover:shadow-md ${
                        selectedCategory === category.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <div>
                            <h4 className="font-medium text-foreground">{category.name}</h4>
                            {category.description && (
                              <p className="text-sm text-muted-foreground">{category.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">
                            {getTopicsForCategory(category.id).length} topics
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingCategory(category)
                              setShowCategoryForm(true)
                            }}
                            className="p-1 hover:bg-muted rounded transition-colors"
                          >
                            <Edit className="w-3 h-3 text-muted-foreground" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteCategory(category.id)
                            }}
                            className="p-1 hover:bg-muted rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Topics Panel */}
          <div className="w-1/2">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Topics ({selectedCategory ? getTopicsForCategory(selectedCategory).length : topics.length})
                </h3>
                {selectedCategory && (
                  <button
                    onClick={() => setShowTopicForm(true)}
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    Add Topic
                  </button>
                )}
              </div>
            </div>
            <div className="p-4 overflow-y-auto">
              {!selectedCategory ? (
                <div className="text-center py-8">
                  <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a category to view topics</p>
                </div>
              ) : getTopicsForCategory(selectedCategory).length === 0 ? (
                <div className="text-center py-8">
                  <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No topics in this category</p>
                  <p className="text-sm text-muted-foreground mt-1">Create your first topic</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {getTopicsForCategory(selectedCategory).map((topic) => (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-all hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: topic.color }}
                          />
                          <div>
                            <h4 className="font-medium text-foreground">{topic.name}</h4>
                            {topic.description && (
                              <p className="text-sm text-muted-foreground">{topic.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingTopic(topic)
                              setShowTopicForm(true)
                            }}
                            className="p-1 hover:bg-muted rounded transition-colors"
                          >
                            <Edit className="w-3 h-3 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => handleDeleteTopic(topic.id)}
                            className="p-1 hover:bg-muted rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
