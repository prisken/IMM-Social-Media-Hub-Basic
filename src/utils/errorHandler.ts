import { ERROR_MESSAGES } from '@/constants/ui'

export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: string
}

export class ErrorHandler {
  private static instance: ErrorHandler
  private errorLog: AppError[] = []

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  // Handle different types of errors
  handleError(error: unknown, context?: string): AppError {
    const appError = this.createAppError(error, context)
    this.logError(appError)
    return appError
  }

  // Create standardized error object
  private createAppError(error: unknown, context?: string): AppError {
    const timestamp = new Date().toISOString()
    
    if (error instanceof Error) {
      return {
        code: this.getErrorCode(error),
        message: this.getErrorMessage(error),
        details: {
          stack: error.stack,
          context,
          name: error.name
        },
        timestamp
      }
    }

    if (typeof error === 'string') {
      return {
        code: 'UNKNOWN_ERROR',
        message: error,
        details: { context },
        timestamp
      }
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: ERROR_MESSAGES.SERVER_ERROR,
      details: { error, context },
      timestamp
    }
  }

  // Get error code based on error type
  private getErrorCode(error: Error): string {
    if (error.name === 'NetworkError' || error.message.includes('network')) {
      return 'NETWORK_ERROR'
    }
    
    if (error.name === 'ValidationError' || error.message.includes('validation')) {
      return 'VALIDATION_ERROR'
    }
    
    if (error.name === 'UnauthorizedError' || error.message.includes('unauthorized')) {
      return 'UNAUTHORIZED'
    }
    
    if (error.name === 'NotFoundError' || error.message.includes('not found')) {
      return 'NOT_FOUND'
    }
    
    return 'UNKNOWN_ERROR'
  }

  // Get user-friendly error message
  private getErrorMessage(error: Error): string {
    const code = this.getErrorCode(error)
    
    switch (code) {
      case 'NETWORK_ERROR':
        return ERROR_MESSAGES.NETWORK_ERROR
      case 'VALIDATION_ERROR':
        return ERROR_MESSAGES.VALIDATION_ERROR
      case 'UNAUTHORIZED':
        return ERROR_MESSAGES.UNAUTHORIZED
      case 'NOT_FOUND':
        return ERROR_MESSAGES.NOT_FOUND
      default:
        return error.message || ERROR_MESSAGES.SERVER_ERROR
    }
  }

  // Log error for debugging
  private logError(error: AppError): void {
    this.errorLog.push(error)
    
    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100)
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', error)
    }
  }

  // Get error log
  getErrorLog(): AppError[] {
    return [...this.errorLog]
  }

  // Clear error log
  clearErrorLog(): void {
    this.errorLog = []
  }

  // Get last error
  getLastError(): AppError | null {
    return this.errorLog.length > 0 ? this.errorLog[this.errorLog.length - 1] : null
  }
}

// Convenience function for handling errors
export const handleError = (error: unknown, context?: string): AppError => {
  return ErrorHandler.getInstance().handleError(error, context)
}

// Async error wrapper
export const withErrorHandling = async <T>(
  asyncFn: () => Promise<T>,
  context?: string
): Promise<T> => {
  try {
    return await asyncFn()
  } catch (error) {
    const appError = handleError(error, context)
    throw appError
  }
}

// Error boundary helper
export const getErrorBoundaryProps = (error: AppError) => ({
  error: {
    name: error.code,
    message: error.message,
    stack: error.details?.stack
  }
})

// Validation error helper
export const createValidationError = (field: string, message: string): AppError => ({
  code: 'VALIDATION_ERROR',
  message: `${field}: ${message}`,
  details: { field, validationMessage: message },
  timestamp: new Date().toISOString()
})

// Network error helper
export const createNetworkError = (url: string, status?: number): AppError => ({
  code: 'NETWORK_ERROR',
  message: ERROR_MESSAGES.NETWORK_ERROR,
  details: { url, status },
  timestamp: new Date().toISOString()
})

// File upload error helpers
export const createFileTooLargeError = (filename: string, size: number, maxSize: number): AppError => ({
  code: 'FILE_TOO_LARGE',
  message: ERROR_MESSAGES.FILE_TOO_LARGE,
  details: { filename, size, maxSize },
  timestamp: new Date().toISOString()
})

export const createInvalidFileTypeError = (filename: string, type: string, allowedTypes: string[]): AppError => ({
  code: 'INVALID_FILE_TYPE',
  message: ERROR_MESSAGES.INVALID_FILE_TYPE,
  details: { filename, type, allowedTypes },
  timestamp: new Date().toISOString()
})

// Database error helpers
export const createDatabaseError = (operation: string, details?: any): AppError => ({
  code: 'DATABASE_ERROR',
  message: 'Database operation failed',
  details: { operation, ...details },
  timestamp: new Date().toISOString()
})

// Authentication error helpers
export const createAuthError = (reason: string): AppError => ({
  code: 'AUTH_ERROR',
  message: 'Authentication failed',
  details: { reason },
  timestamp: new Date().toISOString()
})

// Permission error helpers
export const createPermissionError = (resource: string, action: string): AppError => ({
  code: 'PERMISSION_ERROR',
  message: 'Insufficient permissions',
  details: { resource, action },
  timestamp: new Date().toISOString()
})

// Rate limit error helpers
export const createRateLimitError = (limit: number, window: string): AppError => ({
  code: 'RATE_LIMIT_ERROR',
  message: 'Rate limit exceeded',
  details: { limit, window },
  timestamp: new Date().toISOString()
})

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance()
