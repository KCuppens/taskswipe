"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { TaskCard, Task } from "./task-card"
import { Button } from "./ui/button"
import { Plus } from "lucide-react"

interface SwipeDeckProps {
  tasks: Task[]
  onSwipe: (taskId: string, direction: "right" | "left" | "up" | "down") => void
  onAddTask?: () => void
}

export function SwipeDeck({ tasks, onSwipe, onAddTask }: SwipeDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleSwipe = (direction: "right" | "left" | "up" | "down") => {
    if (currentIndex < tasks.length) {
      onSwipe(tasks[currentIndex].id, direction)
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const visibleTasks = tasks.slice(currentIndex, currentIndex + 3)

  if (tasks.length === 0 || currentIndex >= tasks.length) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-6 text-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Inbox Zero!</h2>
          <p className="text-muted-foreground">
            Great job! You've triaged all your tasks.
          </p>
        </div>
        {onAddTask && (
          <Button onClick={onAddTask} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Add New Task
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="relative flex min-h-[500px] w-full items-center justify-center">
      <div className="relative h-[400px] w-full max-w-md">
        <AnimatePresence>
          {visibleTasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              onSwipe={index === 0 ? handleSwipe : () => {}}
              style={{
                zIndex: visibleTasks.length - index,
                scale: 1 - index * 0.05,
                top: index * 10,
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-sm text-muted-foreground">
        {currentIndex + 1} of {tasks.length} tasks
      </div>
    </div>
  )
}
