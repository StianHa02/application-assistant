import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <Card className="mx-auto max-w-lg space-y-4 p-8 text-center">
      <h1 className="text-3xl font-extrabold">Page not found</h1>
      <p className="text-muted-foreground">The analysis doesn&apos;t exist, or you don&apos;t have access to it.</p>
      <Link href="/dashboard" className={buttonVariants({ variant: "secondary" })}>
        Back to my analyses
      </Link>
    </Card>
  );
}
