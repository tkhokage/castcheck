"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Component, useState, type ReactNode } from "react";
import type { DistrictAgency } from "@/lib/agency-district";
import { VerificationBadge } from "@/components/badges";
const Scene = dynamic(() => import("./district-scene"), {
  ssr: false, loading: () => <p role="status">Loading 3D… The agency list remains available below.</p>,
});
const button = "rounded-lg border border-border px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed
    ? <p role="status" className="p-6">3D is unavailable. Use the agency buttons or the complete list below.</p>
    : this.props.children; }
}
export function AgencyDistrict({ agencies }: { agencies: DistrictAgency[] }) {
  const [open, setOpen] = useState(false);
  const [selectedId, select] = useState<string | null>(null);
  const [reset, setReset] = useState(0);
  const visible = agencies.slice(0, 24);
  const selected = visible.find(a => a.id === selectedId);
  if (selectedId && !selected) select(null);
  return <section aria-label="Agency District" className="mt-6 rounded-xl border border-border p-4"
    onKeyDown={e => { if (e.key === "Escape") select(null); }}>
    <div className="flex flex-wrap items-center gap-3">
      <button className={button} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "Close 3D view" : "Explore in 3D"}</button>
      {open && <button className={button} onClick={() => setReset(reset + 1)}>Reset view</button>}
      <a className={button} href="#agency-list" onClick={() => setOpen(false)}>Complete list ({agencies.length})</a>
    </div>
    {open && <>
      <h2 className="mt-4 text-xl font-bold">Agency District</h2>
      <p className="mt-1 text-sm text-muted">An illustrative studio neighborhood, not actual office locations. Building appearance does not indicate trust or quality.</p>
      <p className="my-3 text-sm">Showing {visible.length} of {agencies.length} matching agencies. The complete list is below.</p>
      {visible.length === 0 ? <p>No agencies match. Try changing the filters above.</p> :
        <SceneBoundary key={reset}><Scene agencies={visible} selectedId={selected?.id ?? null} onSelect={select} /></SceneBoundary>}
      <div className="mt-4 flex flex-wrap gap-2" aria-label="Select an agency">
        {visible.map((a, i) => <button key={a.id} className={button} aria-pressed={selected?.id === a.id}
          onClick={() => select(a.id)}>{i + 1}. {a.name}</button>)}
      </div>
      <div className="mt-4 rounded-lg border border-border p-4" aria-live="polite">
        {selected ? <>
          <h3 className="text-lg font-bold">{selected.name}</h3>
          <p>{selected.location} · {selected.isDemo ? "Demo data" : "Non-demo record"}</p>
          <p className="my-2">{selected.specialties.join(" · ") || "Specialties not provided"}</p>
          <VerificationBadge state={selected.verificationState} />
          <p className="mt-2">Career fit: {selected.matchScore === null ? "Complete your profile to see a match" : selected.matchScore + "%"}. Fit does not establish safety.</p>
          <p className="text-sm">Last verification: {selected.lastVerifiedAt?.slice(0, 10) ?? "Not recorded"}</p>
          <Link className="mt-3 inline-block underline focus-visible:outline-2" href={"/agencies/" + encodeURIComponent(selected.id)}>View evidence, contact and submission details</Link>
          <button className={button + " ml-3"} onClick={() => select(null)}>Clear selection</button>
        </> : <p>{selectedId ? "The selected agency is no longer in this view. Choose another agency." : "Select a building or agency button to read its details."}</p>}
      </div>
    </>}
  </section>;
}
