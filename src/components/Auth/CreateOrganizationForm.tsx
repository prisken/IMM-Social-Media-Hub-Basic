import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from './AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Building2 } from 'lucide-react'

interface CreateOrganizationFormProps {
  onCreateSuccess: () => void
}

export function CreateOrganizationForm({ onCreateSuccess }: CreateOrganizationFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { createOrganization } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      return
    }

    setIsLoading(true)
    try {
      await createOrganization(name.trim(), description.trim() || undefined)
      onCreateSuccess()
    } catch (error) {
      console.error('Organization creation failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Organization</CardTitle>
        <CardDescription>
          Set up your first organization to get started with social media management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter organization name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your organization..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Organization...
              </>
            ) : (
              <>
                <Building2 className="w-4 h-4 mr-2" />
                Create Organization
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start space-x-3">
            <Building2 className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">What happens next?</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Once you create your organization, you'll have access to:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• Post creation and scheduling</li>
                <li>• Media management</li>
                <li>• Content calendar</li>
                <li>• Analytics and insights</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
