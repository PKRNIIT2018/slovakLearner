"use client"

import { cn } from "@/lib/utils"

const BOX_DOT: Record<1 | 2 | 3, { color: string; title: string }> = {
  1: { color: "bg-yellow-400",  title: "Box 1 — review every session" },
  2: { color: "bg-orange-400",  title: "Box 2 — review every 3 days" },
  3: { color: "bg-green-500",   title: "Box 3 — review every 7 days" },
}

export function BoxDot({ box }: { box?: 1 | 2 | 3 }) {
  if (!box) return null
  const { color, title } = BOX_DOT[box]
  return <span className={cn("inline-block w-2 h-2 rounded-full shrink-0", color)} title={title} />
}
