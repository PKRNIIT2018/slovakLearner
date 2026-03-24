"use client"

import { cn } from "@/lib/utils"

interface ProgressRingProps {
  value: number // 0 to 1
  size?: number
  strokeWidth?: number
  className?: string
  label?: string
}

export function ProgressRing({
  value,
  size = 32,
  strokeWidth = 3,
  className,
  label,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - value * circumference

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset }}
          strokeLinecap="round"
          className={cn(
            "transition-all duration-700 ease-in-out",
            value === 1 ? "text-green-500" : "text-primary"
          )}
        />
      </svg>
      {label && (
        <span className="absolute text-[8px] font-black tracking-tighter text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  )
}
