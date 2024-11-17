import { cn } from "@/lib/utils"
import React from "react"

interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  left?: React.ReactNode
  center?: React.ReactNode
  right?: React.ReactNode
}

export const Toolbar = ({
  left,
  center,
  right,
  className,
  ...props
}: ToolbarProps) => {
  return (
    <div
      className={cn(
        "z-10 bg-primary/30 absolute  w-full top-0 left-0 right-0 h-16 border-b flex items-center justify-between px-2",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">{left}</div>
      <div className="flex items-center gap-2">{center}</div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  )
}
