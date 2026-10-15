"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import { HighlightedText } from "@/components/analysis/highlighted-text";
import { Button } from "@/components/ui/button";
import type { Requirement } from "@/lib/ai/schemas";

// Slide-over panel that shows a full document (CV or posting) with the current highlight.
export function DocumentDrawer({
  title,
  text,
  phrase,
  status,
  onClose,
}: {
  title: string;
  text: string;
  phrase: string | null;
  status?: Requirement["status"];
  onClose: () => void;
}) {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" className="absolute inset-0 bg-foreground/40" onClick={onClose} tabIndex={-1} />
      <div className="relative flex h-full w-full max-w-2xl flex-col bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-extrabold">{title}</h2>
          <Button ref={closeButton} variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
            <X className="size-5" aria-hidden />
          </Button>
        </div>
        <div className="flex-1 overflow-auto px-6 py-6 sm:px-10" data-scroll-container data-testid="document-drawer">
          <HighlightedText text={text} phrase={phrase} status={status} className="font-sans text-sm" />
        </div>
      </div>
    </div>
  );
}
