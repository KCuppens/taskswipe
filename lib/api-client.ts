class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = "APIError"
  }
}

async function fetchAPI<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "An error occurred" }))
    throw new APIError(response.status, error.error || error.message || "Request failed")
  }

  return response.json()
}

export const api = {
  tasks: {
    getAll: (status?: string) => 
      fetchAPI<any[]>(status ? `/api/tasks?status=${status}` : "/api/tasks"),
    
    create: (data: any) => 
      fetchAPI("/api/tasks", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    
    update: (id: string, data: any) => 
      fetchAPI(`/api/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    
    delete: (id: string) => 
      fetchAPI(`/api/tasks/${id}`, { method: "DELETE" }),
  },

  auth: {
    signup: (data: { name: string; email: string; password: string }) =>
      fetchAPI("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
}

// Request deduplication cache
const requestCache = new Map<string, Promise<any>>()
const CACHE_TTL = 5000 // 5 seconds

export function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = requestCache.get(key)
  
  if (cached) {
    return cached
  }

  const promise = fetcher().finally(() => {
    setTimeout(() => requestCache.delete(key), CACHE_TTL)
  })

  requestCache.set(key, promise)
  return promise
}
