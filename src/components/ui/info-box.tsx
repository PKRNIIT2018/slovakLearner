import React from 'react'
import { Info, AlertTriangle, Lightbulb, ShieldCheck, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface InfoBoxProps {
    children: React.ReactNode
    variant?: 'info' | 'warning' | 'tip' | 'important' | 'danger' | 'success'
    title?: string
    className?: string
}

const variants = {
    info: {
        icon: Info,
        bg: "bg-blue-50 dark:bg-blue-950/30",
        border: "border-blue-200 dark:border-blue-800",
        text: "text-blue-900 dark:text-blue-200",
        iconColor: "text-blue-600 dark:text-blue-400"
    },
    warning: {
        icon: AlertTriangle,
        bg: "bg-amber-50 dark:bg-amber-950/30",
        border: "border-amber-200 dark:border-amber-800",
        text: "text-amber-900 dark:text-amber-200",
        iconColor: "text-amber-600 dark:text-amber-400"
    },
    tip: {
        icon: Lightbulb,
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        border: "border-emerald-200 dark:border-emerald-800",
        text: "text-emerald-900 dark:text-emerald-200",
        iconColor: "text-emerald-600 dark:text-emerald-400"
    },
    important: {
        icon: ShieldCheck,
        bg: "bg-primary/5 dark:bg-primary/10",
        border: "border-primary/20",
        text: "text-foreground",
        iconColor: "text-primary"
    },
    danger: {
        icon: AlertTriangle,
        bg: "bg-red-50 dark:bg-red-950/30",
        border: "border-red-200 dark:border-red-800",
        text: "text-red-900 dark:text-red-200",
        iconColor: "text-red-600 dark:text-red-400"
    },
    success: {
        icon: CheckCircle2,
        bg: "bg-green-50 dark:bg-green-950/30",
        border: "border-green-200 dark:border-green-800",
        text: "text-green-900 dark:text-green-200",
        iconColor: "text-green-600 dark:text-green-400"
    }
}

export const InfoBox: React.FC<InfoBoxProps> = ({
    children,
    variant = 'info',
    title,
    className
}) => {
    const config = variants[variant]
    const Icon = config.icon

    return (
        <div className={cn(
            "my-8 p-5 rounded-2xl border-2 flex gap-4 transition-all shadow-xs",
            config.bg,
            config.border,
            className
        )}>
            <div className={cn("shrink-0 w-10 h-10 rounded-xl bg-white dark:bg-black/20 flex items-center justify-center shadow-inner", config.iconColor)}>
                <Icon size={20} />
            </div>
            <div className="space-y-1">
                {title && <h4 className={cn("font-bold text-base leading-none mb-2", config.text)}>{title}</h4>}
                <div className={cn("text-sm leading-relaxed", config.text)}>
                    {children}
                </div>
            </div>
        </div>
    )
}
