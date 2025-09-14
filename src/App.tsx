import React from 'react'
import { useAuth } from '@/components/Auth/AuthProvider'
import { AuthScreen } from '@/components/Auth/AuthScreen'
import { MainLayout } from '@/components/Layout/MainLayout'
import { LoadingScreen } from '@/components/Layout/LoadingScreen'

function App() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <AuthScreen />
  }

  return <MainLayout />
}

export default App
