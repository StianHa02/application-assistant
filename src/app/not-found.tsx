import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getI18n } from "@/i18n/server";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <Card className="mx-auto max-w-lg space-y-4 text-center">
      <h1 className="text-2xl font-bold">{t.common.notFound}</h1>
      <p className="text-muted-foreground">{t.common.notFoundText}</p>
      <Link href="/dashboard" className={buttonVariants({ variant: "secondary" })}>
        {t.result.back}
      </Link>
    </Card>
  );
}
