import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/Auth/AuthProvider'
import { Building2, LogOut, Settings, User, ChevronDown, Plus } from 'lucide-react'
import { Organization } from '@/types'
import { apiService } from '@/services/ApiService'

interface HeaderProps {
  organization: Organization | null
  currentView: 'posts' | 'calendar'
  onViewChange: (view: 'posts' | 'calendar') => void
}

export function Header({ organization, currentView, onViewChange }: HeaderProps) {
  const { logout, user, login } = useAuth()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [showOrgDropdown, setShowOrgDropdown] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [showNewOrgForm, setShowNewOrgForm] = useState(false)

  useEffect(() => {
    loadOrganizations()
  }, [])

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

  const loadOrganizations = async () => {
    try {
      const orgs = await apiService.getAllOrganizations()
      setOrganizations(orgs)
    } catch (error) {
      console.error('Failed to load organizations:', error)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  const handleSwitchOrganization = async (orgId: string) => {
    try {
      // Auto-login with organization-specific credentials
      const orgCredentials = {
        '20': { email: 'karma@karmacookie.com', password: 'karma123' }, // Karma Cookie
        '21': { email: 'persona@personacentric.com', password: 'persona123' }, // Persona Centric
        '22': { email: 'imm@immlimited.com', password: 'imm123' }, // IMM Limited
        '23': { email: 'roleplay@roleplay.com', password: 'roleplay123' }, // Roleplay
        '24': { email: 'foodies@hkfoodies.com', password: 'foodies123' }, // HK Foodies
        '25': { email: 'drinks@halfdrinks.com', password: 'drinks123' } // 1/2 Drinks
      }
      
      const credentials = orgCredentials[orgId as keyof typeof orgCredentials]
      if (credentials) {
        await login(credentials.email, credentials.password)
        setShowOrgDropdown(false)
      }
    } catch (error) {
      console.error('Failed to switch organization:', error)
    }
  }

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOrgName.trim()) return

    try {
      const newOrg = await apiService.createOrganization({
        name: newOrgName.trim(),
        description: '',
        website: '',
        logo: ''
      })
      setOrganizations(prev => [...prev, newOrg])
      setNewOrgName('')
      setShowNewOrgForm(false)
      setShowOrgDropdown(false)
    } catch (error) {
      console.error('Failed to create organization:', error)
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
                {organization?.name || 'Social Media Manager'}
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
                {organizations.map(org => (
                  <button
                    key={org.id}
                    onClick={() => handleSwitchOrganization(org.id)}
                    className={`w-full text-left px-2 py-2 rounded-md text-sm transition-colors ${
                      organization?.id === org.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {org.name}
                  </button>
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
      </div>

      {/* Right side - User actions */}
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
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
    </header>
  )
}
