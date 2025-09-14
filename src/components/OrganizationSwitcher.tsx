import React, { useState, useEffect } from 'react'
import { Organization } from '@/types'
import { apiService } from '@/services/ApiService'

interface OrganizationSwitcherProps {
  currentOrganizationId: string | null
  onOrganizationChange: (organizationId: string) => void
  className?: string
}

export const OrganizationSwitcher: React.FC<OrganizationSwitcherProps> = ({
  currentOrganizationId,
  onOrganizationChange,
  className = ''
}) => {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadOrganizations()
  }, [])

  const loadOrganizations = async () => {
    try {
      setLoading(true)
      const orgs = await apiService.getAllOrganizations()
      setOrganizations(orgs)
    } catch (error) {
      console.error('Failed to load organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentOrganization = organizations.find(org => org.id === currentOrganizationId)

  const handleOrganizationSelect = (organizationId: string) => {
    onOrganizationChange(organizationId)
    setIsOpen(false)
  }

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Current Organization Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      >
        {currentOrganization && (
          <>
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
              style={{ backgroundColor: currentOrganization.settings?.branding?.primaryColor || '#007bff' }}
            >
              {currentOrganization.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">{currentOrganization.name}</div>
              <div className="text-sm text-gray-500">{currentOrganization.description}</div>
            </div>
          </>
        )}
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Switch Organization
            </div>
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => handleOrganizationSelect(org.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left hover:bg-gray-50 transition-colors ${
                  org.id === currentOrganizationId ? 'bg-blue-50 border border-blue-200' : ''
                }`}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                  style={{ backgroundColor: org.settings?.branding?.primaryColor || '#007bff' }}
                >
                  {org.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{org.name}</div>
                  <div className="text-sm text-gray-500 truncate">{org.description}</div>
                </div>
                {org.id === currentOrganizationId && (
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default OrganizationSwitcher
