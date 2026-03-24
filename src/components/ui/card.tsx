"use client"

import * as React from "react"
import { m, type Variants, type HTMLMotionProps } from "motion/react"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div">
>(({ className, children, ...props }, ref) => {
  const isMobile = useIsMobile()

  const mobileVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  }

  // Common motion props
  const motionProps: HTMLMotionProps<"div"> = isMobile ? {
    variants: mobileVariants,
    initial: "hidden",
    whileInView: "visible",
    viewport: { once: true, margin: "-50px" }
  } : {}

  return (
    <m.div
      ref={ref}
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200",
        isMobile ? "will-change-transform" : "hover:shadow-md hover:border-primary/20",
        className
      )}
      {...motionProps}
      {...props}
    >
      {children}
    </m.div>
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
