// Debounce function for search/input
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

// Throttle function for scroll/resize events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Memoize expensive calculations
export function memoize<T extends (...args: any[]) => any>(
  fn: T
): T {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

// Batch multiple operations
export class BatchQueue<T> {
  private queue: T[] = []
  private timer: NodeJS.Timeout | null = null
  private readonly delay: number
  private readonly handler: (items: T[]) => void

  constructor(handler: (items: T[]) => void, delay: number = 100) {
    this.handler = handler
    this.delay = delay
  }

  add(item: T) {
    this.queue.push(item)

    if (this.timer) {
      clearTimeout(this.timer)
    }

    this.timer = setTimeout(() => {
      this.flush()
    }, this.delay)
  }

  flush() {
    if (this.queue.length > 0) {
      this.handler(this.queue)
      this.queue = []
    }
    
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }
}

// Virtual scrolling helper for large lists
export function getVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 3
) {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  return { startIndex, endIndex }
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return null
  }

  return new IntersectionObserver(callback, {
    rootMargin: "50px",
    threshold: 0.01,
    ...options,
  })
}
