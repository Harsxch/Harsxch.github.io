"use client";

import { useTransition } from "react";
import { toggleCouponAction } from "./actions";

export function CouponRowActions({ couponId, status }: { couponId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => toggleCouponAction(couponId, status as "ACTIVE" | "INACTIVE" | "EXPIRED"))}
      className="text-xs text-slate-500 hover:text-slate-900 hover:underline disabled:opacity-50"
    >
      {status === "ACTIVE" ? "Deactivate" : "Activate"}
    </button>
  );
}
