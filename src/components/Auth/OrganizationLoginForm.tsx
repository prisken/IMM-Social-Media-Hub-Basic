import React, { useState, useEffect } from 'react'
import { Organization } from '@/types'
import { apiService } from '@/services/ApiService'

interface OrganizationLoginFormProps {
  onLogin: (organizationId: string) => void
  onBack: () => void
}

export const OrganizationLoginForm: React.FC<OrganizationLoginFormProps> = ({
  onLogin,
  onBack
}) => {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

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

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleLogin = () => {
    if (selectedOrganizationId) {
      onLogin(selectedOrganizationId)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mx-auto mb-4"></div>
            <div className="w-48 h-6 bg-gray-200 rounded animate-pulse mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Login
          </button>
          
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Select Organization
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Choose an organization to continue
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Organization List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredOrganizations.map((org) => (
              <button
                key={org.id}
                onClick={() => setSelectedOrganizationId(org.id)}
                className={`w-full p-4 border rounded-lg text-left transition-colors ${
                  selectedOrganizationId === org.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                    style={{ backgroundColor: org.settings?.branding?.primaryColor || '#007bff' }}
                  >
                    {org.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{org.name}</div>
                    <div className="text-sm text-gray-500 truncate">{org.description}</div>
                    {org.website && (
                      <div className="text-xs text-blue-600 truncate">{org.website}</div>
                    )}
                  </div>
                  {selectedOrganizationId === org.id && (
                    <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>

          {filteredOrganizations.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500">No organizations found</div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 hover:text-blue-800 mt-2"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* Login Button */}
          <div>
            <button
              onClick={handleLogin}
              disabled={!selectedOrganizationId}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                selectedOrganizationId
                  ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Continue to {selectedOrganizationId ? organizations.find(o => o.id === selectedOrganizationId)?.name : 'Organization'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrganizationLoginForm
