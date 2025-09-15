import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/Auth/AuthProvider'
import { Building2, LogOut, Settings, User, ChevronDown, Plus, Trash2 } from 'lucide-react'
import { AppOrganization } from '@/services/AuthService'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { SettingsModal } from './SettingsModal'

interface HeaderProps {
  currentView: 'posts' | 'calendar' | 'categories'
  onViewChange: (view: 'posts' | 'calendar' | 'categories') => void
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  const { logout, user, currentOrganization, userOrganizations, switchOrganization, createOrganization, deleteOrganization } = useAuth()
  const [showOrgDropdown, setShowOrgDropdown] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [showNewOrgForm, setShowNewOrgForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [orgToDelete, setOrgToDelete] = useState<AppOrganization | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showOrgDropdown) {
        const target = event.target as Element
        if (!target.closest('.organization-dropdown')) {
          setShowOrgDropdown(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showOrgDropdown])

  const handleLogout = async () => {
    await logout()
  }

  const handleSwitchOrganization = async (orgId: string) => {
    try {
      await switchOrganization(orgId)
      setShowOrgDropdown(false)
    } catch (error) {
      console.error('Failed to switch organization:', error)
    }
  }

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOrgName.trim()) return

    try {
      await createOrganization(newOrgName.trim())
      setNewOrgName('')
      setShowNewOrgForm(false)
      setShowOrgDropdown(false)
    } catch (error) {
      console.error('Failed to create organization:', error)
    }
  }

  const handleDeleteOrganization = (org: AppOrganization) => {
    setOrgToDelete(org)
    setShowDeleteDialog(true)
    setShowOrgDropdown(false)
  }

  const confirmDeleteOrganization = async () => {
    if (!orgToDelete) return

    setIsDeleting(true)
    try {
      await deleteOrganization(orgToDelete.id)
    } catch (error) {
      console.error('Failed to delete organization:', error)
    } finally {
      setIsDeleting(false)
      setOrgToDelete(null)
    }
  }

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      {/* Left side - Organization info */}
      <div className="flex items-center gap-4">
        <div className="relative organization-dropdown">
          <button
            onClick={() => setShowOrgDropdown(!showOrgDropdown)}
            className="flex items-center gap-3 hover:bg-muted rounded-lg p-2 transition-colors"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h1 className="font-semibold text-foreground">
                {currentOrganization?.name || 'Social Media Manager'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {user?.name || 'User'}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Organization Dropdown */}
          {showOrgDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50"
            >
              <div className="p-2">
                <div className="text-xs font-medium text-muted-foreground px-2 py-1 mb-1">
                  Organizations
                </div>
                {userOrganizations.map(org => (
                  <div
                    key={org.id}
                    className={`flex items-center justify-between group px-2 py-2 rounded-md text-sm transition-colors ${
                      currentOrganization?.id === org.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <button
                      onClick={() => handleSwitchOrganization(org.id)}
                      className="flex-1 text-left"
                    >
                      {org.name}
                    </button>
                    {userOrganizations.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteOrganization(org)
                        }}
                        className={`ml-2 p-1 rounded hover:bg-destructive/20 transition-colors ${
                          currentOrganization?.id === org.id
                            ? 'text-primary-foreground hover:text-destructive'
                            : 'text-muted-foreground hover:text-destructive'
                        }`}
                        title="Delete organization"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                
                <div className="border-t border-border my-2" />
                
                {showNewOrgForm ? (
                  <form onSubmit={handleCreateOrganization} className="p-2">
                    <input
                      type="text"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      placeholder="Organization name"
                      className="w-full px-2 py-1 text-sm border border-border rounded-md mb-2"
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <button
                        type="submit"
                        className="flex-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                      >
                        Create
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewOrgForm(false)
                          setNewOrgName('')
                        }}
                        className="flex-1 px-2 py-1 text-xs bg-muted text-muted-foreground rounded-md hover:bg-muted/80"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowNewOrgForm(true)}
                    className="w-full text-left px-2 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted flex items-center gap-2"
                  >
                    <Plus className="w-3 h-3" />
                    Create Organization
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Center - View toggle */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
        <button
          onClick={() => onViewChange('posts')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            currentView === 'posts'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Posts
        </button>
        <button
          onClick={() => onViewChange('calendar')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            currentView === 'calendar'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Calendar
        </button>
        <button
          onClick={() => onViewChange('categories')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            currentView === 'categories'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Categories
        </button>
      </div>

      {/* Right side - User actions */}
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSettings(true)}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          title="Profile"
        >
          <User className="w-5 h-5" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Delete Organization Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDeleteOrganization}
        title="Delete Organization"
        description={`Are you sure you want to delete "${orgToDelete?.name}"? This will permanently delete all posts, media, and data associated with this organization. This action cannot be undone.`}
        confirmText="Delete Organization"
        isLoading={isDeleting}
        variant="destructive"
      />

      {/* Settings Modal */}
      <SettingsModal
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </header>
  )
}
