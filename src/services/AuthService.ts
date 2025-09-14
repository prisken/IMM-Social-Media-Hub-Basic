import { databaseService } from './database/DatabaseService'
import { Organization, User, AuthState } from '@/types'

export class AuthService {
  private currentAuthState: AuthState = {
    isAuthenticated: false,
    user: null,
    organization: null,
    loading: false,
    error: null
  }

  private listeners: Array<(state: AuthState) => void> = []

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
          
          // Validate that session has proper structure and email format
          if (!session || typeof session !== 'object') {
            console.log('🚨 Invalid session structure detected')
            localStorage.clear() // Clear all localStorage
            return
          }
          
          if (!session.userId || !session.organizationId) {
            console.log('🚨 Incomplete session data detected')
            localStorage.clear() // Clear all localStorage
            return
          }
          
          // Validate that userId is an email (not an organization ID)
          if (!session.userId.includes('@') || typeof session.userId !== 'string') {
            console.log('🚨 Corrupted session detected - userId is not an email:', session.userId)
            console.log('🧹 Clearing ALL localStorage to prevent corruption')
            localStorage.clear() // Clear all localStorage
            return
          }
          
          // Validate that organizationId is a string (not a number)
          if (typeof session.organizationId !== 'string') {
            console.log('🚨 Corrupted session detected - organizationId is not a string:', session.organizationId)
            console.log('🧹 Clearing ALL localStorage to prevent corruption')
            localStorage.clear() // Clear all localStorage
            return
          }
          
