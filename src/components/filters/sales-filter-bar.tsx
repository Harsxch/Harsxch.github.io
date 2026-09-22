const inputClass =
  "rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 w-full";
const labelClass = "block text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-1";

export interface SalesFilterValues {
  courseId?: string;
  campaignId?: string;
  status?: string;
  couponCode?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  from?: string;
  to?: string;
}

/**
 * A GET-method filter form - works with zero client JS, matches the
 * spreadsheet-style multi-dimension filter panel this mirrors (course,
 * campaign, coupon, and every UTM dimension a tracking link can carry).
 * Reused by both the admin Sales page and the influencer's My Sales page;
 * the influencer version only ever sees their own courses/campaigns since
 * the data layer already scopes those lists to the caller.
 */
export function SalesFilterBar({
  action,
  values,
  courses,
  campaigns,
  showStatus = false,
}: {
  action: string;
  values: SalesFilterValues;
  courses: { id: string; name: string }[];
  campaigns: { id: string; name: string }[];
  showStatus?: boolean;
}) {
  return (
    <form action={action} className="p-4 border-b border-slate-100 bg-slate-50/50">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div>
          <label className={labelClass}>Start date</label>
          <input type="date" name="from" defaultValue={values.from} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>End date</label>
          <input type="date" name="to" defaultValue={values.to} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Course</label>
          <select name="courseId" defaultValue={values.courseId ?? ""} className={inputClass}>
            <option value="">All courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Campaign</label>
          <select name="campaignId" defaultValue={values.campaignId ?? ""} className={inputClass}>
            <option value="">All campaigns</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Coupon code</label>
          <input type="text" name="couponCode" defaultValue={values.couponCode} placeholder="RAHUL10" className={inputClass} />
        </div>
        {showStatus && (
          <div>
            <label className={labelClass}>Status</label>
            <select name="status" defaultValue={values.status ?? ""} className={inputClass}>
              <option value="">All statuses</option>
              {["PENDING", "SUCCESSFUL", "REFUNDED", "PARTIALLY_REFUNDED", "CANCELLED"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className={labelClass}>UTM source</label>
          <input type="text" name="utmSource" defaultValue={values.utmSource} placeholder="youtube" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>UTM medium</label>
          <input type="text" name="utmMedium" defaultValue={values.utmMedium} placeholder="influencer" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>UTM campaign</label>
          <input type="text" name="utmCampaign" defaultValue={values.utmCampaign} placeholder="dedicated" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>UTM content</label>
          <input type="text" name="utmContent" defaultValue={values.utmContent} placeholder="sf" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>UTM term</label>
          <input type="text" name="utmTerm" defaultValue={values.utmTerm} placeholder="harshpriyam" className={inputClass} />
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className="rounded-lg bg-slate-900 text-white text-xs font-medium px-3.5 py-1.5 hover:bg-slate-800 w-full">
            Apply filters
          </button>
        </div>
      </div>
    </form>
  );
}
