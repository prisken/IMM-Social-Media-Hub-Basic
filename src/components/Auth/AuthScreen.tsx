import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from './AuthProvider'
import { LoginForm } from './LoginForm'
import { CreateAccountForm } from './CreateAccountForm'
import { OrganizationSelectionForm } from './OrganizationSelectionForm'
import { CreateOrganizationForm } from './CreateOrganizationForm'
import { Users, UserPlus, Building2, Sparkles, ArrowLeft } from 'lucide-react'

export function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'create' | 'select-org' | 'create-org'>('login')
  const { error, login, createUser, getAuthState } = useAuth()
  
  const authState = getAuthState()

  // Handle successful login - check if user has organizations
  const handleLoginSuccess = () => {
    if (authState.user && authState.userOrganizations.length === 0) {
      // User has no organizations, direct them to create one
      setMode('create-org')
    } else if (authState.user && authState.userOrganizations.length === 1) {
      // User has one organization, they're automatically logged in
      // The app will redirect to the dashboard
    } else if (authState.user && authState.userOrganizations.length > 1) {
      // User has multiple organizations, show selection
      setMode('select-org')
    }
  }

  // Handle successful account creation
  const handleCreateAccountSuccess = () => {
    // New user needs to create their first organization
    setMode('create-org')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4"
          >
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Social Media Manager
          </h1>
          <p className="text-muted-foreground">
            Organize and schedule your social media content
          </p>
        </div>

        {/* Mode Toggle - only show for login/create */}
        {(mode === 'login' || mode === 'create') && (
          <div className="flex bg-muted rounded-lg p-1 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'login'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="w-4 h-4" />
              Login
            </button>
            <button
              onClick={() => setMode('create')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'create'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Create Account
            </button>
          </div>
        )}

        {/* Back button for organization screens */}
        {(mode === 'select-org' || mode === 'create-org') && (
          <div className="mb-6">
            <button
              onClick={() => setMode('login')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md mb-4"
          >
            {error}
          </motion.div>
        )}

        {/* Forms */}
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: mode === 'login' ? -20 : mode === 'create' ? 20 : 0 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {mode === 'login' && (
            <LoginForm 
              onLoginSuccess={handleLoginSuccess}
            />
          )}
          {mode === 'create' && (
            <CreateAccountForm 
              onCreateSuccess={handleCreateAccountSuccess}
            />
          )}
          {mode === 'select-org' && (
            <OrganizationSelectionForm 
              organizations={authState.userOrganizations}
              onSelectOrganization={async (organizationId) => {
                // Switch to selected organization
                // This will be handled by the auth service
              }}
            />
          )}
          {mode === 'create-org' && (
            <CreateOrganizationForm 
              onCreateSuccess={() => {
                // Organization created successfully, user is now logged in
                // The app will redirect to the dashboard
              }}
            />
          )}
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Secure local storage • No cloud dependencies</p>
        </div>
      </motion.div>
    </div>
  )
}
