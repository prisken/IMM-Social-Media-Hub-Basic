interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: any
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map()
  private isEnabled: boolean = process.env.NODE_ENV === 'development'

  startTiming(name: string, metadata?: any): void {
    if (!this.isEnabled) return

    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata
    })
  }

  endTiming(name: string): number | null {
    if (!this.isEnabled) return null

    const metric = this.metrics.get(name)
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`)
      return null
    }

    const endTime = performance.now()
    const duration = endTime - metric.startTime

    metric.endTime = endTime
    metric.duration = duration

    // Log slow operations
    if (duration > 1000) { // More than 1 second
      console.warn(`🐌 Slow operation detected: ${name} took ${duration.toFixed(2)}ms`, metric.metadata)
    } else if (duration > 500) { // More than 500ms
      console.log(`⏱️ Operation: ${name} took ${duration.toFixed(2)}ms`, metric.metadata)
    }

    return duration
  }

  measureAsync<T>(name: string, asyncFn: () => Promise<T>, metadata?: any): Promise<T> {
    if (!this.isEnabled) {
      return asyncFn()
    }

    this.startTiming(name, metadata)
    
    return asyncFn().finally(() => {
      this.endTiming(name)
    })
  }

  measureSync<T>(name: string, syncFn: () => T, metadata?: any): T {
    if (!this.isEnabled) {
      return syncFn()
    }

    this.startTiming(name, metadata)
    
    try {
      return syncFn()
    } finally {
      this.endTiming(name)
    }
  }

  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values())
  }

  getSlowOperations(threshold: number = 500): PerformanceMetric[] {
    return this.getMetrics().filter(metric => 
      metric.duration && metric.duration > threshold
    )
  }

  clearMetrics(): void {
    this.metrics.clear()
  }

  generateReport(): string {
    const metrics = this.getMetrics()
    const slowOps = this.getSlowOperations()
    
    let report = `\n📊 Performance Report\n`
    report += `Total operations: ${metrics.length}\n`
    report += `Slow operations (>500ms): ${slowOps.length}\n\n`
    
    if (slowOps.length > 0) {
      report += `🐌 Slow Operations:\n`
      slowOps
        .sort((a, b) => (b.duration || 0) - (a.duration || 0))
        .forEach(metric => {
          report += `  • ${metric.name}: ${metric.duration?.toFixed(2)}ms\n`
        })
    }
    
    return report
  }

  // Component-specific monitoring
  monitorComponentRender(componentName: string, renderFn: () => React.ReactElement): React.ReactElement {
    if (!this.isEnabled) {
      return renderFn()
    }

    return this.measureSync(
      `render-${componentName}`,
      renderFn,
      { component: componentName }
    )
  }

  monitorDataFetch(operationName: string, fetchFn: () => Promise<any>): Promise<any> {
    return this.measureAsync(
      `fetch-${operationName}`,
      fetchFn,
      { operation: operationName }
    )
  }

  monitorUserAction(actionName: string, actionFn: () => void | Promise<void>): void | Promise<void> {
    if (this.isEnabled) {
      this.startTiming(`action-${actionName}`, { action: actionName })
    }

    const result = actionFn()
    
    if (result instanceof Promise) {
      return result.finally(() => {
        if (this.isEnabled) {
          this.endTiming(`action-${actionName}`)
        }
      })
    } else {
      if (this.isEnabled) {
        this.endTiming(`action-${actionName}`)
      }
      return result
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for monitoring component performance
export function usePerformanceMonitor(componentName: string) {
  const startRender = () => {
    performanceMonitor.startTiming(`render-${componentName}`, { component: componentName })
  }

  const endRender = () => {
    performanceMonitor.endTiming(`render-${componentName}`)
  }

  return { startRender, endRender }
}

// Higher-order component for automatic performance monitoring
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component'
  
  const MonitoredComponent = (props: P) => {
    const { startRender, endRender } = usePerformanceMonitor(displayName)
    
    React.useEffect(() => {
      startRender()
      return () => endRender()
    })

    return <WrappedComponent {...props} />
  }

  MonitoredComponent.displayName = `withPerformanceMonitoring(${displayName})`
  return MonitoredComponent
}

// Utility functions for common operations
export const perfUtils = {
  // Monitor database operations
  monitorDbQuery: (queryName: string, queryFn: () => Promise<any>) => {
    return performanceMonitor.monitorDataFetch(`db-${queryName}`, queryFn)
  },

  // Monitor API calls
  monitorApiCall: (endpoint: string, apiCall: () => Promise<any>) => {
    return performanceMonitor.monitorDataFetch(`api-${endpoint}`, apiCall)
  },

  // Monitor file operations
  monitorFileOp: (operation: string, fileOp: () => Promise<any>) => {
    return performanceMonitor.monitorDataFetch(`file-${operation}`, fileOp)
  },

  // Monitor user interactions
  monitorUserAction: (action: string, actionFn: () => void | Promise<void>) => {
    return performanceMonitor.monitorUserAction(action, actionFn)
  }
}
