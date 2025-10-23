"use client"

import { useEffect, useState } from "react"
import { SwipeDeck } from "@/components/swipe-deck"
import { Task } from "@/components/task-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { Toast } from "@/components/ui/toast"

export default function TriagePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [undoStack, setUndoStack] = useState<Array<{ task: Task; previousStatus: string }>>([])
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
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

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

    // Optimistic update: remove task from list immediately
    setTasks(prev => prev.filter(t => t.id !== taskId))

    // Store for undo
    setUndoStack([{ task, previousStatus: task.status }])
    setShowUndo(true)
    setTimeout(() => setShowUndo(false), 5000)

    try {
      const response = await fetch("/api/tasks/" + taskId, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, priority: newPriority }),
      })

      if (!response.ok) {
        // Rollback on error
        setTasks(prev => [...prev, task])
        setShowUndo(false)
      }
    } catch (error) {
      console.error("Failed to update task:", error)
      // Rollback on error
      setTasks(prev => [...prev, task])
      setShowUndo(false)
    }
  }

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return

    setIsCreating(true)

    // Create temporary task with client-side ID for optimistic UI
    const tempTask: Task = {
      id: `temp-${Date.now()}`,
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim() || null,
      status: "inbox",
      priority: null,
      deadline: null,
      completedAt: null,
      recurring: null,
      recurData: null,
      position: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: "temp",
    }

    // Optimistic update: add task to list immediately
    setTasks(prev => [tempTask, ...prev])

    // Close modal and reset form
    setShowAddTask(false)
    setNewTaskTitle("")
    setNewTaskDescription("")

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          description: newTaskDescription.trim() || undefined,
          status: "inbox"
        }),
      })

      if (response.ok) {
        const createdTask = await response.json()
        // Replace temporary task with real task from server
        setTasks(prev => prev.map(t => t.id === tempTask.id ? createdTask : t))
      } else {
        // Remove temp task on error
        setTasks(prev => prev.filter(t => t.id !== tempTask.id))
        alert("Failed to create task. Please try again.")
      }
    } catch (error) {
      console.error("Failed to create task:", error)
      // Remove temp task on error
      setTasks(prev => prev.filter(t => t.id !== tempTask.id))
      alert("Failed to create task. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  const handleUndo = async () => {
    const lastAction = undoStack[undoStack.length - 1]
    if (!lastAction) return

    const { task, previousStatus } = lastAction

    // Optimistic update: add task back to list
    setTasks(prev => [task, ...prev])
    setShowUndo(false)

    try {
      const response = await fetch("/api/tasks/" + task.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: previousStatus, priority: null }),
      })

      if (!response.ok) {
        // Rollback on error
        setTasks(prev => prev.filter(t => t.id !== task.id))
      }
    } catch (error) {
      console.error("Failed to undo:", error)
      // Rollback on error
      setTasks(prev => prev.filter(t => t.id !== task.id))
    } finally {
      setUndoStack([])
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
              <div className="font-medium text-red-600">Archive</div>
              <div className="text-xs text-muted-foreground">Delete</div>
            </div>
          </div>

          <SwipeDeck
            tasks={tasks}
            onSwipe={handleSwipe}
            onAddTask={() => setShowAddTask(true)}
          />
        </div>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task to add to your inbox
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="What needs to be done?"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAddTask()}
                autoFocus
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add more details... (optional)"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                disabled={isCreating}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddTask(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim() || isCreating}
            >
              {isCreating ? "Creating..." : "Add Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Undo Toast */}
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
