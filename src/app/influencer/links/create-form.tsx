"use client";

import { useActionState } from "react";
import { createMyTrackingLinkAction } from "./actions";
import { SubmitButton } from "@/components/ui/button";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900";
const labelClass = "block text-xs font-medium text-slate-700 mb-1";

export function CreateMyLinkForm({
  courses,
  platforms,
  campaigns,
  coupons,
}: {
  courses: { id: string; name: string }[];
  platforms: { id: string; name: string }[];
  campaigns: { id: string; name: string }[];
  coupons: { id: string; code: string }[];
}) {
  const [state, formAction] = useActionState(createMyTrackingLinkAction, { error: null });

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
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
          <label className={labelClass}>Platform *</label>
          <select name="platformId" required className={inputClass}>
            <option value="">Select...</option>
            {platforms.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Campaign</label>
          <select name="campaignId" className={inputClass}>
            <option value="">None</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Attach one of my coupons</label>
          <select name="couponId" className={inputClass}>
            <option value="">None</option>
            {coupons.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Content label (e.g. &quot;Reel 3&quot;)</label>
          <input name="content" className={inputClass} />
        </div>
      </div>

      <p className="text-xs font-semibold text-slate-900 uppercase tracking-wide pt-1">UTM parameters - set your own</p>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>UTM source</label>
          <input name="utmSource" placeholder="storefront" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>UTM medium</label>
          <input name="utmMedium" placeholder="V_Upskill_Academy" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>UTM campaign</label>
          <input name="utmCampaign" placeholder="Dedicated" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>UTM content *</label>
          <input name="utmContent" required placeholder="sf" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>UTM term</label>
          <input name="utmTerm" placeholder="HarshPriyam" className={inputClass} />
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{state.error}</p>
      )}
      <SubmitButton>Create My Link</SubmitButton>
    </form>
  );
}
