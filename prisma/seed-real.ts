import { PrismaClient } from "@prisma/client";

// Seeds a small set of REAL, publicly-listed talent agencies (first step of the
// Phase 6 real-data pipeline). Only accurate, public information is used.
//
// Trust level 2 = "publicly observable". These are NOT independently verified or
// endorsed by CASTCHECK, and are clearly labeled as such in the UI. Idempotent:
// upserts by agency name, so it won't duplicate or wipe existing data.
//
//   npx tsx prisma/seed-real.ts
//
// Sources (public, fetched at seed time):
//   Kim Dawson Agency — https://www.kimdawsonagency.com/ (verified reachable)
//   Houghton Talent   — https://houghtontalent.com/       (verified reachable)

const db = new PrismaClient();

const REAL_AGENCIES = [
  {
    name: "Kim Dawson Agency",
    location: "Dallas, TX",
    website: "https://www.kimdawsonagency.com",
    contactPhone: "(214) 638-2414",
    contactEmail: null as string | null,
    representationSpecialties: ["film/tv", "commercial", "voice", "modeling"],
    marketsServed: ["Dallas/Fort Worth", "Nationwide"],
    submissionMethod: "open",
    submissionUrl: "https://www.kimdawsonagency.com/join",
    submissionRequirements: ["See “Get Scouted” on the agency’s official website"],
    commission: null as string | null,
    fees: "Not disclosed here — confirm directly with the agency.",
    careerLevel: ["emerging", "experienced", "professional"],
    specialties: ["Long-established Texas market presence"],
    businessInfo:
      "Full-service Texas model & talent agency representing talent for film, television, commercial, voice-over and print. Long-established Dallas agency. Listed from public information; confirm all details on the agency’s official site.",
  },
  {
    name: "Houghton Talent",
    location: "Atlanta, GA",
    website: "https://houghtontalent.com",
    contactPhone: "(404) 603-9454",
    contactEmail: null as string | null,
    representationSpecialties: ["film/tv", "commercial", "voice"],
    marketsServed: ["Atlanta"],
    submissionMethod: "open",
    submissionUrl: "https://houghtontalent.com/contact/",
    submissionRequirements: ["See the agency’s official website"],
    commission: null as string | null,
    fees: "Not disclosed here — confirm directly with the agency.",
    careerLevel: ["emerging", "experienced", "professional"],
    specialties: ["SAG-franchised", "Atlanta production market"],
    businessInfo:
      "SAG-franchised Atlanta talent agency representing film/TV, commercial and voice-over talent. Listed from public information; confirm all details on the agency’s official site.",
  },
];

async function main() {
  for (const a of REAL_AGENCIES) {
    const existing = await db.agency.findFirst({ where: { name: a.name } });
    const data = {
      ...a,
      verificationState: "needs_review", // honest: publicly observable, not Level-4 verified
      trustLevel: 2,
      isDemo: false,
      lastVerifiedAt: new Date(),
    };
    if (existing) {
      await db.agency.update({ where: { id: existing.id }, data });
      console.log(`updated real agency: ${a.name}`);
    } else {
      await db.agency.create({ data });
      console.log(`created real agency: ${a.name}`);
    }
  }
  console.log("Real-agency seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
