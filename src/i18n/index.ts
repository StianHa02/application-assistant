import { en } from "./en";
import { type Dictionary, nb } from "./nb";

export type Locale = "nb" | "en";
export type { Dictionary };

export const LOCALES: Locale[] = ["nb", "en"];
export const DEFAULT_LOCALE: Locale = "nb";
export const LOCALE_COOKIE = "locale";

const dictionaries: Record<Locale, Dictionary> = { nb, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function isLocale(value: unknown): value is Locale {
  return value === "nb" || value === "en";
}

/** Replaces {placeholders} in a string: format("Hei {name}", { name: "Ola" }). */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
