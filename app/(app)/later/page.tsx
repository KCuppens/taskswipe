"use client"

import { useEffect, useState } from "react"
import { Task } from "@/components/task-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Trash2 } from "lucide-react"

export default function LaterPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks?status=later")
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

  const handleMoveToToday = async (taskId: string) => {
    try {
      const response = await fetch("/api/tasks/" + taskId, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "today" }),
      })

      if (response.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId))
      }
    } catch (error) {
      console.error("Failed to move task:", error)
    }
  }

  const handleDelete = async (taskId: string) => {
    try {
      const response = await fetch("/api/tasks/" + taskId, {
        method: "DELETE",
      })

      if (response.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId))
      }
    } catch (error) {
      console.error("Failed to delete task:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading tasks...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto min-h-screen p-4">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Later</h1>
          <p className="text-muted-foreground">
            {tasks.length} tasks deferred for later
          </p>
        </div>

        {tasks.length > 0 ? (
          <div className="space-y-2">
            {tasks.map((task) => (
              <Card key={task.id} className="transition-all hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex-1">
                    <h3 className="font-medium">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-muted-foreground">
                        {task.description}
                      </p>
                    )}
                    {task.deadline && (
                      <p className="text-xs text-muted-foreground">
                        Deadline: {new Date(task.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveToToday(task.id)}
                    >
                      <ArrowRight className="h-4 w-4 mr-1" />
                      Today
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Nothing here</h2>
              <p className="text-muted-foreground">
                No tasks deferred for later
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
