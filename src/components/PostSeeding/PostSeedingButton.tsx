import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Database } from 'lucide-react'
import { PostSeedingModal } from './PostSeedingModal'

interface PostSeedingButtonProps {
  onPostsSeeded?: (count: number) => void
  variant?: 'button' | 'menuItem'
  className?: string
}

export function PostSeedingButton({ onPostsSeeded, variant = 'button', className }: PostSeedingButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleClose = () => {
    setIsOpen(false)
  }

  const handlePostsSeeded = (count: number) => {
    onPostsSeeded?.(count)
    setIsOpen(false)
  }

  if (variant === 'menuItem') {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className={`w-full text-left px-2 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted flex items-center gap-2 ${className}`}
        >
          <Database className="w-3 h-3" />
          Seed Posts
        </button>
        <PostSeedingModal isOpen={isOpen} onClose={handleClose} onPostsSeeded={handlePostsSeeded} />
      </>
    )
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors ${className}`}
        title="Seed Sample Posts"
      >
        <Database className="w-4 h-4" />
        Seed Posts
      </motion.button>
      <PostSeedingModal isOpen={isOpen} onClose={handleClose} onPostsSeeded={handlePostsSeeded} />
    </>
  )
}
