import { format } from "@/i18n";
import { getI18n } from "@/i18n/server";
import { getAiProvider } from "@/lib/ai";

// Warm sand footer, as on echo.uib.no.
export async function SiteFooter() {
  const { t } = await getI18n();
  const provider = getAiProvider();

  return (
    <footer className="mt-32 border-t border-footer-border bg-footer px-6 py-20 text-footer-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-10 sm:gap-20">
        <div className="max-w-sm">
          <h3 className="mb-4 py-2 text-xl font-bold">{t.footer.about}</h3>
          <p className="text-sm leading-relaxed">{t.footer.aboutText}</p>
        </div>
        <div>
          <h3 className="mb-4 py-2 text-xl font-bold">{t.footer.privacy}</h3>
          <ul className="space-y-1 text-sm">
            {t.footer.privacyItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="max-w-xs">
          <h3 className="mb-4 py-2 text-xl font-bold">{t.footer.aiTitle}</h3>
          <p className="text-sm">
            {provider.name === "mock" ? t.footer.aiDemo : format(t.footer.aiLive, { model: provider.model })}
          </p>
        </div>
      </div>
    </footer>
  );
}
