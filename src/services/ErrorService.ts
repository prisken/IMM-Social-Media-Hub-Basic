import { AppError } from '@/types'

export class ErrorService {
  private static instance: ErrorService
  private errorLog: AppError[] = []
  private maxLogSize = 100

  private constructor() {}

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService()
    }
    return ErrorService.instance
  }

  logError(error: Error | string, context?: string, details?: any): AppError {
    const appError: AppError = {
      code: this.generateErrorCode(),
      message: typeof error === 'string' ? error : error.message,
      details: {
        context,
        ...details,
        stack: typeof error === 'object' && error.stack ? error.stack : undefined
      },
      timestamp: new Date().toISOString()
    }

    this.errorLog.unshift(appError)
    
    // Keep only the most recent errors
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', appError)
    }

    return appError
  }

  getErrors(): AppError[] {
    return [...this.errorLog]
  }

  getRecentErrors(count: number = 10): AppError[] {
    return this.errorLog.slice(0, count)
  }

  clearErrors(): void {
    this.errorLog = []
  }

  getErrorByCode(code: string): AppError | undefined {
    return this.errorLog.find(error => error.code === code)
  }

  private generateErrorCode(): string {
    return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 5).toUpperCase()}`
  }

  // Common error types
  static createValidationError(message: string, field?: string): AppError {
    return {
      code: 'VALIDATION_ERROR',
      message,
      details: { field },
      timestamp: new Date().toISOString()
    }
  }

  static createNetworkError(message: string = 'Network error'): AppError {
    return {
      code: 'NETWORK_ERROR',
      message,
      details: { type: 'network' },
      timestamp: new Date().toISOString()
    }
  }

  static createAuthError(message: string = 'Authentication error'): AppError {
    return {
      code: 'AUTH_ERROR',
      message,
      details: { type: 'authentication' },
      timestamp: new Date().toISOString()
    }
  }

  static createDatabaseError(message: string = 'Database error'): AppError {
    return {
      code: 'DATABASE_ERROR',
      message,
      details: { type: 'database' },
      timestamp: new Date().toISOString()
    }
  }

  static createFileError(message: string = 'File operation error'): AppError {
    return {
      code: 'FILE_ERROR',
      message,
      details: { type: 'file' },
      timestamp: new Date().toISOString()
    }
  }
}

// Export singleton instance
export const errorService = ErrorService.getInstance()
