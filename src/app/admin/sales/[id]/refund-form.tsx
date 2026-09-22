"use client";

import { useActionState } from "react";
import { createRefundAction } from "../actions";
import { SubmitButton } from "@/components/ui/button";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900";
const labelClass = "block text-xs font-medium text-slate-700 mb-1";

export function RefundForm({ orderId, maxAmount }: { orderId: string; maxAmount: number }) {
  const boundAction = createRefundAction.bind(null, orderId);
  const [state, formAction] = useActionState(boundAction, { error: null });

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Refund amount (₹) *</label>
          <input
            name="amount"
            type="number"
            step="0.01"
            max={maxAmount}
            defaultValue={maxAmount.toFixed(2)}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Reason</label>
          <input name="reason" className={inputClass} />
        </div>
      </div>
      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{state.error}</p>
      )}
      <SubmitButton variant="danger">Issue Refund</SubmitButton>
    </form>
  );
}
