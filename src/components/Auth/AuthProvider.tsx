import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService, AuthService } from '@/services/AuthService'
import { AuthState } from '@/types'

interface AuthContextType {
  authState: AuthState
  login: (email: string, password: string) => Promise<void>
  createOrganization: (data: {
    name: string
    userEmail: string
    userName: string
    userPassword: string
  }) => Promise<void>
  switchOrganization: (organizationId: string) => Promise<void>
  logout: () => Promise<void>
  updateUserProfile: (updates: any) => Promise<void>
  updateOrganizationSettings: (updates: any) => Promise<void>
  isAuthenticated: boolean
  user: any
  organization: any
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(authService.getAuthState())

  useEffect(() => {
    const unsubscribe = authService.subscribe(setAuthState)
    return unsubscribe
  }, [])

  const login = async (email: string, password: string) => {
    await authService.login(email, password)
  }

  const createOrganization = async (data: {
    name: string
    userEmail: string
    userName: string
    userPassword: string
  }) => {
    await authService.createOrganization(data)
  }

  const switchOrganization = async (organizationId: string) => {
    await authService.switchOrganization(organizationId)
  }

  const logout = async () => {
    await authService.logout()
  }

  const updateUserProfile = async (updates: any) => {
    await authService.updateUserProfile(updates)
  }

  const updateOrganizationSettings = async (updates: any) => {
    await authService.updateOrganizationSettings(updates)
  }

  const value: AuthContextType = {
    authState,
    login,
    createOrganization,
    switchOrganization,
    logout,
    updateUserProfile,
    updateOrganizationSettings,
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    organization: authState.organization,
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
