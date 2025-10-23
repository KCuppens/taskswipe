"use client"

import { motion, useMotionValue, useTransform } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, ArrowLeft, ArrowUp, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Task {
  id: string
  title: string
  description?: string | null
  status: string
  priority?: string | null
  deadline?: Date | string | null
  recurring?: string | null
}

interface TaskCardProps {
  task: Task
  onSwipe: (direction: "right" | "left" | "up" | "down") => void
  style?: React.CSSProperties
}

export function TaskCard({ task, onSwipe, style }: TaskCardProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateZ = useTransform(x, [-200, 200], [-15, 15])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  const rightOpacity = useTransform(x, [0, 100], [0, 1])
  const leftOpacity = useTransform(x, [-100, 0], [1, 0])
  const upOpacity = useTransform(y, [-100, 0], [1, 0])
  const downOpacity = useTransform(y, [0, 100], [0, 1])

  // Haptic feedback on mobile
  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10)
    }
  }

  const handleDragEnd = () => {
    const xValue = x.get()
    const yValue = y.get()
    const threshold = 150

    if (Math.abs(xValue) > Math.abs(yValue)) {
      if (xValue > threshold) {
        triggerHaptic()
        onSwipe("right")
      } else if (xValue < -threshold) {
        triggerHaptic()
        onSwipe("left")
      }
    } else {
      if (yValue < -threshold) {
        triggerHaptic()
        onSwipe("up")
      } else if (yValue > threshold) {
        triggerHaptic()
        onSwipe("down")
      }
    }
  }

  const formatDeadline = (deadline: Date | string | null | undefined) => {
    if (!deadline) return null
    const date = new Date(deadline)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const dateStr = date.toDateString()
    const todayStr = today.toDateString()
    const tomorrowStr = tomorrow.toDateString()

    if (dateStr === todayStr) {
      return { text: "Due today", urgent: true }
    } else if (dateStr === tomorrowStr) {
      return { text: "Due tomorrow", urgent: false }
    } else if (date < today) {
      return { text: "Overdue", urgent: true }
    } else {
      const formatted = date.toLocaleDateString()
      return { text: "Due " + formatted, urgent: false }
    }
  }

  const deadlineInfo = formatDeadline(task.deadline)

  return (
    <motion.div
      style={{
        x,
        y,
        rotateZ,
        opacity,
        position: "absolute",
        cursor: "grab",
        ...style,
      }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: "grabbing", scale: 0.98 }}
      className="w-full max-w-[90vw] sm:max-w-md touch-none"
    >
      <Card className="relative overflow-hidden shadow-xl transition-shadow hover:shadow-2xl">
        <motion.div
          style={{ opacity: rightOpacity }}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
        >
          <div className="flex flex-col items-center gap-2 rounded-lg bg-blue-500/90 p-4 text-white">
            <ArrowRight className="h-8 w-8" />
            <span className="text-sm font-semibold">Today</span>
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: leftOpacity }}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
        >
          <div className="flex flex-col items-center gap-2 rounded-lg bg-gray-500/90 p-4 text-white">
            <ArrowLeft className="h-8 w-8" />
            <span className="text-sm font-semibold">Later</span>
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: upOpacity }}
          className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2 rounded-lg bg-amber-500/90 p-4 text-white">
            <ArrowUp className="h-8 w-8" />
            <span className="text-sm font-semibold">Quick Win</span>
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: downOpacity }}
          className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2 rounded-lg bg-red-500/90 p-4 text-white">
            <Trash2 className="h-8 w-8" />
            <span className="text-sm font-semibold">Delete</span>
          </div>
        </motion.div>

        <CardContent className="p-8">
          <div className="space-y-4">
            {deadlineInfo && (
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
                  deadlineInfo.urgent
                    ? "bg-red-500/10 text-red-600"
                    : "bg-amber-500/10 text-amber-600"
                )}
              >
                {deadlineInfo.urgent && "🔥"}
                {!deadlineInfo.urgent && "⚠️"}
                {deadlineInfo.text}
              </div>
            )}
            {task.recurring && (
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600">
                🔄 {task.recurring}
              </div>
            )}
            <h3 className="text-2xl font-semibold">{task.title}</h3>
            {task.description && (
              <p className="text-muted-foreground">{task.description}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
