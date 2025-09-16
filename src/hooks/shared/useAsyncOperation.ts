import { useState, useCallback } from 'react'
import { handleError } from '@/utils/errorHandler'

interface AsyncOperationState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface AsyncOperationReturn<T> extends AsyncOperationState<T> {
  execute: (...args: any[]) => Promise<T | null>
  reset: () => void
}

export function useAsyncOperation<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: {
    onSuccess?: (data: T) => void
    onError?: (error: string) => void
    initialData?: T | null
  } = {}
): AsyncOperationReturn<T> {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: options.initialData || null,
    loading: false,
    error: null
  })

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await asyncFunction(...args)
      setState({ data: result, loading: false, error: null })
      options.onSuccess?.(result)
      return result
    } catch (error) {
      const appError = handleError(error, 'Async operation failed')
      setState(prev => ({ ...prev, loading: false, error: appError.message }))
      options.onError?.(appError.message)
      return null
    }
  }, [asyncFunction, options])

  const reset = useCallback(() => {
    setState({ data: options.initialData || null, loading: false, error: null })
  }, [options.initialData])

  return {
    ...state,
    execute,
    reset
  }
}

// Specialized hooks for common operations
export function useApiCall<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: {
    onSuccess?: (data: T) => void
    onError?: (error: string) => void
    initialData?: T | null
  } = {}
) {
  return useAsyncOperation(apiFunction, options)
}

export function useFormSubmission<T = any>(
  submitFunction: (data: T) => Promise<any>,
  options: {
    onSuccess?: (data: any) => void
    onError?: (error: string) => void
  } = {}
) {
  return useAsyncOperation(submitFunction, options)
}

export function useFileUpload(
  uploadFunction: (file: File) => Promise<any>,
  options: {
    onSuccess?: (data: any) => void
    onError?: (error: string) => void
  } = {}
) {
  return useAsyncOperation(uploadFunction, options)
}
