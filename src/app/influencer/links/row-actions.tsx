"use client";

import { useTransition } from "react";
import { toggleMyTrackingLinkAction } from "./actions";

export function MyLinkRowActions({ linkId, status }: { linkId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => toggleMyTrackingLinkAction(linkId, status as "ACTIVE" | "DISABLED"))}
      className="text-xs text-slate-500 hover:text-slate-900 hover:underline disabled:opacity-50"
    >
      {status === "ACTIVE" ? "Disable" : "Enable"}
    </button>
  );
}
