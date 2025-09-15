import React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from './AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Calendar, Users } from 'lucide-react'
import { AppOrganization } from '@/services/AuthService'

interface OrganizationSelectionFormProps {
  organizations: AppOrganization[]
  onSelectOrganization: (organizationId: string) => void
}

export function OrganizationSelectionForm({ organizations, onSelectOrganization }: OrganizationSelectionFormProps) {
  const { switchOrganization } = useAuth()

  const handleSelectOrganization = async (organizationId: string) => {
    try {
      await switchOrganization(organizationId)
      onSelectOrganization(organizationId)
    } catch (error) {
      console.error('Failed to switch organization:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Organization</CardTitle>
        <CardDescription>
          Choose which organization you want to work with
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {organizations.map((org) => (
            <motion.div
              key={org.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: organizations.indexOf(org) * 0.1 }}
            >
              <Button
                variant="outline"
                className="w-full h-auto p-4 justify-start"
                onClick={() => handleSelectOrganization(org.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{org.name}</div>
                    {org.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {org.description}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      Created {new Date(org.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>

        {organizations.length === 0 && (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No organizations found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
