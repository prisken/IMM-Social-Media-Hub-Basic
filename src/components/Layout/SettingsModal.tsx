import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/Auth/AuthProvider'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Trash2, User, Building2, AlertTriangle } from 'lucide-react'

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { user, userOrganizations, deleteUser } = useAuth()
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false)
  const [isDeletingUser, setIsDeletingUser] = useState(false)

  const handleDeleteUser = async () => {
    setIsDeletingUser(true)
    try {
      await deleteUser()
    } catch (error) {
      console.error('Failed to delete user:', error)
    } finally {
      setIsDeletingUser(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Account Settings</DialogTitle>
            <DialogDescription>
              Manage your account and preferences
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* User Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Account Information</h3>
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Member since {new Date(user?.createdAt || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Organizations Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Organizations</h3>
              <div className="space-y-2">
                {userOrganizations.map(org => (
                  <div key={org.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Building2 className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{org.name}</p>
                      {org.description && (
                        <p className="text-sm text-muted-foreground">{org.description}</p>
                      )}
                    </div>
                  </div>
                ))}
                {userOrganizations.length === 0 && (
                  <p className="text-sm text-muted-foreground">No organizations found</p>
                )}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-destructive">Danger Zone</h3>
              <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">Delete Account</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteUserDialog(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteUserDialog}
        onOpenChange={setShowDeleteUserDialog}
        onConfirm={handleDeleteUser}
        title="Delete Account"
        description={`Are you sure you want to delete your account "${user?.name}"? This will permanently delete your account, all organizations, posts, media, and data. This action cannot be undone.`}
        confirmText="Delete Account"
        isLoading={isDeletingUser}
        variant="destructive"
      />
    </>
  )
}
