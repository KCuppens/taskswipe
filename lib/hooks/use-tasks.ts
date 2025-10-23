import { useState, useCallback, useEffect } from "react"
import { Task } from "@/components/task-card"

interface UseTasksOptions {
  status?: string
  autoFetch?: boolean
}

export function useTasks({ status, autoFetch = true }: UseTasksOptions = {}) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const url = status ? `/api/tasks?status=${status}` : "/api/tasks"
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error("Failed to fetch tasks")
      }

      const data = await response.json()
      setTasks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Failed to fetch tasks:", err)
    } finally {
      setIsLoading(false)
    }
  }, [status])

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    // Optimistic update
    const previousTasks = tasks
    setTasks((prev) => 
      prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    )

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error("Failed to update task")
      }

      const updatedTask = await response.json()
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updatedTask : task))
      )

      return updatedTask
    } catch (err) {
      // Rollback on error
      setTasks(previousTasks)
      setError(err instanceof Error ? err.message : "Failed to update task")
      throw err
    }
  }, [tasks])

  const deleteTask = useCallback(async (taskId: string) => {
    // Optimistic update
    const previousTasks = tasks
    setTasks((prev) => prev.filter((task) => task.id !== taskId))

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }
    } catch (err) {
      // Rollback on error
      setTasks(previousTasks)
      setError(err instanceof Error ? err.message : "Failed to delete task")
      throw err
    }
  }, [tasks])

  const createTask = useCallback(async (taskData: Partial<Task>) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        throw new Error("Failed to create task")
      }

      const newTask = await response.json()
      setTasks((prev) => [...prev, newTask])
      return newTask
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task")
      throw err
    }
  }, [])

  useEffect(() => {
    if (autoFetch) {
      fetchTasks()
    }
  }, [autoFetch, fetchTasks])

  return {
    tasks,
    isLoading,
    error,
    fetchTasks,
    updateTask,
    deleteTask,
    createTask,
    setTasks,
  }
}
