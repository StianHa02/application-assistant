"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { setLocale } from "@/app/actions/locale";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

export function LanguageSwitch() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div role="group" aria-label={t.nav.language} className="flex rounded-full border p-0.5 text-xs font-semibold">
      {(["nb", "en"] as const).map((value) => (
        <button
          key={value}
          type="button"
          disabled={pending}
          aria-pressed={locale === value}
          onClick={() =>
            startTransition(async () => {
              await setLocale(value);
              router.refresh();
            })
          }
          className={cn(
            "rounded-full px-2.5 py-1 transition-colors duration-300",
            locale === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {value === "nb" ? "NO" : "EN"}
        </button>
      ))}
    </div>
  );
}
