"use client";

import { useActionState } from "react";
import { createCourseAction } from "../actions";
import { SubmitButton } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900";
const labelClass = "block text-sm font-medium text-slate-700 mb-1";

export default function NewCoursePage() {
  const [state, formAction] = useActionState(createCourseAction, { error: null });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Add Course</h1>
        <p className="text-sm text-slate-500 mt-0.5">Create a new course influencers can promote</p>
      </div>
      <Card>
        <CardBody>
          <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Name *</label>
                <input name="name" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Slug *</label>
                <input name="slug" required placeholder="python-dsa" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Course URL *</label>
                <input name="courseUrl" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <input name="category" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Original Price (₹) *</label>
                <input name="originalPrice" type="number" step="0.01" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Selling Price (₹)</label>
                <input name="sellingPrice" type="number" step="0.01" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Default Commercial Model</label>
                <select name="defaultModelType" className={inputClass} defaultValue="">
                  <option value="">Not set</option>
                  <option value="REVENUE_SHARE">Revenue Share</option>
                  <option value="PERCENTAGE_COMMISSION">Percentage Commission</option>
                  <option value="FIXED_PER_SALE">Fixed Per Sale</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select name="status" className={inputClass} defaultValue="ACTIVE">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea name="description" rows={2} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Marketing Description</label>
              <textarea name="marketingDescription" rows={2} className={inputClass} />
            </div>
            {state.error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{state.error}</p>
            )}
            <SubmitButton>Create Course</SubmitButton>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
