"use client";

import { useActionState } from "react";
import { createCouponAction } from "./actions";
import { SubmitButton } from "@/components/ui/button";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900";
const labelClass = "block text-xs font-medium text-slate-700 mb-1";

export function CouponForm({ influencers }: { influencers: { id: string; name: string }[] }) {
  const [state, formAction] = useActionState(createCouponAction, { error: null });

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Code *</label>
          <input name="code" required placeholder="RAHUL10" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Influencer *</label>
          <select name="influencerId" required className={inputClass}>
            <option value="">Select...</option>
            {influencers.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Discount type</label>
          <select name="discountType" className={inputClass} defaultValue="PERCENTAGE">
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED_AMOUNT">Fixed Amount</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Discount value *</label>
          <input name="discountValue" type="number" step="0.01" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>End date</label>
          <input name="endDate" type="date" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Usage limit</label>
          <input name="usageLimit" type="number" className={inputClass} />
        </div>
      </div>
      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{state.error}</p>
      )}
      <SubmitButton>Create Coupon</SubmitButton>
    </form>
  );
}
