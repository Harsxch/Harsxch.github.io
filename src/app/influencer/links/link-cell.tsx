"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

export function LinkCell({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const path = `/r/${code}`;

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs text-slate-700">{path}</span>
      <button
        onClick={async () => {
          await navigator.clipboard.writeText(`${window.location.origin}${path}`);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
