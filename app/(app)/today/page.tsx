"use client"

import { useEffect, useState } from "react"
import { Task } from "@/components/task-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Check, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export default function TodayPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks?status=today")
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = async (taskId: string) => {
    // Optimistic update
    setTasks((prev) => prev.filter((t) => t.id !== taskId))

    try {
      const response = await fetch("/api/tasks/" + taskId, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
          completedAt: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        // Rollback on error
        fetchTasks()
      }
    } catch (error) {
      console.error("Failed to complete task:", error)
      fetchTasks()
    }
  }

  const handleDefer = async (taskId: string) => {
    // Optimistic update
    setTasks((prev) => prev.filter((t) => t.id !== taskId))

    try {
      const response = await fetch("/api/tasks/" + taskId, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "later" }),
      })

      if (!response.ok) {
        // Rollback on error
        fetchTasks()
      }
    } catch (error) {
      console.error("Failed to defer task:", error)
      fetchTasks()
    }
  }

  const quickWins = tasks.filter((t) => t.priority === "quick_win")
  const normalTasks = tasks.filter((t) => t.priority !== "quick_win")

  if (isLoading) {
    return (
      <div className="container mx-auto min-h-screen p-4">
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <Skeleton className="h-10 w-32 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="flex items-center gap-4 p-4">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-9 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto min-h-screen p-4">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Today</h1>
          <p className="text-muted-foreground">
            {tasks.length} tasks to complete
          </p>
        </div>

        {quickWins.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-600" />
              <h2 className="text-xl font-semibold">Quick Wins</h2>
              <span className="text-sm text-muted-foreground">
                ({quickWins.length})
              </span>
            </div>
            <div className="space-y-2">
              {quickWins.map((task) => (
                <Card key={task.id} className="group transition-all hover:shadow-md active:scale-[0.98]">
                  <CardContent className="flex items-center gap-3 p-4 md:gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 shrink-0 touch-manipulation md:h-8 md:w-8"
                      onClick={() => handleComplete(task.id)}
                      aria-label="Complete task"
                    >
                      <div className="h-6 w-6 rounded-full border-2 border-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center md:h-5 md:w-5">
                        <Check className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100 md:h-3 md:w-3" />
                      </div>
                    </Button>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-11 px-4 touch-manipulation md:h-9"
                      onClick={() => handleDefer(task.id)}
                      aria-label="Defer to later"
                    >
                      Later
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {normalTasks.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Tasks ({normalTasks.length})
            </h2>
            <div className="space-y-2">
              {normalTasks.map((task) => (
                <Card key={task.id} className="group transition-all hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => handleComplete(task.id)}
                    >
                      <div className="h-5 w-5 rounded-full border-2 border-primary group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center">
                        <Check className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                      </div>
                    </Button>
                    <div className="flex-1">
                      <h3 className="font-medium">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      )}
                      {task.deadline && (
                        <p className="text-xs text-amber-600">
                          Due: {new Date(task.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDefer(task.id)}
                    >
                      Later
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tasks.length === 0 && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold">All clear!</h2>
              <p className="text-muted-foreground">
                No tasks scheduled for today. Great job!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
