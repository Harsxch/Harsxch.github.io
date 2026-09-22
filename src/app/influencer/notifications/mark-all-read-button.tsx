"use client";

import { useTransition } from "react";
import { markAllReadAction } from "./actions";

export function MarkAllReadButton() {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => markAllReadAction())}
      className="text-sm text-slate-500 hover:text-slate-900 hover:underline disabled:opacity-50"
    >
      Mark all as read
    </button>
  );
}
