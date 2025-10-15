import * as React from "react";

import { cn } from "@/lib/utils";
import { Typography } from "./typography";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  isRequired?: boolean;
  // details?: string;
  containerClassName?: string;
  className?: string;
  labelClass?: string;
  error?: string;
  touched?: boolean;
  // search?: boolean;
  leftIcon?: React.ReactNode;
  // rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      className,
      type = "text",
      containerClassName = "",
      isRequired,
      labelClass = "",
      // details,
      error,
      // search,
      touched,
      leftIcon,
      // rightIcon,
      ...props
    },
    ref
  ) => {
    const showError = touched && error;

    return (
      <div
        className={cn("w-full flex flex-col relative mb-4", containerClassName)}
      >
        {label && (
          <Typography
            variant="p"
            className={cn(
              "flex items-center gap-2 font-sans text-neutral-900 md:!text-sm text-xs mb-[5px]",
              labelClass
            )}
          >
            {label}
            {isRequired && <span className="text-[#FD0D0D]">*</span>}
          </Typography>
        )}

        <div className="relative w-full">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              {leftIcon}
            </span>
          )}

          <input
            type={type}
            ref={ref}
            data-slot="input"
            className={cn(
              "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
              className
            )}
            {...props}
          />
        </div>

        {showError && (
          <span className="text-red-500 text-[10px] mt-1 absolute -bottom-4 left-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
