import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

// Button styles follow echo.uib.no: fully rounded, semibold, 1px border in the darker shade.
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full border font-semibold whitespace-nowrap transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-primary-dark bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary: "border-secondary-dark bg-secondary text-secondary-foreground hover:bg-secondary-hover",
        destructive: "border-destructive-dark bg-destructive text-destructive-foreground hover:bg-destructive-hover",
        outline: "border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
        ghost: "border-transparent hover:bg-accent hover:text-accent-foreground",
        link: "border-transparent text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2 text-sm",
        sm: "h-9 px-4 text-xs",
        lg: "h-11 px-9 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type, ...props }: ButtonProps) {
  return <button type={type ?? "button"} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
