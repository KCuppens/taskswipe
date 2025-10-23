import * as React from "react"
import { cn } from "@/lib/utils"

const Toast = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "pointer-events-auto fixed bottom-4 right-4 z-50 flex w-full max-w-md items-center justify-between gap-4 rounded-lg border bg-background p-4 shadow-lg transition-all",
      className
    )}
    {...props}
  />
))
Toast.displayName = "Toast"

export { Toast }
