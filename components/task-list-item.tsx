"use client"

import { Task } from "./task-card"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Check } from "lucide-react"
import { memo } from "react"

interface TaskListItemProps {
  task: Task
  onComplete: (taskId: string) => void
  onSecondaryAction: (taskId: string) => void
  secondaryActionLabel: string
  showPriority?: boolean
}

export const TaskListItem = memo(function TaskListItem({
  task,
  onComplete,
  onSecondaryAction,
  secondaryActionLabel,
  showPriority = true,
}: TaskListItemProps) {
  const isQuickWin = task.priority === "quick_win"

  return (
    <Card className="group transition-all hover:shadow-md active:scale-[0.98]">
      <CardContent className="flex items-center gap-3 p-4 md:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 shrink-0 touch-manipulation md:h-8 md:w-8"
          onClick={() => onComplete(task.id)}
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
          {task.deadline && (
            <p className="text-xs text-amber-600 mt-1">
              Due: {new Date(task.deadline).toLocaleDateString()}
            </p>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-11 px-4 touch-manipulation md:h-9"
          onClick={() => onSecondaryAction(task.id)}
          aria-label={secondaryActionLabel}
        >
          {secondaryActionLabel}
        </Button>
      </CardContent>
    </Card>
  )
})
