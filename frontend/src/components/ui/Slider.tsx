"use client"

import * as React from "react"

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value?: number[]
  onValueChange?: (value: number[]) => void
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, ...props }, ref) => {
  return (
    <input
      type="range"
      ref={ref}
      value={value?.[0] || 0}
      onChange={(e) => onValueChange?.([parseFloat(e.target.value)])}
      className={`w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary ${className || ""}`}
      {...props}
    />
  )
})
Slider.displayName = "Slider"

export { Slider }
