import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Copy, FileText, Star } from 'lucide-react'
import { useAuth } from '@/components/Auth/AuthProvider'
import { databaseService } from '@/services/database/DatabaseService'

interface PostTemplate {
  id: string
  name: string
  content: string
  platform: string
  type: string
  hashtags: string[]
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

interface PostTemplateProps {
  onSelectTemplate: (template: PostTemplate) => void
}

export function PostTemplate({ onSelectTemplate }: PostTemplateProps) {
  const { organization } = useAuth()
  const [templates, setTemplates] = useState<PostTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (organization) {
      loadTemplates()
    }
  }, [organization])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      // In a real app, this would load from database
      const mockTemplates: PostTemplate[] = [
        {
          id: '1',
          name: 'Product Announcement',
          content: '🚀 Exciting news! We\'re thrilled to announce our latest feature that will revolutionize your workflow.\n\n✨ What\'s new:\n• Enhanced user experience\n• Improved performance\n• New customization options\n\nTry it out and let us know what you think!',
          platform: 'instagram',
          type: 'text',
          hashtags: ['#announcement', '#newfeature', '#productivity'],
          isDefault: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Community Highlight',
          content: '🌟 Community Spotlight!\n\nWe love seeing how our users are making the most of our platform. Here\'s an amazing example from our community:\n\n[User Story]\n\nThank you for sharing your success story with us! 🙏',
          platform: 'facebook',
          type: 'text',
          hashtags: ['#community', '#spotlight', '#success'],
          isDefault: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '3',
          name: 'Behind the Scenes',
          content: '🔍 Behind the Scenes\n\nEver wondered what goes into building and maintaining our platform? Here\'s a glimpse into our development process:\n\n[Development Story]\n\n#BehindTheScenes #Development #Team',
          platform: 'linkedin',
          type: 'text',
          hashtags: ['#behindthescenes', '#development', '#team'],
          isDefault: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '4',
          name: 'Feature Tutorial',
          content: '📚 Feature Tutorial\n\nLearn how to use our latest feature in just 3 easy steps:\n\n1️⃣ Step one description\n2️⃣ Step two description\n3️⃣ Step three description\n\nNeed help? Check out our documentation or reach out to our support team!',
          platform: 'twitter',
          type: 'text',
          hashtags: ['#tutorial', '#howto', '#tips'],
          isDefault: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ]
      setTemplates(mockTemplates)
    } catch (error) {
      console.error('Failed to load templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async (templateData: Omit<PostTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTemplate: PostTemplate = {
        ...templateData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      setTemplates(prev => [...prev, newTemplate])
      setShowForm(false)
    } catch (error) {
      console.error('Failed to create template:', error)
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      setTemplates(prev => prev.filter(template => template.id !== templateId))
    } catch (error) {
      console.error('Failed to delete template:', error)
    }
  }

  const handleDuplicateTemplate = async (template: PostTemplate) => {
    try {
      const duplicatedTemplate: PostTemplate = {
        ...template,
        id: Date.now().toString(),
        name: `${template.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      setTemplates(prev => [...prev, duplicatedTemplate])
    } catch (error) {
      console.error('Failed to duplicate template:', error)
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return '📷'
      case 'facebook': return '📘'
      case 'twitter': return '🐦'
      case 'linkedin': return '💼'
      default: return '📱'
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">Post Templates</h3>
            <p className="text-sm text-muted-foreground">Save time with reusable post templates</p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </motion.button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-foreground">{template.name}</h4>
                  {template.isDefault && (
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicateTemplate(template)}
                    className="p-1 hover:bg-muted rounded"
                    title="Duplicate"
                  >
                    <Copy className="w-3 h-3 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-1 hover:bg-destructive/10 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getPlatformIcon(template.platform)}</span>
                  <span className="text-xs text-muted-foreground capitalize">{template.platform}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground capitalize">{template.type}</span>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3">
                  {template.content}
                </p>

                {template.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {template.hashtags.map((hashtag, idx) => (
                      <span key={idx} className="text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                        {hashtag}
                      </span>
                    ))}
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectTemplate(template)}
                  className="btn btn-primary btn-sm w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Use Template
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Templates Yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first template to speed up your content creation
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </motion.button>
          </div>
        )}
      </div>

      {/* Template Form Modal */}
      {showForm && (
        <TemplateForm
          onSave={handleCreateTemplate}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

// Template Form Component
function TemplateForm({ 
  onSave, 
  onCancel 
}: { 
  onSave: (data: Omit<PostTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    platform: 'instagram',
    type: 'text',
    hashtags: '',
    isDefault: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim() && formData.content.trim()) {
      onSave({
        ...formData,
        hashtags: formData.hashtags.split(',').map(tag => tag.trim()).filter(tag => tag)
      })
    }
  }

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: '📷' },
    { id: 'facebook', name: 'Facebook', icon: '📘' },
    { id: 'twitter', name: 'Twitter', icon: '🐦' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background rounded-lg border border-border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <h3 className="font-semibold text-foreground mb-4">Create Template</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Template Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input mt-1"
              placeholder="Enter template name"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Platform</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {platforms.map(platform => (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, platform: platform.id }))}
                    className={`p-2 rounded-lg border border-border text-left transition-colors ${
                      formData.platform === platform.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{platform.icon}</span>
                      <span className="text-sm font-medium">{platform.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="input mt-1"
              >
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="carousel">Carousel</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="input mt-1"
              placeholder="Enter template content..."
              rows={6}
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground">Hashtags (comma-separated)</label>
            <input
              type="text"
              value={formData.hashtags}
              onChange={(e) => setFormData(prev => ({ ...prev, hashtags: e.target.value }))}
              className="input mt-1"
              placeholder="#hashtag1, #hashtag2, #hashtag3"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="isDefault" className="text-sm text-foreground">
              Mark as default template
            </label>
          </div>
          
          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className="btn btn-outline flex-1">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              Create Template
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
