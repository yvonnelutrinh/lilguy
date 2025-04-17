import * as React from "react"
import { classNameMerge } from "@/lib/utils"
import PixelWindow from '../UI/PixelWindow';

// Pixel Card component that uses the PixelWindow internally
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { title?: string; headerColor?: string; showControls?: boolean }
>(({ className, title, headerColor, showControls = false, children, ...props }, ref) => {
  // If title is provided, use PixelWindow with a header, otherwise use a div that looks like the content area
  if (title) {
    return (
      <PixelWindow
        title={title}
        headerColor={headerColor}
        showControls={showControls}
        className={className}
        ref={ref as any}
        {...props}
      >
        {children}
      </PixelWindow>
    )
  }
  
  return (
    <div
      ref={ref}
      className={classNameMerge(
        "pixel-window bg-card text-card-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={classNameMerge("flex flex-col space-y-1.5 p-6 md:p-0 md:pt-[1rem]", className)}
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
    className={classNameMerge(
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
    className={classNameMerge("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={classNameMerge("p-6 pt-0 md:p-0 md:pt-[1rem]", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={classNameMerge("flex items-center p-6 pt-0 md:p-0 md:pt-[1rem]", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }