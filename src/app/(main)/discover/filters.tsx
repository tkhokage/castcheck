"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  OPPORTUNITY_TYPES, LOCATIONS, COMPENSATION, ROLE_TYPES, EXPERIENCE_LEVELS, PRODUCTION_TYPES,
} from "@/lib/constants";
import { inputClass } from "@/components/ui";
import { Search, X } from "lucide-react";

const SELECTS: { name: string; label: string; options: readonly string[] }[] = [
  { name: "type", label: "Type", options: OPPORTUNITY_TYPES },
  { name: "location", label: "Location", options: LOCATIONS },
  { name: "compensation", label: "Compensation", options: COMPENSATION },
  { name: "roleType", label: "Role", options: ROLE_TYPES },
  { name: "experience", label: "Experience", options: EXPERIENCE_LEVELS },
  { name: "productionType", label: "Production", options: PRODUCTION_TYPES },
];

export function DiscoverFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => router.push(`/discover?${next.toString()}`));
  }

  const hasFilters = Array.from(params.keys()).some((k) => k !== "sort");

  return (
    <div className={pending ? "opacity-60 transition-opacity" : "transition-opacity"}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          defaultValue={params.get("q") ?? ""}
          onChange={(e) => setParam("q", e.target.value)}
          placeholder="Search title, role, production, company…"
          className={`${inputClass} pl-9`}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SELECTS.map((s) => (
          <label key={s.name} className="block">
            <span className="mb-1 block text-xs font-medium text-muted">{s.label}</span>
            <select
              value={params.get(s.name) ?? ""}
              onChange={(e) => setParam(s.name, e.target.value)}
              className={inputClass}
            >
              <option value="">Any</option>
              {s.options.map((o) => (
                <option key={o} value={o}>
                  {o[0].toUpperCase() + o.slice(1)}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={params.get("safe") === "1"}
            onChange={(e) => setParam("safe", e.target.checked ? "1" : "")}
            className="h-4 w-4 rounded border-border-strong"
          />
          Hide flagged & high-risk
        </label>
        {hasFilters && (
          <button
            onClick={() => startTransition(() => router.push("/discover"))}
            className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
