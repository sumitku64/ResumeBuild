import * as React from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  animated?: boolean
  status?: 'default' | 'success' | 'error' | 'warning'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, animated = true, status = 'default', ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    
    const statusClasses = {
      default: "border-input focus-visible:ring-ring",
      success: "border-green-500 focus-visible:ring-green-500/20",
      error: "border-red-500 focus-visible:ring-red-500/20",
      warning: "border-yellow-500 focus-visible:ring-yellow-500/20"
    }

    const inputProps = {
      type,
      className: cn(
        "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200",
        statusClasses[status],
        className
      ),
      ref,
      onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true)
        props.onFocus?.(e)
      },
      onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false)
        props.onBlur?.(e)
      },
      ...props
    }

    if (animated) {
      return (
        <motion.input
          {...inputProps}
          animate={{
            scale: isFocused ? 1.01 : 1,
            borderColor: isFocused ? "hsl(var(--primary))" : "hsl(var(--border))"
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      )
    }

    return <input {...inputProps} />
  }
)
Input.displayName = "Input"

export { Input }
