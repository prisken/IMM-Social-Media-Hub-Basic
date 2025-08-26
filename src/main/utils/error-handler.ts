export interface AppError extends Error {
  code?: string;
  context?: any;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  createError(
    message: string,
    code?: string,
    severity: AppError['severity'] = 'medium',
    context?: any
  ): AppError {
    const error = new Error(message) as AppError;
    error.code = code;
    error.context = context;
    error.timestamp = new Date();
    error.severity = severity;
    return error;
  }

  handleError(error: Error | AppError, context?: string): void {
    const appError = this.isAppError(error) ? error : this.createError(
      error.message,
      'UNKNOWN_ERROR',
      'medium',
      { originalError: error, context }
    );

    this.logError(appError);
    this.notifyError(appError);
  }

  private isAppError(error: Error | AppError): error is AppError {
    return 'timestamp' in error && 'severity' in error;
  }

  private logError(error: AppError): void {
    this.errorLog.push(error);
    
    const logMessage = `[${error.timestamp.toISOString()}] ${error.severity.toUpperCase()}: ${error.message}`;
    
    switch (error.severity) {
      case 'low':
        console.log(logMessage);
        break;
      case 'medium':
        console.warn(logMessage);
        break;
      case 'high':
      case 'critical':
        console.error(logMessage);
        if (error.context) {
          console.error('Context:', error.context);
        }
        break;
    }
  }

  private notifyError(error: AppError): void {
    // For critical errors, we might want to show a user notification
    if (error.severity === 'critical') {
      // In a real app, this would show a user-friendly error dialog
      console.error('CRITICAL ERROR - User notification needed:', error.message);
    }
  }

  getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }

  getErrorsBySeverity(severity: AppError['severity']): AppError[] {
    return this.errorLog.filter(error => error.severity === severity);
  }

  getRecentErrors(limit: number = 10): AppError[] {
    return this.errorLog
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

// Common error codes
export const ErrorCodes = {
  DATABASE_CONNECTION_FAILED: 'DATABASE_CONNECTION_FAILED',
  DATABASE_QUERY_FAILED: 'DATABASE_QUERY_FAILED',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_RATE_LIMIT: 'API_RATE_LIMIT',
  INVALID_INPUT: 'INVALID_INPUT',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  SOCIAL_MEDIA_API_ERROR: 'SOCIAL_MEDIA_API_ERROR',
  AI_GENERATION_FAILED: 'AI_GENERATION_FAILED',
  MEDIA_PROCESSING_FAILED: 'MEDIA_PROCESSING_FAILED'
} as const;

// Utility function to create common errors
export const createCommonError = (
  code: keyof typeof ErrorCodes,
  message: string,
  severity: AppError['severity'] = 'medium',
  context?: any
): AppError => {
  return ErrorHandler.getInstance().createError(
    message,
    ErrorCodes[code],
    severity,
    context
  );
};
