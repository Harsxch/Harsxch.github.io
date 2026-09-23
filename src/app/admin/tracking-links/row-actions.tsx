"use client";

import { useTransition } from "react";
import { toggleTrackingLinkAction } from "./actions";

export function LinkRowActions({ linkId, status }: { linkId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => toggleTrackingLinkAction(linkId, status as "ACTIVE" | "DISABLED"))}
      className="text-xs text-slate-500 hover:text-slate-900 hover:underline disabled:opacity-50"
    >
      {status === "ACTIVE" ? "Disable" : "Enable"}
    </button>
  );
}
