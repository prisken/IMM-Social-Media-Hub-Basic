import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from './AuthProvider'
import { LoginForm } from './LoginForm'
import { CreateOrganizationForm } from './CreateOrganizationForm'
import { OrganizationLoginForm } from './OrganizationLoginForm'
import { Users, Building2, Sparkles, Building } from 'lucide-react'

export function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'create' | 'organization'>('login')
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>('')
  const { error, login, switchOrganization } = useAuth()

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

        {/* Mode Toggle */}
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
            onClick={() => setMode('organization')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              mode === 'organization'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building className="w-4 h-4" />
            Select Org
          </button>
          <button
            onClick={() => setMode('create')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              mode === 'create'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Create Org
          </button>
        </div>

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
          initial={{ opacity: 0, x: mode === 'login' ? -20 : mode === 'organization' ? 0 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {mode === 'login' && <LoginForm selectedOrganizationId={selectedOrganizationId} />}
          {mode === 'organization' && (
            <OrganizationLoginForm 
              onLogin={async (organizationId) => {
                // Auto-login with organization-specific credentials
                const orgCredentials = {
                  '20': { email: 'karma@karmacookie.com', password: 'karma123' }, // Karma Cookie
                  '21': { email: 'persona@personacentric.com', password: 'persona123' }, // Persona Centric
                  '22': { email: 'imm@immlimited.com', password: 'imm123' }, // IMM Limited
                  '23': { email: 'roleplay@roleplay.com', password: 'roleplay123' }, // Roleplay
                  '24': { email: 'foodies@hkfoodies.com', password: 'foodies123' }, // HK Foodies
                  '25': { email: 'drinks@halfdrinks.com', password: 'drinks123' } // 1/2 Drinks
                }
                
                const credentials = orgCredentials[organizationId as keyof typeof orgCredentials]
                if (credentials) {
                  try {
                    await login(credentials.email, credentials.password)
                  } catch (error) {
                    console.error('Auto-login failed:', error)
                  }
                }
              }}
              onBack={() => setMode('login')}
            />
          )}
          {mode === 'create' && <CreateOrganizationForm />}
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Secure local storage • No cloud dependencies</p>
        </div>
      </motion.div>
    </div>
  )
}
