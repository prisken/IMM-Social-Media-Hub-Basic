import React from 'react'
import { motion } from 'framer-motion'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Calendar, Clock, Tag } from 'lucide-react'
import { useAuth } from '@/components/Auth/AuthProvider'
import { apiService } from '@/services/ApiService'
import { DraggablePostItem } from './DraggablePostItem'
import { Post } from '@/types'

interface CalendarListProps {
  selectedPostId: string | null
  onPostSelect: (postId: string | null) => void
}

export function CalendarList({ selectedPostId, onPostSelect }: CalendarListProps) {
  const { organization } = useAuth()
  const [posts, setPosts] = React.useState<Post[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (organization) {
      loadPosts()
    }
  }, [organization])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const postsData = await apiService.getPosts()
      setPosts(postsData)
    } catch (error) {
      console.error('Failed to load posts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Posts</h3>
        <p className="text-sm text-muted-foreground">Drag to schedule</p>
      </div>

      {/* Posts List */}
      <div className="flex-1 overflow-y-auto">
        <DndProvider backend={HTML5Backend}>
          <div className="p-4 space-y-3">
            {posts.map((post, index) => (
              <DraggablePostItem
                key={post.id}
                post={post}
                isSelected={selectedPostId === post.id}
                onClick={() => onPostSelect(post.id)}
              />
            ))}
          </div>
        </DndProvider>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2">
            Drag posts to the calendar to schedule them
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span>Draft</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Scheduled</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Published</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}