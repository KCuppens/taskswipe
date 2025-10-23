"use client"

import { useEffect, useState } from "react"
import { SwipeDeck } from "@/components/swipe-deck"
import { Task } from "@/components/task-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X } from "lucide-react"
import { Toast } from "@/components/ui/toast"

export default function TriagePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [undoStack, setUndoStack] = useState<Array<{ taskId: string; direction: string }>>([])
  const [showUndo, setShowUndo] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks?status=inbox")
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

  const handleSwipe = async (taskId: string, direction: "right" | "left" | "up" | "down") => {
    let newStatus = "inbox"
    let newPriority = null

    switch (direction) {
      case "right":
        newStatus = "today"
        break
      case "left":
        newStatus = "later"
        break
      case "up":
        newStatus = "today"
        newPriority = "quick_win"
        break
      case "down":
        newStatus = "archived"
        break
    }

    try {
      const response = await fetch("/api/tasks/" + taskId, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, priority: newPriority }),
      })

      if (response.ok) {
        setUndoStack((prev) => [...prev, { taskId, direction }])
        setShowUndo(true)
        setTimeout(() => setShowUndo(false), 3000)
      }
    } catch (error) {
      console.error("Failed to update task:", error)
    }
  }

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTaskTitle }),
      })

      if (response.ok) {
        setNewTaskTitle("")
        setShowAddTask(false)
        fetchTasks()
      }
    } catch (error) {
      console.error("Failed to create task:", error)
    }
  }

  const handleUndo = async () => {
    const lastAction = undoStack[undoStack.length - 1]
    if (!lastAction) return

    try {
      const response = await fetch("/api/tasks/" + lastAction.taskId, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "inbox", priority: null }),
      })

      if (response.ok) {
        setUndoStack((prev) => prev.slice(0, -1))
        setShowUndo(false)
        fetchTasks()
      }
    } catch (error) {
      console.error("Failed to undo:", error)
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Task Triage</h1>
            <p className="text-muted-foreground">Swipe to organize your tasks</p>
          </div>
          <Button onClick={() => setShowAddTask(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>

        <div className="rounded-lg border bg-card p-8">
          <div className="mb-4 grid grid-cols-4 gap-4 text-center text-sm">
            <div className="space-y-1">
              <div className="text-2xl">←</div>
              <div className="font-medium">Later</div>
              <div className="text-xs text-muted-foreground">Not urgent</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl">→</div>
              <div className="font-medium text-blue-600">Today</div>
              <div className="text-xs text-muted-foreground">Do today</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl">↑</div>
              <div className="font-medium text-amber-600">Quick Win</div>
              <div className="text-xs text-muted-foreground">&lt; 5 min</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl">↓</div>
              <div className="font-medium text-red-600">Delete</div>
              <div className="text-xs text-muted-foreground">Archive</div>
            </div>
          </div>

          <SwipeDeck
            tasks={tasks}
            onSwipe={handleSwipe}
            onAddTask={() => setShowAddTask(true)}
          />
        </div>
      </div>

      {showAddTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-lg border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add New Task</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAddTask(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Input
              placeholder="What needs to be done?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              autoFocus
            />
            <div className="flex gap-2">
              <Button onClick={handleAddTask} className="flex-1">
                Add Task
              </Button>
              <Button variant="outline" onClick={() => setShowAddTask(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {showUndo && (
        <Toast>
          <span>Task moved</span>
          <Button variant="outline" size="sm" onClick={handleUndo}>
            Undo
          </Button>
        </Toast>
      )}
    </div>
  )
}
