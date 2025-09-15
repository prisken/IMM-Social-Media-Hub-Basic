import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService, AppAuthState, AppUser, AppOrganization } from '@/services/AuthService'

interface AuthContextType {
  authState: AppAuthState
  login: (name: string, password: string) => Promise<void>
  createUser: (name: string, password: string) => Promise<void>
  createOrganization: (name: string, description?: string) => Promise<void>
  switchOrganization: (organizationId: string) => Promise<void>
  deleteUser: () => Promise<void>
  deleteOrganization: (organizationId: string) => Promise<void>
  logout: () => Promise<void>
  getAuthState: () => AppAuthState
  isAuthenticated: boolean
  user: AppUser | null
  currentOrganization: AppOrganization | null
  userOrganizations: AppOrganization[]
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AppAuthState>(authService.getAuthState())

  useEffect(() => {
    const unsubscribe = authService.subscribe(setAuthState)
    return unsubscribe
  }, [])

  const login = async (name: string, password: string) => {
    await authService.login(name, password)
  }

  const createUser = async (name: string, password: string) => {
    await authService.createUser(name, password)
  }

  const createOrganization = async (name: string, description?: string) => {
    await authService.createOrganization(name, description)
  }

  const switchOrganization = async (organizationId: string) => {
    await authService.switchOrganization(organizationId)
  }

  const deleteUser = async () => {
    await authService.deleteUser()
  }

  const deleteOrganization = async (organizationId: string) => {
    await authService.deleteOrganization(organizationId)
  }

  const logout = async () => {
    await authService.logout()
  }

  const getAuthState = () => {
    return authService.getAuthState()
  }

  const value: AuthContextType = {
    authState,
    login,
    createUser,
    createOrganization,
    switchOrganization,
    deleteUser,
    deleteOrganization,
    logout,
    getAuthState,
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    currentOrganization: authState.currentOrganization,
    userOrganizations: authState.userOrganizations,
    loading: authState.loading,
    error: authState.error
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
