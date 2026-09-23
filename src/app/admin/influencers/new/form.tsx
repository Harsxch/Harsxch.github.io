"use client";

import { useActionState } from "react";
import { createInfluencerAction } from "../actions";
import { SubmitButton } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900";
const labelClass = "block text-sm font-medium text-slate-700 mb-1";

export function NewInfluencerForm({ platforms }: { platforms: { id: string; name: string }[] }) {
  const [state, formAction] = useActionState(createInfluencerAction, { error: null });

  return (
    <Card>
      <CardBody>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Name *</label>
              <input name="name" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input name="email" type="email" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input name="phone" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Category / Niche</label>
              <input name="category" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>YouTube URL</label>
              <input name="youtubeUrl" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Instagram URL</label>
              <input name="instagramUrl" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Primary Platform</label>
              <select name="primaryPlatformId" className={inputClass}>
                <option value="">Select...</option>
                {platforms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select name="status" className={inputClass} defaultValue="PROSPECT">
                {["PROSPECT", "ONBOARDING", "ACTIVE", "PAUSED", "INACTIVE"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Joining Date</label>
              <input name="joiningDate" type="date" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea name="notes" rows={3} className={inputClass} />
          </div>
          {state.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{state.error}</p>
          )}
          <SubmitButton>Create Influencer</SubmitButton>
        </form>
      </CardBody>
    </Card>
  );
}
