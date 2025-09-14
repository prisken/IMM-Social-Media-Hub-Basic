import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react'
import { useAuth } from '@/components/Auth/AuthProvider'
import { apiService } from '@/services/ApiService'
import { Post, Category } from '@/types'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  currentView: 'posts' | 'calendar'
  onViewChange: (view: 'posts' | 'calendar') => void
  selectedPostId: string | null
  onPostSelect: (postId: string | null) => void
}

export function Sidebar({ 
  collapsed, 
  onToggle, 
  currentView, 
  onViewChange, 
  selectedPostId, 
  onPostSelect 
}: SidebarProps) {
  const { organization } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (organization) {
      loadData()
    }
  }, [organization])

  const loadData = async () => {
    try {
      setLoading(true)
      const [postsData, categoriesData] = await Promise.all([
        apiService.getPosts(),
        apiService.getCategories()
      ])
      setPosts(postsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to load sidebar data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (collapsed) {
    return (
      <div className="h-full flex flex-col items-center py-4 space-y-4">
        <button
          onClick={onToggle}
          className="p-2 hover:bg-muted rounded-md transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        
        <div className="w-full h-px bg-border" />
        
        <button
          onClick={() => onViewChange('posts')}
          className={`p-2 rounded-md transition-colors ${
            currentView === 'posts' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
        >
          <FileText className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => onViewChange('calendar')}
          className={`p-2 rounded-md transition-colors ${
            currentView === 'calendar' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
        >
          <Calendar className="w-5 h-5" />
        </button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Content</h2>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex gap-2">
          <button className="btn btn-primary btn-sm flex-1">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search posts..."
            className="input pl-10 text-sm"
          />
        </div>
        
        <button className="btn btn-outline btn-sm w-full">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </button>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Categories</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ x: 4 }}
                className="w-full flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-foreground">{category.name}</span>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {category.count}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="p-4 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Posts</h3>
          <div className="space-y-2">
            {posts.map((post) => (
              <motion.button
                key={post.id}
                whileHover={{ x: 4 }}
                onClick={() => onPostSelect(post.id)}
                className={`w-full flex items-center justify-between p-2 rounded-md transition-colors text-left ${
                  selectedPostId === post.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{post.title}</p>
                  <p className="text-xs text-muted-foreground">{post.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    post.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    post.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {post.status}
                  </span>
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
