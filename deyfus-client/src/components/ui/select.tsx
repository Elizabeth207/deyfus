import * as React from "react"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <select
          className={`flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors
            file:border-0 file:bg-transparent file:text-sm file:font-medium
            placeholder:text-muted-foreground
            focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? "border-red-500" : ""}
            ${className}`}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm font-medium text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = "Select"

export { Select }