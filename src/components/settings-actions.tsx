"use client";

import { useState } from "react";

import { deleteAccount, deleteAllAnalyses } from "@/app/actions/analyses";
import { ConfirmButton } from "@/components/confirm-button";
import { useI18n } from "@/i18n/client";

export function SettingsActions() {
  const { t } = useI18n();
  const [done, setDone] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <ConfirmButton
          label={t.settings.deleteAll}
          confirmLabel={t.settings.deleteAllConfirm}
          onConfirm={async () => {
            await deleteAllAnalyses();
            setDone(true);
          }}
        />
        <ConfirmButton label={t.settings.deleteAccount} confirmLabel={t.settings.deleteAccountConfirm} onConfirm={deleteAccount} />
      </div>
      {done && (
        <p role="status" className="text-sm font-semibold text-success-dark">
          {t.settings.deleteAllDone}
        </p>
      )}
    </div>
  );
}
