"use client";

import { useState, useTransition } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";

// Two-step destructive button: first click asks for confirmation, second click runs the action.
// (Avoids browser confirm() dialogs.)
export function ConfirmButton({
  label,
  confirmLabel,
  onConfirm,
  ...props
}: Omit<ButtonProps, "onClick"> & { label: string; confirmLabel: string; onConfirm: () => Promise<unknown> }) {
  const [armed, setArmed] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant={armed ? "destructive" : "outline"}
      disabled={pending}
      onBlur={() => setArmed(false)}
      onClick={() => {
        if (!armed) return setArmed(true);
        startTransition(async () => {
          await onConfirm();
          setArmed(false);
        });
      }}
      {...props}
    >
      {armed ? confirmLabel : label}
    </Button>
  );
}
