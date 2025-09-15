import { ApiResponse } from '@/types'

export abstract class BaseService {
  protected async handleRequest<T>(
    request: () => Promise<T>,
    errorMessage: string = 'Request failed'
  ): Promise<ApiResponse<T>> {
    try {
      const data = await request()
      return {
        success: true,
        data,
        message: 'Request completed successfully'
      }
    } catch (error) {
      console.error(`${this.constructor.name}: ${errorMessage}`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : errorMessage
      }
    }
  }

  protected async handleRequestWithRetry<T>(
    request: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    errorMessage: string = 'Request failed'
  ): Promise<ApiResponse<T>> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const data = await request()
        return {
          success: true,
          data,
          message: 'Request completed successfully'
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        if (attempt === maxRetries) {
          break
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }

    console.error(`${this.constructor.name}: ${errorMessage} after ${maxRetries} attempts`, lastError)
    return {
      success: false,
      error: lastError?.message || errorMessage
    }
  }

  protected validateRequired<T extends Record<string, any>>(
    data: T,
    requiredFields: (keyof T)[]
  ): { isValid: boolean; missingFields: string[] } {
    const missingFields: string[] = []
    
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        missingFields.push(String(field))
      }
    }

    return {
      isValid: missingFields.length === 0,
      missingFields
    }
  }

  protected sanitizeData<T extends Record<string, any>>(data: T): T {
    const sanitized = { ...data }
    
    // Remove undefined values
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === undefined) {
        delete sanitized[key]
      }
    })

    return sanitized
  }

  protected generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }

  protected formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    return 'An unknown error occurred'
  }
}
