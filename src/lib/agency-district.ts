import { asList } from "./utils";
export interface DistrictAgency {
  id: string; name: string; location: string; specialties: string[];
  verificationState: string; matchScore: number | null;
  isDemo: boolean; lastVerifiedAt: string | null;
}
export function districtAgency(a: {
  id: string; name: string; location: string; representationSpecialties: unknown;
  verificationState: string; isDemo: boolean; lastVerifiedAt: Date | null;
}, matchScore: number | null): DistrictAgency {
  return { id: a.id, name: a.name, location: a.location,
    specialties: asList(a.representationSpecialties).map(String),
    verificationState: a.verificationState, matchScore, isDemo: a.isDemo,
    lastVerifiedAt: a.lastVerifiedAt?.toISOString() ?? null };
}
export function districtPosition(index: number, count = 24): [number, number, number] {
  const columns = Math.min(6, Math.max(1, Math.ceil(Math.sqrt(count * 1.5))));
  const rows = Math.ceil(count / columns);
  return [(index % columns - (columns - 1) / 2) * 3, 0, (Math.floor(index / columns) - (rows - 1) / 2) * 3.5];
}
