import { Organization, User, AuthState } from '@/types'
import { databaseService } from './database/DatabaseService'
import { apiService } from './ApiService'

export interface AppUser {
  id: string
  name: string
  createdAt: string
  lastLoginAt?: string
}

export interface AppOrganization {
  id: string
  name: string
  description?: string
  settings: any
  createdAt: string
  updatedAt: string
}

export interface AppAuthState {
  isAuthenticated: boolean
  user: AppUser | null
  currentOrganization: AppOrganization | null
  userOrganizations: AppOrganization[]
  loading: boolean
  error: string | null
}

export class AuthService {
  private currentAuthState: AppAuthState = {
    isAuthenticated: false,
    user: null,
    currentOrganization: null,
    userOrganizations: [],
    loading: false,
    error: null
  }

  private listeners: Array<(state: AppAuthState) => void> = []

  constructor() {
    this.initializeAuth()
  }

  private async initializeAuth(): Promise<void> {
    try {
      // Check if there's a saved session
      const savedSession = localStorage.getItem('auth_session')
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession)
          
          if (session && session.userId && session.organizationId) {
            await this.validateSession(session)
          } else {
            localStorage.removeItem('auth_session')
          }
        } catch (parseError) {
          localStorage.removeItem('auth_session')
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error)
      localStorage.removeItem('auth_session')
      this.updateAuthState({ error: 'Failed to initialize authentication' })
    }
  }

  private async validateSession(session: { userId: string; organizationId: string }): Promise<void> {
    try {
      this.updateAuthState({ loading: true })
      
      if (typeof window !== 'undefined' && window.electronAPI) {
        // Get user organizations
        const organizations = await window.electronAPI.auth.getUserOrganizations(session.userId)
        
        // Find the current organization
        const currentOrg = organizations.find(org => org.id === session.organizationId)
        
        if (organizations.length > 0 && currentOrg) {
          // Create organization database if it doesn't exist
          await window.electronAPI.createOrganizationDb(session.organizationId)
          
          // Initialize database service for this organization
          await databaseService.initializeDatabase(session.organizationId)
          
          // Update ApiService with the organization ID
          apiService.setOrganizationId(session.organizationId)
          
          // Initialize default data (categories, topics) if needed
          const { DataInitializationService } = await import('./DataInitializationService')
          await DataInitializationService.initializeDefaultData(session.organizationId)
          
          // Get user info (we'll get it from the organizations query)
          const userInfo = {
            id: session.userId,
            name: 'User', // We'll need to get this from the database
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          }
          
          this.updateAuthState({
            isAuthenticated: true,
            user: userInfo,
            currentOrganization: currentOrg,
            userOrganizations: organizations,
            loading: false,
            error: null
          })
        } else {
          this.logout()
        }
      } else {
        this.logout()
      }
    } catch (error) {
      console.error('Session validation failed:', error)
      this.logout()
    }
  }

  async login(name: string, password: string): Promise<AppAuthState> {
    try {
      this.updateAuthState({ loading: true, error: null })
      
      if (typeof window === 'undefined' || !window.electronAPI) {
        throw new Error('Electron API not available')
      }
      
      // Authenticate user
      const user = await window.electronAPI.auth.login(name, password)
      
      // Get user's organizations
      const organizations = await window.electronAPI.auth.getUserOrganizations(user.id)
      
      if (organizations.length === 0) {
        // User has no organizations, they need to create one
        this.updateAuthState({
          isAuthenticated: true,
          user: {
            id: user.id,
            name: user.name,
            createdAt: user.created_at,
            lastLoginAt: user.last_login_at
          },
          currentOrganization: null,
          userOrganizations: [],
          loading: false,
          error: null
        })
        
        // Save session without organization
        localStorage.setItem('auth_session', JSON.stringify({
          userId: user.id,
          organizationId: null
        }))
      } else {
        // User has organizations, use the first one as default
        const currentOrg = organizations[0]
        
        // Create organization database if it doesn't exist
        await window.electronAPI.createOrganizationDb(currentOrg.id)
        
        // Initialize database service for this organization
        await databaseService.initializeDatabase(currentOrg.id)
        
        // Update ApiService with the organization ID
        apiService.setOrganizationId(currentOrg.id)
        
        this.updateAuthState({
          isAuthenticated: true,
          user: {
            id: user.id,
            name: user.name,
            createdAt: user.created_at,
            lastLoginAt: user.last_login_at
          },
          currentOrganization: currentOrg,
          userOrganizations: organizations,
          loading: false,
          error: null
        })
        
        // Save session
        localStorage.setItem('auth_session', JSON.stringify({
          userId: user.id,
          organizationId: currentOrg.id
        }))
      }
      
      return this.currentAuthState
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      this.updateAuthState({
        isAuthenticated: false,
        user: null,
        currentOrganization: null,
        userOrganizations: [],
        loading: false,
        error: errorMessage
      })
      throw error
    }
  }

  async createUser(name: string, password: string): Promise<AppAuthState> {
    try {
      this.updateAuthState({ loading: true, error: null })
      
      if (typeof window === 'undefined' || !window.electronAPI) {
        throw new Error('Electron API not available')
      }
      
      // Create user
      const user = await window.electronAPI.auth.createUser(name, password)
      
      this.updateAuthState({
        isAuthenticated: true,
        user: {
          id: user.userId,
          name: user.name,
          createdAt: user.createdAt,
          lastLoginAt: undefined
        },
        currentOrganization: null,
        userOrganizations: [],
        loading: false,
        error: null
      })
      
      // Save session without organization (user needs to create one)
      localStorage.setItem('auth_session', JSON.stringify({
        userId: user.userId,
        organizationId: null
      }))
      
      return this.currentAuthState
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user'
      this.updateAuthState({
        isAuthenticated: false,
        user: null,
        currentOrganization: null,
        userOrganizations: [],
        loading: false,
        error: errorMessage
      })
      throw error
    }
  }

  async createOrganization(name: string, description?: string): Promise<AppAuthState> {
    try {
      this.updateAuthState({ loading: true, error: null })
      
      if (!this.currentAuthState.user) {
        throw new Error('No user logged in')
      }
      
      if (typeof window === 'undefined' || !window.electronAPI) {
        throw new Error('Electron API not available')
      }
      
      // Create organization
      const organization = await window.electronAPI.auth.createOrganization(
        this.currentAuthState.user.id,
        name,
        description
      )
      
      // Create organization database
      await window.electronAPI.createOrganizationDb(organization.organizationId)
      
      // Get updated user organizations
      const organizations = await window.electronAPI.auth.getUserOrganizations(this.currentAuthState.user.id)
      
      const newOrg = organizations.find(org => org.id === organization.organizationId)!
      
      this.updateAuthState({
        ...this.currentAuthState,
        currentOrganization: newOrg,
        userOrganizations: organizations,
        loading: false,
        error: null
      })
      
      // Update session
      localStorage.setItem('auth_session', JSON.stringify({
        userId: this.currentAuthState.user.id,
        organizationId: organization.organizationId
      }))
      
      return this.currentAuthState
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create organization'
      this.updateAuthState({
        ...this.currentAuthState,
        loading: false,
        error: errorMessage
      })
      throw error
    }
  }

  async switchOrganization(organizationId: string): Promise<AppAuthState> {
    try {
      this.updateAuthState({ loading: true, error: null })
      
      if (!this.currentAuthState.user) {
        throw new Error('No user logged in')
      }
      
      // Find the organization in user's organizations
      const organization = this.currentAuthState.userOrganizations.find(org => org.id === organizationId)
      
      if (!organization) {
        throw new Error('Access denied to this organization')
      }
      
      // Create organization database if it doesn't exist
      if (typeof window !== 'undefined' && window.electronAPI) {
        await window.electronAPI.createOrganizationDb(organizationId)
        
        // Initialize database service for this organization
        await databaseService.initializeDatabase(organizationId)
        
        // Update ApiService with the new organization ID
        apiService.setOrganizationId(organizationId)
        
        // Initialize default data (categories, topics) if needed
        const { DataInitializationService } = await import('./DataInitializationService')
        await DataInitializationService.initializeDefaultData(organization.id)
      }
      
      this.updateAuthState({
        ...this.currentAuthState,
        currentOrganization: organization,
        loading: false,
        error: null
      })
      
      // Update session
      localStorage.setItem('auth_session', JSON.stringify({
        userId: this.currentAuthState.user.id,
        organizationId: organizationId
      }))
      
      return this.currentAuthState
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to switch organization'
      this.updateAuthState({
        ...this.currentAuthState,
        loading: false,
        error: errorMessage
      })
      throw error
    }
  }

  async getUserOrganizations(): Promise<AppOrganization[]> {
    return this.currentAuthState.userOrganizations
  }

  async logout(): Promise<void> {
    try {
      // Clear session
      localStorage.removeItem('auth_session')
      
      // Reset auth state
      this.updateAuthState({
        isAuthenticated: false,
        user: null,
        currentOrganization: null,
        userOrganizations: [],
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  getAuthState(): AppAuthState {
    return this.currentAuthState
  }

  subscribe(listener: (state: AppAuthState) => void): () => void {
    this.listeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private updateAuthState(updates: Partial<AppAuthState>): void {
    this.currentAuthState = { ...this.currentAuthState, ...updates }
    this.listeners.forEach(listener => listener(this.currentAuthState))
  }

  isAuthenticated(): boolean {
    return this.currentAuthState.isAuthenticated
  }

  getCurrentUser(): AppUser | null {
    return this.currentAuthState.user
  }

  getCurrentOrganization(): AppOrganization | null {
    return this.currentAuthState.currentOrganization
  }

  async deleteUser(): Promise<void> {
    if (!this.currentAuthState.user) {
      throw new Error('No user logged in')
    }

    if (typeof window === 'undefined' || !window.electronAPI) {
      throw new Error('Electron API not available')
    }

    try {
      await window.electronAPI.auth.deleteUser(this.currentAuthState.user.id)
      // Logout after successful deletion
      await this.logout()
    } catch (error) {
      console.error('Failed to delete user:', error)
      throw error
    }
  }

  async deleteOrganization(organizationId: string): Promise<void> {
    if (!this.currentAuthState.user) {
      throw new Error('No user logged in')
    }

    if (typeof window === 'undefined' || !window.electronAPI) {
      throw new Error('Electron API not available')
    }

    try {
      await window.electronAPI.auth.deleteOrganization(organizationId)
      
      // Update the user organizations list
      const updatedOrganizations = this.currentAuthState.userOrganizations.filter(
        org => org.id !== organizationId
      )
      
      // If we deleted the current organization, switch to another one or logout
      if (this.currentAuthState.currentOrganization?.id === organizationId) {
        if (updatedOrganizations.length > 0) {
          // Switch to the first available organization
          await this.switchOrganization(updatedOrganizations[0].id)
        } else {
          // No organizations left, logout
          await this.logout()
        }
      } else {
        // Just update the organizations list
        this.updateAuthState({
          userOrganizations: updatedOrganizations
        })
      }
    } catch (error) {
      console.error('Failed to delete organization:', error)
      throw error
    }
  }
}

// Singleton instance
export const authService = new AuthService()