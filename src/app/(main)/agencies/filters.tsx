"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { LOCATIONS, REPRESENTATION_TYPES } from "@/lib/constants";
import { inputClass } from "@/components/ui";
import { Search } from "lucide-react";

export function AgencyFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [, start] = useTransition();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    start(() => router.push(`/agencies?${next.toString()}`));
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_200px_200px]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          defaultValue={params.get("q") ?? ""}
          onChange={(e) => setParam("q", e.target.value)}
          placeholder="Search agencies…"
          className={`${inputClass} pl-9`}
        />
      </div>
      <select value={params.get("location") ?? ""} onChange={(e) => setParam("location", e.target.value)} className={inputClass}>
        <option value="">Any location</option>
        {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
      </select>
      <select value={params.get("specialty") ?? ""} onChange={(e) => setParam("specialty", e.target.value)} className={inputClass}>
        <option value="">Any representation</option>
        {REPRESENTATION_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
    </div>
  );
}
