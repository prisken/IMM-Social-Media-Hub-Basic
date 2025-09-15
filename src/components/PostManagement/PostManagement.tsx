import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Filter, Grid, List, MoreVertical } from 'lucide-react'
import { useAuth } from '@/components/Auth/AuthProvider'
import { PostList } from './PostList'
import { PostForm } from './PostForm'
import { BulkOperations } from './BulkOperations'
import { Post, Category, Topic } from '@/types'
import { PostService } from '@/services/PostService'
import { databaseService } from '@/services/database/DatabaseService'

interface PostManagementProps {
  selectedPostId: string | null
  onPostSelect: (postId: string | null) => void
}

export function PostManagement({ selectedPostId, onPostSelect }: PostManagementProps) {
  const { currentOrganization } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [showBulkOperations, setShowBulkOperations] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [showPostForm, setShowPostForm] = useState(false)

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
      const [postsData, categoriesData, topicsData] = await Promise.all([
        postService.getPosts(),
        postService.getCategories(),
        postService.getTopics()
      ])
      setPosts(postsData)
      setCategories(categoriesData)
      setTopics(topicsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = () => {
    setEditingPost(null)
    setShowPostForm(true)
  }

  const handleEditPost = (post: Post) => {
    setEditingPost(post)
    setShowPostForm(true)
  }

  const handleDeletePost = async (postId: string) => {
    try {
      await postService.deletePost(postId)
      await loadData()
      if (selectedPostId === postId) {
        onPostSelect(null)
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
    }
  }

  const handlePostSelect = (postId: string | null) => {
    onPostSelect(postId)
  }

  const handlePostSave = async (postData: Partial<Post>) => {
    try {
      if (editingPost) {
        await postService.updatePost(editingPost.id, postData)
      } else {
        await postService.createPost(postData as Omit<Post, 'id' | 'createdAt' | 'updatedAt'>)
      }
      setShowPostForm(false)
      setEditingPost(null)
      await loadData()
    } catch (error) {
      console.error('Failed to save post:', error)
    }
  }

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedPosts.map(id => postService.deletePost(id)))
      setSelectedPosts([])
      setShowBulkOperations(false)
      await loadData()
    } catch (error) {
      console.error('Failed to bulk delete posts:', error)
    }
  }

  // Filter posts based on search and filters
  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !selectedCategory || post.categoryId === selectedCategory
    const matchesTopic = !selectedTopic || post.topicId === selectedTopic
    
    return matchesSearch && matchesCategory && matchesTopic
  })

  if (showPostForm) {
    return (
      <PostForm
        post={editingPost}
        categories={categories}
        topics={topics}
        onSave={handlePostSave}
        onCancel={() => {
          setShowPostForm(false)
          setEditingPost(null)
        }}
      />
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Post Management</h2>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreatePost}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Post
            </motion.button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              showFilters 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-background text-foreground border-border hover:bg-muted'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </motion.button>

          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-muted/50 rounded-lg border border-border"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Topic</label>
                <select
                  value={selectedTopic || ''}
                  onChange={(e) => setSelectedTopic(e.target.value || null)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Topics</option>
                  {topics.map(topic => (
                    <option key={topic.id} value={topic.id}>{topic.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bulk Operations */}
        {selectedPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary">
                {selectedPosts.length} post{selectedPosts.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBulkOperations(true)}
                  className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Bulk Actions
                </button>
                <button
                  onClick={() => setSelectedPosts([])}
                  className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded-md hover:bg-muted/80"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Post List */}
      <div className="flex-1 overflow-hidden">
        <PostList
          posts={filteredPosts}
          categories={categories}
          topics={topics}
          selectedPostId={selectedPostId}
          viewMode={viewMode}
          loading={loading}
          selectedPosts={selectedPosts}
          onPostSelect={handlePostSelect}
          onEditPost={handleEditPost}
          onDeletePost={handleDeletePost}
          onToggleSelection={(postId) => {
            setSelectedPosts(prev => 
              prev.includes(postId) 
                ? prev.filter(id => id !== postId)
                : [...prev, postId]
            )
          }}
        />
      </div>

      {/* Bulk Operations Modal */}
      <BulkOperations
        open={showBulkOperations}
        onOpenChange={setShowBulkOperations}
        selectedPosts={selectedPosts}
        onBulkDelete={handleBulkDelete}
        onClearSelection={() => setSelectedPosts([])}
      />
    </div>
  )
}
