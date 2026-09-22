"use client";

import { useActionState } from "react";
import { createTrackingLinkAction } from "./actions";
import { SubmitButton } from "@/components/ui/button";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900";
const labelClass = "block text-xs font-medium text-slate-700 mb-1";

export function TrackingLinkForm({
  influencers,
  courses,
  platforms,
  campaigns,
}: {
  influencers: { id: string; name: string }[];
  courses: { id: string; name: string }[];
  platforms: { id: string; name: string }[];
  campaigns: { id: string; name: string }[];
}) {
  const [state, formAction] = useActionState(createTrackingLinkAction, { error: null });

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
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
          <label className={labelClass}>Content label (e.g. &quot;Video 1&quot;)</label>
          <input name="content" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>UTM content *</label>
          <input name="utmContent" required placeholder="rahul_video_1" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>UTM source</label>
          <input name="utmSource" placeholder="youtube" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>UTM campaign</label>
          <input name="utmCampaign" placeholder="september_launch" className={inputClass} />
        </div>
      </div>
      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{state.error}</p>
      )}
      <SubmitButton>Create Link</SubmitButton>
    </form>
  );
}
