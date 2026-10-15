import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", {
  variants: {
    variant: {
      covered: "border-success-dark bg-success text-success-foreground",
      partial: "border-warning-dark bg-warning text-warning-foreground",
      missing: "border-destructive-dark bg-destructive text-destructive-foreground",
      outline: "border-border text-muted-foreground",
      secondary: "border-secondary-dark bg-secondary text-secondary-foreground",
    },
  },
  defaultVariants: { variant: "outline" },
});

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
