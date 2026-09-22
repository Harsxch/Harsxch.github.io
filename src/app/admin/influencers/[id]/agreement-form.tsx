"use client";

import { useActionState, useState } from "react";
import { addAgreementVersionAction } from "./actions";
import { SubmitButton } from "@/components/ui/button";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900";
const labelClass = "block text-xs font-medium text-slate-700 mb-1";

export function AgreementVersionForm({
  influencerId,
  courses,
  campaigns,
}: {
  influencerId: string;
  courses: { id: string; name: string }[];
  campaigns: { id: string; name: string }[];
}) {
  const boundAction = addAgreementVersionAction.bind(null, influencerId);
  const [state, formAction] = useActionState(boundAction, { error: null });
  const [modelType, setModelType] = useState("REVENUE_SHARE");

  return (
    <form action={formAction} className="space-y-3 border-t border-slate-100 pt-4 mt-4">
      <p className="text-xs font-semibold text-slate-900 uppercase tracking-wide">Add new agreement version</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Model type</label>
          <select
            name="modelType"
            value={modelType}
            onChange={(e) => setModelType(e.target.value)}
            className={inputClass}
          >
            <option value="REVENUE_SHARE">Revenue Share</option>
            <option value="PERCENTAGE_COMMISSION">Percentage Commission</option>
            <option value="FIXED_PER_SALE">Fixed Per Sale</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Eligible revenue basis</label>
          <select name="eligibleRevenueBasis" defaultValue="DISCOUNTED" className={inputClass}>
            <option value="DISCOUNTED">Discounted (final amount paid)</option>
            <option value="GROSS">Gross (original price)</option>
            <option value="NET_OF_REFUND">Net of refund</option>
          </select>
        </div>

        {(modelType === "REVENUE_SHARE" || modelType === "HYBRID") && (
          <div>
            <label className={labelClass}>Influencer share % {modelType === "HYBRID" && "(base)"}</label>
            <input name="influencerSharePct" type="number" step="0.01" min="0" max="100" className={inputClass} />
          </div>
        )}
        {(modelType === "PERCENTAGE_COMMISSION" || modelType === "HYBRID") && (
          <div>
            <label className={labelClass}>Commission %</label>
            <input name="commissionPct" type="number" step="0.01" min="0" max="100" className={inputClass} />
          </div>
        )}
        {(modelType === "FIXED_PER_SALE" || modelType === "HYBRID") && (
          <div>
            <label className={labelClass}>Fixed amount (₹) {modelType === "HYBRID" && "(bonus)"}</label>
            <input name="fixedAmount" type="number" step="0.01" min="0" className={inputClass} />
          </div>
        )}

        <div>
          <label className={labelClass}>Effective from *</label>
          <input name="effectiveFrom" type="date" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Effective until (optional)</label>
          <input name="effectiveUntil" type="date" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Scope to courses (leave empty = all courses)</label>
          <select name="courseIds" multiple className={`${inputClass} h-24`}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Scope to campaigns (leave empty = all campaigns)</label>
          <select name="campaignIds" multiple className={`${inputClass} h-24`}>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <input name="notes" className={inputClass} />
      </div>

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{state.error}</p>
      )}

      <SubmitButton>Add Version</SubmitButton>
    </form>
  );
}
