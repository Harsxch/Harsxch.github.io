"use client";

import { useActionState } from "react";
import { createCampaignAction } from "./actions";
import { SubmitButton } from "@/components/ui/button";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900";
const labelClass = "block text-xs font-medium text-slate-700 mb-1";

export function CampaignForm({
  courses,
  influencers,
}: {
  courses: { id: string; name: string }[];
  influencers: { id: string; name: string }[];
}) {
  const [state, formAction] = useActionState(createCampaignAction, { error: null });

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Name *</label>
          <input name="name" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Slug *</label>
          <input name="slug" required placeholder="september-launch" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Start date *</label>
          <input name="startDate" type="date" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>End date</label>
          <input name="endDate" type="date" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Target sales</label>
          <input name="targetSales" type="number" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Target revenue (₹)</label>
          <input name="targetRevenue" type="number" className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Courses</label>
          <select name="courseIds" multiple className={`${inputClass} h-24`}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Influencers</label>
          <select name="influencerIds" multiple className={`${inputClass} h-24`}>
            {influencers.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className={labelClass}>Description</label>
        <textarea name="description" rows={2} className={inputClass} />
      </div>
      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{state.error}</p>
      )}
      <SubmitButton>Create Campaign</SubmitButton>
    </form>
  );
}
