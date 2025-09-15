import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PostList } from './PostList'
import { PostForm } from './PostForm'
import { Plus, Search, Filter, Grid, List } from 'lucide-react'

interface PostEditorProps {
  selectedPostId: string | null
  onPostSelect: (postId: string | null) => void
}

export function PostEditor({ selectedPostId, onPostSelect }: PostEditorProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handlePostCreated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Posts</h2>
            <p className="text-sm text-muted-foreground">
              Manage and create your social media content
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPostSelect('new')}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </motion.button>
        </div>

        {/* Search and Controls */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'}`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          
          <div className="flex items-center bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Post List */}
        <div className="w-1/2 border-r border-border">
          <PostList
            viewMode={viewMode}
            searchQuery={searchQuery}
            selectedPostId={selectedPostId}
            onPostSelect={onPostSelect}
            refreshTrigger={refreshTrigger}
          />
        </div>

        {/* Post Form */}
        <div className="w-1/2">
          <PostForm
            selectedPostId={selectedPostId}
            onPostSelect={onPostSelect}
            onPostCreated={handlePostCreated}
          />
        </div>
      </div>
    </div>
  )
}
