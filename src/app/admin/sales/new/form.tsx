"use client";

import { useActionState } from "react";
import { createOrderAction } from "../actions";
import { SubmitButton } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900";
const labelClass = "block text-sm font-medium text-slate-700 mb-1";

export function NewOrderForm({ courses }: { courses: { id: string; name: string; sellingPrice: string }[] }) {
  const [state, formAction] = useActionState(createOrderAction, { error: null });

  return (
    <Card>
      <CardBody>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Customer email *</label>
              <input name="customerEmail" type="email" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Customer name</label>
              <input name="customerName" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Course *</label>
              <select name="courseId" required className={inputClass}>
                <option value="">Select...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Order date</label>
              <input name="placedAt" type="datetime-local" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Original price (₹) *</label>
              <input name="originalPrice" type="number" step="0.01" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Discount amount (₹)</label>
              <input name="discountAmount" type="number" step="0.01" defaultValue="0" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Coupon code</label>
              <input name="couponCode" className={inputClass} placeholder="RAHUL10" />
            </div>
            <div>
              <label className={labelClass}>Tracking link code</label>
              <input name="trackingLinkCode" className={inputClass} placeholder="rahul-python-yt-v1" />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Provide either a coupon code or a tracking link code (or both) to attribute this sale to an influencer.
            Leave both blank to record an unattributed sale.
          </p>
          {state.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{state.error}</p>
          )}
          <SubmitButton>Record Sale</SubmitButton>
        </form>
      </CardBody>
    </Card>
  );
}
