"use client";

import { useState, useTransition } from "react";
import { setCourseAccessAction } from "../actions";
import { Button } from "@/components/ui/button";

export function AccessForm({
  courseId,
  influencers,
  grantedIds,
}: {
  courseId: string;
  influencers: { id: string; name: string }[];
  grantedIds: string[];
}) {
  const [selected, setSelected] = useState(new Set(grantedIds));
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-1 max-h-64 overflow-y-auto">
        {influencers.map((inf) => (
          <label key={inf.id} className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-lg hover:bg-slate-50">
            <input
              type="checkbox"
              checked={selected.has(inf.id)}
              onChange={(e) => {
                const next = new Set(selected);
                if (e.target.checked) next.add(inf.id);
                else next.delete(inf.id);
                setSelected(next);
              }}
            />
            {inf.name}
          </label>
        ))}
      </div>
      <Button
        variant="secondary"
        disabled={isPending}
        onClick={() => startTransition(() => setCourseAccessAction(courseId, [...selected]))}
      >
        {isPending ? "Saving..." : "Save access"}
      </Button>
    </div>
  );
}