          console.log('✅ Session validation passed, attempting to validate session')
          await this.validateSession(session)
        } catch (parseError) {
          console.log('🚨 Failed to parse session data:', parseError)
          localStorage.clear() // Clear all localStorage
          return
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error)
      // Clear corrupted session on error
      localStorage.clear() // Clear all localStorage
      this.updateAuthState({ error: 'Failed to initialize authentication' })
    }
  }

  private async validateSession(session: { userId: string; organizationId: string }): Promise<void> {
    try {
      console.log('🔍 Validating session:', session)
      this.updateAuthState({ loading: true })
      
      // Initialize database for the organization
      await databaseService.initializeDatabase(session.organizationId)
      
      // Get user and organization data
      console.log('🔍 Getting user by email:', session.userId)
      const user = await databaseService.getUserByEmail(session.userId)
      console.log('🔍 User found:', user)
      const organization = await databaseService.getOrganization(session.organizationId)
      
      if (user && organization) {
        this.updateAuthState({
          isAuthenticated: true,
          user,
          organization,
          loading: false,
          error: null
        })
      } else {
        this.logout()
      }
    } catch (error) {
      console.error('Session validation failed:', error)
      this.logout()
    }
  }

  async login(email: string, password: string): Promise<AuthState> {
    try {
      console.log('🔍 Login attempt with email:', email)
      this.updateAuthState({ loading: true, error: null })
      
      // Get user by email
      console.log('🔍 Getting user by email:', email)
      const user = await databaseService.getUserByEmail(email)
      console.log('🔍 User found:', user)
      
      if (!user) {
        throw new Error('User not found')
      }
      
      // For demo purposes, check password directly
      // In a real app, you'd compare hashed passwords
      if (user.passwordHash !== password) {
        throw new Error('Invalid password')
      }
      
      // Initialize database for the user's organization
      await databaseService.initializeDatabase(user.organizationId)
      
      // Get organization data
      const organization = await databaseService.getOrganization(user.organizationId)
      
      if (!organization) {
        throw new Error('Organization not found')
      }
      
      // Update last login
      await databaseService.updateUser(user.id, { lastLoginAt: new Date().toISOString() })
      
      const authState: AuthState = {
        isAuthenticated: true,
        user: { ...user, lastLoginAt: new Date().toISOString() },
        organization,
        loading: false,
        error: null
      }
      
      this.updateAuthState(authState)
      
      // Save session
      localStorage.setItem('auth_session', JSON.stringify({
        userId: user.email,
        organizationId: user.organizationId
      }))
      
      return authState
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      this.updateAuthState({
        isAuthenticated: false,
        user: null,
        organization: null,
        loading: false,
        error: errorMessage
      })
      throw error
    }
  }

  async createOrganization(organizationData: {
    name: string
    userEmail: string
    userName: string
    userPassword: string
  }): Promise<AuthState> {
    try {
      this.updateAuthState({ loading: true, error: null })
      
      // Create organization
      const organization = await databaseService.createOrganization({
        name: organizationData.name,
        settings: {
          branding: {
            primaryColor: '#3B82F6',
            secondaryColor: '#1E40AF'
          },
          preferences: {
            defaultTimezone: 'UTC',
            autoSave: true,
            theme: 'system'
          },
          storage: {
            maxStorageGB: 10,
            currentUsageGB: 0
          }
        }
      })
      
      // Initialize database for the new organization
      await databaseService.initializeDatabase(organization.id)
      
      // Create admin user
      const user = await databaseService.createUser({
        email: organizationData.userEmail,
        name: organizationData.userName,
        organizationId: organization.id,
        role: 'admin'
      })
      
      const authState: AuthState = {
        isAuthenticated: true,
        user,
        organization,
        loading: false,
        error: null
      }
      
      this.updateAuthState(authState)
      
      // Save session
      localStorage.setItem('auth_session', JSON.stringify({
        userId: user.email,
        organizationId: user.organizationId
      }))
      
      return authState
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create organization'
      this.updateAuthState({
        isAuthenticated: false,
        user: null,
        organization: null,
        loading: false,
        error: errorMessage
      })
      throw error
    }
  }

  async switchOrganization(organizationId: string): Promise<AuthState> {
    try {
      this.updateAuthState({ loading: true, error: null })
      
      if (!this.currentAuthState.user) {
        throw new Error('No user logged in')
      }
      
      // Check if user has access to this organization
      const user = await databaseService.getUserByEmail(this.currentAuthState.user.email)
      if (!user || user.organizationId !== organizationId) {
        throw new Error('Access denied to this organization')
      }
      
      // Initialize database for the new organization
      await databaseService.initializeDatabase(organizationId)
      
      // Get organization data
      const organization = await databaseService.getOrganization(organizationId)
      
      if (!organization) {
        throw new Error('Organization not found')
      }
      
      const authState: AuthState = {
        isAuthenticated: true,
        user,
        organization,
        loading: false,
        error: null
      }
      
      this.updateAuthState(authState)
      
      // Update session
      localStorage.setItem('auth_session', JSON.stringify({
        userId: user.email,
        organizationId: user.organizationId
      }))
      
      return authState
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to switch organization'
      this.updateAuthState({
        isAuthenticated: false,
        user: null,
        organization: null,
        loading: false,
        error: errorMessage
      })
      throw error
    }
  }

  async getUserOrganizations(): Promise<Organization[]> {
    try {
      if (!this.currentAuthState.user) {
        return []
      }
      
      // For now, return only the current organization
      // In a real multi-tenant system, you'd query all organizations the user has access to
      if (this.currentAuthState.organization) {
        return [this.currentAuthState.organization]
      }
      
      return []
    } catch (error) {
      console.error('Failed to get user organizations:', error)
      return []
    }
  }

  async logout(): Promise<void> {
    try {
      // Close database connection
      await databaseService.close()
      
      // Clear session
      localStorage.removeItem('auth_session')
      
      // Reset auth state
      this.updateAuthState({
        isAuthenticated: false,
        user: null,
        organization: null,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  getAuthState(): AuthState {
    return this.currentAuthState
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private updateAuthState(updates: Partial<AuthState>): void {
    this.currentAuthState = { ...this.currentAuthState, ...updates }
    
    // Update ApiService with current organization ID (avoid circular import)
    if (updates.organization && updates.organization.id) {
      // Import ApiService dynamically to avoid circular dependency
      import('./ApiService').then(({ apiService }) => {
        apiService.setOrganizationId(updates.organization!.id)
        console.log('AuthService notified ApiService of organization change:', updates.organization!.id)
      }).catch(error => {
        console.error('Failed to notify ApiService of organization change:', error)
      })
    }
    
    this.listeners.forEach(listener => listener(this.currentAuthState))
  }

  async updateUserProfile(updates: Partial<User>): Promise<User | null> {
    if (!this.currentAuthState.user) return null
    
    try {
      const updatedUser = await databaseService.updateUser(this.currentAuthState.user.id, updates)
      if (updatedUser) {
        this.updateAuthState({ user: updatedUser })
      }
      return updatedUser
    } catch (error) {
      console.error('Failed to update user profile:', error)
      throw error
    }
  }

  async updateOrganizationSettings(updates: Partial<Organization>): Promise<Organization | null> {
    if (!this.currentAuthState.organization) return null
    
    try {
      const updatedOrganization = await databaseService.updateOrganization(
        this.currentAuthState.organization.id, 
        updates
      )
      if (updatedOrganization) {
        this.updateAuthState({ organization: updatedOrganization })
      }
      return updatedOrganization
    } catch (error) {
      console.error('Failed to update organization settings:', error)
      throw error
    }
  }

  isAuthenticated(): boolean {
    return this.currentAuthState.isAuthenticated
  }

  getCurrentUser(): User | null {
    return this.currentAuthState.user
  }

  getCurrentOrganization(): Organization | null {
    return this.currentAuthState.organization
  }
}

// Singleton instance
export const authService = new AuthService()