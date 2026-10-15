"use client";

import { useState } from "react";

import { deleteAccount, deleteAllAnalyses } from "@/app/actions/analyses";
import { ConfirmButton } from "@/components/confirm-button";

export function SettingsActions() {
  const [done, setDone] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <ConfirmButton
          label="Delete all my analyses"
          confirmLabel="Are you sure? Click again to delete everything."
          onConfirm={async () => {
            await deleteAllAnalyses();
            setDone(true);
          }}
        />
        <ConfirmButton
          label="Delete my account"
          confirmLabel="Click again to permanently delete the account and all data."
          onConfirm={deleteAccount}
        />
      </div>
      {done && (
        <p role="status" className="text-sm font-semibold text-success-dark">
          All your analyses have been deleted.
        </p>
      )}
    </div>
  );
}
