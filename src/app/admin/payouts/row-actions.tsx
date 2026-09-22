"use client";

import { useTransition } from "react";
import { createPayoutAction, markPayoutPaidAction, markPayoutFailedAction } from "./actions";
import { Button } from "@/components/ui/button";

export function CreatePayoutButton({ influencerId }: { influencerId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button variant="secondary" disabled={isPending} onClick={() => startTransition(() => createPayoutAction(influencerId))}>
      {isPending ? "Creating..." : "Create Payout"}
    </Button>
  );
}

export function PayoutRowActions({ payoutId, status }: { payoutId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  if (status === "PAID" || status === "FAILED") return null;

  return (
    <div className="flex gap-2">
      <button
        disabled={isPending}
        onClick={() => startTransition(() => markPayoutPaidAction(payoutId))}
        className="text-xs text-emerald-600 hover:underline disabled:opacity-50"
      >
        Mark Paid
      </button>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => markPayoutFailedAction(payoutId, "Marked failed by admin"))}
        className="text-xs text-red-600 hover:underline disabled:opacity-50"
      >
        Mark Failed
      </button>
    </div>
  );
}
