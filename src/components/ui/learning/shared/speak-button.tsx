"use client"

import { Volume2 } from "lucide-react"
import { useSpeakSlovak } from "@/hooks/use-speak-slovak"
import { cn } from "@/lib/utils"

export function SpeakButton({ text, className }: { text: string; className?: string }) {
  const speak = useSpeakSlovak()
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        speak(text)
      }}
      className={cn(
        "p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-primary",
        className
      )}
      title="Listen to pronunciation"
    >
      <Volume2 className="w-4 h-4" />
    </button>
  )
}
