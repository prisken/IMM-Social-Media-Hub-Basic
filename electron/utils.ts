import { app } from 'electron'
import { join } from 'path'

export function isDev(): boolean {
  return process.env.NODE_ENV === 'development' || !app.isPackaged
}

export function getAppDataPath(): string {
  return app.getPath('userData')
}

export function getAssetsPath(): string {
  return join(getAppDataPath(), 'assets')
}

export function getOrganizationsPath(): string {
  return join(getAppDataPath(), 'organizations')
}

export function getOrganizationPath(orgId: string): string {
  return join(getOrganizationsPath(), orgId)
}

export function getMediaPath(orgId: string): string {
  return join(getOrganizationPath(orgId), 'media')
}

export function getDatabasePath(orgId: string): string {
  return join(getOrganizationPath(orgId), 'database.sqlite')
}
