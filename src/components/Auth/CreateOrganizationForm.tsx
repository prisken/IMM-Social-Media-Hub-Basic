import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from './AuthProvider'
import { Building2, User, Mail, Lock, Eye, EyeOff, Plus } from 'lucide-react'

export function CreateOrganizationForm() {
  const [formData, setFormData] = useState({
    organizationName: '',
    userName: '',
    userEmail: '',
    userPassword: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { createOrganization } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.userPassword !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    if (!formData.organizationName || !formData.userName || !formData.userEmail || !formData.userPassword) {
      return
    }

    setIsLoading(true)
    try {
      await createOrganization({
        name: formData.organizationName,
        userEmail: formData.userEmail,
        userName: formData.userName,
        userPassword: formData.userPassword
      })
    } catch (error) {
      console.error('Organization creation failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {/* Organization Name */}
      <div className="space-y-2">
        <label htmlFor="organizationName" className="text-sm font-medium text-foreground">
          Organization Name
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            id="organizationName"
            type="text"
            value={formData.organizationName}
            onChange={(e) => handleInputChange('organizationName', e.target.value)}
            placeholder="Enter organization name"
            className="input pl-10"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* User Name */}
      <div className="space-y-2">
        <label htmlFor="userName" className="text-sm font-medium text-foreground">
          Your Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            id="userName"
            type="text"
            value={formData.userName}
            onChange={(e) => handleInputChange('userName', e.target.value)}
            placeholder="Enter your full name"
            className="input pl-10"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* User Email */}
      <div className="space-y-2">
        <label htmlFor="userEmail" className="text-sm font-medium text-foreground">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            id="userEmail"
            type="email"
            value={formData.userEmail}
            onChange={(e) => handleInputChange('userEmail', e.target.value)}
            placeholder="Enter your email"
            className="input pl-10"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label htmlFor="userPassword" className="text-sm font-medium text-foreground">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            id="userPassword"
            type={showPassword ? 'text' : 'password'}
            value={formData.userPassword}
            onChange={(e) => handleInputChange('userPassword', e.target.value)}
            placeholder="Create a password"
            className="input pl-10 pr-10"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            placeholder="Confirm your password"
            className="input pl-10 pr-10"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            disabled={isLoading}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={isLoading || !formData.organizationName || !formData.userName || !formData.userEmail || !formData.userPassword || !formData.confirmPassword}
        className="btn btn-primary w-full"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="spinner" />
            Creating...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Organization
          </div>
        )}
      </motion.button>
    </motion.form>
  )
}
