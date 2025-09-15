import React from 'react'
import { DEFAULT_VALUES, STORAGE_KEYS } from '@/constants'

export interface AppConfig {
  theme: 'light' | 'dark' | 'system'
  sidebarCollapsed: boolean
  autoSave: boolean
  autoSaveInterval: number
  refreshInterval: number
  maxFileSize: number
  enableNotifications: boolean
  enableKeyboardShortcuts: boolean
  enableAutoComplete: boolean
  defaultPlatform: string
  defaultPostType: string
  timezone: string
  dateFormat: string
  timeFormat: string
}

export class ConfigService {
  private static instance: ConfigService
  private config: AppConfig
  private listeners: Array<(config: AppConfig) => void> = []

  private constructor() {
    this.config = this.loadConfig()
  }

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService()
    }
    return ConfigService.instance
  }

  private loadConfig(): AppConfig {
    const defaultConfig: AppConfig = {
      theme: DEFAULT_VALUES.THEME,
      sidebarCollapsed: false,
      autoSave: true,
      autoSaveInterval: DEFAULT_VALUES.AUTO_SAVE_INTERVAL,
      refreshInterval: DEFAULT_VALUES.REFRESH_INTERVAL,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      enableNotifications: true,
      enableKeyboardShortcuts: true,
      enableAutoComplete: true,
      defaultPlatform: DEFAULT_VALUES.POST_PLATFORM,
      defaultPostType: DEFAULT_VALUES.POST_TYPE,
      timezone: DEFAULT_VALUES.TIMEZONE,
      dateFormat: 'MMM dd, yyyy',
      timeFormat: 'HH:mm'
    }

    try {
      const savedConfig = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS)
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig)
        return { ...defaultConfig, ...parsed }
      }
    } catch (error) {
      console.error('Failed to load config:', error)
    }

    return defaultConfig
  }

  private saveConfig(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(this.config))
    } catch (error) {
      console.error('Failed to save config:', error)
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.config }))
  }

  getConfig(): AppConfig {
    return { ...this.config }
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key]
  }

  set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    this.config[key] = value
    this.saveConfig()
    this.notifyListeners()
  }

  update(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates }
    this.saveConfig()
    this.notifyListeners()
  }

  reset(): void {
    this.config = this.loadConfig()
    this.saveConfig()
    this.notifyListeners()
  }

  subscribe(listener: (config: AppConfig) => void): () => void {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // Convenience methods
  getTheme(): AppConfig['theme'] {
    return this.config.theme
  }

  setTheme(theme: AppConfig['theme']): void {
    this.set('theme', theme)
  }

  isSidebarCollapsed(): boolean {
    return this.config.sidebarCollapsed
  }

  setSidebarCollapsed(collapsed: boolean): void {
    this.set('sidebarCollapsed', collapsed)
  }

  isAutoSaveEnabled(): boolean {
    return this.config.autoSave
  }

  setAutoSave(enabled: boolean): void {
    this.set('autoSave', enabled)
  }

  getAutoSaveInterval(): number {
    return this.config.autoSaveInterval
  }

  setAutoSaveInterval(interval: number): void {
    this.set('autoSaveInterval', interval)
  }

  getRefreshInterval(): number {
    return this.config.refreshInterval
  }

  setRefreshInterval(interval: number): void {
    this.set('refreshInterval', interval)
  }

  getMaxFileSize(): number {
    return this.config.maxFileSize
  }

  setMaxFileSize(size: number): void {
    this.set('maxFileSize', size)
  }

  areNotificationsEnabled(): boolean {
    return this.config.enableNotifications
  }

  setNotificationsEnabled(enabled: boolean): void {
    this.set('enableNotifications', enabled)
  }

  areKeyboardShortcutsEnabled(): boolean {
    return this.config.enableKeyboardShortcuts
  }

  setKeyboardShortcutsEnabled(enabled: boolean): void {
    this.set('enableKeyboardShortcuts', enabled)
  }

  isAutoCompleteEnabled(): boolean {
    return this.config.enableAutoComplete
  }

  setAutoCompleteEnabled(enabled: boolean): void {
    this.set('enableAutoComplete', enabled)
  }

  getDefaultPlatform(): string {
    return this.config.defaultPlatform
  }

  setDefaultPlatform(platform: string): void {
    this.set('defaultPlatform', platform)
  }

  getDefaultPostType(): string {
    return this.config.defaultPostType
  }

  setDefaultPostType(type: string): void {
    this.set('defaultPostType', type)
  }

  getTimezone(): string {
    return this.config.timezone
  }

  setTimezone(timezone: string): void {
    this.set('timezone', timezone)
  }

  getDateFormat(): string {
    return this.config.dateFormat
  }

  setDateFormat(format: string): void {
    this.set('dateFormat', format)
  }

  getTimeFormat(): string {
    return this.config.timeFormat
  }

  setTimeFormat(format: string): void {
    this.set('timeFormat', format)
  }
}

// Export singleton instance
export const configService = ConfigService.getInstance()

// React hook for using config
export function useConfig() {
  const [config, setConfig] = React.useState<AppConfig>(configService.getConfig())

  React.useEffect(() => {
    const unsubscribe = configService.subscribe(setConfig)
    return unsubscribe
  }, [])

  return {
    config,
    get: configService.get.bind(configService),
    set: configService.set.bind(configService),
    update: configService.update.bind(configService),
    reset: configService.reset.bind(configService)
  }
}
