import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-semibold", {
  variants: {
    variant: {
      covered: "border-transparent bg-marker-covered text-foreground",
      partial: "border-transparent bg-marker-partial text-foreground",
      missing: "border-transparent bg-marker-missing text-foreground",
      outline: "border-border text-muted-foreground",
      secondary: "border-transparent bg-secondary text-secondary-foreground",
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
