import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { riskScore, riskLevel } from "../src/lib/risk";

const db = new PrismaClient();

const DEMO_PW = "demo1234";

function daysFromNow(n: number): Date {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}

async function main() {
  console.log("Seeding CASTCHECK…");

  // Wipe (idempotent local seed)
  await db.riskIndicator.deleteMany();
  await db.verificationCheck.deleteMany();
  await db.report.deleteMany();
  await db.application.deleteMany();
  await db.savedOpportunity.deleteMany();
  await db.opportunity.deleteMany();
  await db.agency.deleteMany();
  await db.ticket.deleteMany();
  await db.knowledgeArticle.deleteMany();
  await db.riskRegisterEntry.deleteMany();
  await db.incident.deleteMany();
  await db.auditLog.deleteMany();
  await db.actorProfile.deleteMany();
  await db.user.deleteMany();

  const hash = await bcrypt.hash(DEMO_PW, 10);

  // --- Users (one per role) --------------------------------------------------
  const actor = await db.user.create({
    data: {
      email: "actor@castcheck.app",
      passwordHash: hash,
      name: "Jordan Rivera",
      role: "actor",
      profile: {
        create: {
          displayName: "Jordan Rivera",
          professionalEmail: "jordan.rivera.actor@gmail.com",
          professionalPhone: "(214) 555-0142",
          location: "Dallas, TX",
          bio: "Emerging screen actor based in DFW. Trained in Meisner technique, comfortable on camera, building toward representation and paid film/TV work.",
          headshotUrl: null,
          credits: [
            { title: "Last Light", role: "Supporting", production: "Trinity Shorts", year: 2025 },
            { title: "The Waiting Room", role: "Lead", production: "SMU Student Film", year: 2024 },
          ],
          skills: ["Improv", "Stage combat", "Dialects"],
          specialSkills: ["Valid passport", "Driver's license", "Intermediate Spanish"],
          training: ["Meisner — KD Studio", "On-camera intensive — The Studio (Dallas)"],
          languages: ["English", "Spanish"],
          links: [{ label: "Reel", url: "https://example.com/reel" }],
          experienceLevel: "emerging",
          careerGoals: "Sign with a DFW film/TV agency and book paid regional film work within 12 months.",
          preferredMediums: ["film", "television", "indie", "commercial"],
          desiredMarkets: ["Dallas/Fort Worth", "Austin"],
          roleTypes: ["supporting", "featured", "lead"],
          compensationPref: "paid",
          productionTypePref: ["independent", "studio"],
          availability: "Weekends and evenings; flexible with notice.",
          willingToTravel: true,
          representationGoals: "Film/TV representation in the Texas market.",
        },
      },
    },
  });

  await db.user.create({ data: { email: "casting@castcheck.app", passwordHash: hash, name: "Morgan Lee", role: "casting" } });
  await db.user.create({ data: { email: "agency@castcheck.app", passwordHash: hash, name: "Avery Chen", role: "agency" } });
  const moderator = await db.user.create({ data: { email: "moderator@castcheck.app", passwordHash: hash, name: "Sam Patel", role: "moderator" } });
  const support = await db.user.create({ data: { email: "support@castcheck.app", passwordHash: hash, name: "Riley Kim", role: "support" } });
  await db.user.create({ data: { email: "grc@castcheck.app", passwordHash: hash, name: "Casey Flores", role: "grc" } });
  await db.user.create({ data: { email: "admin@castcheck.app", passwordHash: hash, name: "Taylor Brooks", role: "admin" } });

  // --- Opportunities ---------------------------------------------------------
  type Check = { key: string; label: string; status: string; note?: string };
  type Ind = { category: string; code: string; description: string; severity: string };
  type OppSeed = {
    title: string; production?: string; productionCompany?: string; castingEntity?: string;
    role: string; roleType: string; type: string; location: string; productionType?: string;
    experienceLevel?: string; compensation: string; payDetails?: string; unionStatus?: string;
    description?: string; submissionMethod?: string; submissionRequirements?: string[];
    deadlineDays?: number; contactName?: string; contactEmail?: string; source?: string; sourceUrl?: string;
    trustLevel: number; likelihood: number; impact: number; verificationState: string;
    status?: string; checks: Check[]; indicators?: Ind[];
  };

  const opps: OppSeed[] = [
    {
      title: "Supporting Role — Indie Feature 'Cicada Summer'",
      production: "Cicada Summer",
      productionCompany: "Bluebonnet Pictures LLC",
      castingEntity: "Reed Casting (Dallas)",
      role: "Danny — supporting",
      roleType: "supporting",
      type: "indie",
      location: "Dallas/Fort Worth",
      productionType: "independent",
      experienceLevel: "emerging",
      compensation: "paid",
      payDetails: "$750/day, 6 shoot days",
      unionStatus: "SAG-AFTRA New Media (signatory)",
      description:
        "Character-driven indie feature shooting in DFW this fall. Seeking a supporting actor for Danny, a reserved younger brother. Self-tape first round; callbacks in person.",
      submissionMethod: "Self-tape via casting portal",
      submissionRequirements: ["Headshot", "Resume", "1-minute self-tape (sides provided)"],
      deadlineDays: 12,
      contactName: "Reed Casting",
      contactEmail: "submissions@reedcasting.example",
      source: "Casting professional (verified poster)",
      sourceUrl: "https://bluebonnetpictures.example/casting",
      trustLevel: 4, likelihood: 1, impact: 3, verificationState: "verified",
      checks: [
        { key: "production_company", label: "Production company", status: "pass", note: "Bluebonnet Pictures LLC identified; active business filing." },
        { key: "casting_contact", label: "Casting contact", status: "pass", note: "Reed Casting is an established DFW casting entity." },
        { key: "official_website", label: "Official website", status: "pass", note: "Production site resolves and matches contact domain." },
        { key: "submission_method", label: "Submission method", status: "pass", note: "Submissions via portal; no fee to submit." },
        { key: "compensation_details", label: "Compensation details", status: "pass", note: "Day rate and shoot days stated." },
      ],
    },
    {
      title: "Lead — Student Thesis Film 'Northbound'",
      production: "Northbound",
      productionCompany: "UT Austin RTF",
      castingEntity: "Director: Priya N.",
      role: "Ava — lead",
      roleType: "lead",
      type: "student",
      location: "Austin",
      productionType: "student",
      experienceLevel: "emerging",
      compensation: "unpaid",
      payDetails: "Unpaid; meals, footage, and IMDb credit provided.",
      unionStatus: "Non-union",
      description:
        "Senior thesis film. Strong material for reel building. Two shoot weekends in Austin. Great networking with an emerging director.",
      submissionMethod: "Email self-tape",
      submissionRequirements: ["Headshot", "Resume", "Self-tape"],
      deadlineDays: 20,
      contactName: "Priya N.",
      contactEmail: "northbound.thesis@utexas.example",
      source: "Casting professional",
      trustLevel: 3, likelihood: 2, impact: 2, verificationState: "partial",
      checks: [
        { key: "production_company", label: "Production company", status: "pass", note: "UT Austin RTF program confirmed." },
        { key: "casting_contact", label: "Casting contact", status: "pass", note: "University-affiliated email." },
        { key: "official_website", label: "Official website", status: "warn", note: "No standalone production site (typical for student work)." },
        { key: "submission_method", label: "Submission method", status: "pass", note: "Standard email self-tape; no fee." },
        { key: "compensation_details", label: "Compensation details", status: "warn", note: "Unpaid — confirm what is provided in writing." },
      ],
    },
    {
      title: "Regional Commercial — Retail Brand (Non-union)",
      production: "Spring Retail Campaign",
      productionCompany: "Lone Star Ad Works",
      castingEntity: "Lone Star Casting",
      role: "Featured — friendly shopper (20s–30s)",
      roleType: "featured",
      type: "commercial",
      location: "Houston",
      productionType: "independent",
      experienceLevel: "beginner",
      compensation: "paid",
      payDetails: "$400 flat + usage; 1 shoot day",
      unionStatus: "Non-union",
      description: "Upbeat retail spot for regional broadcast and social. One shoot day in Houston.",
      submissionMethod: "Casting portal",
      submissionRequirements: ["Headshot", "Resume"],
      deadlineDays: 6,
      contactName: "Lone Star Casting",
      contactEmail: "casting@lonestaradworks.example",
      source: "Casting professional",
      trustLevel: 3, likelihood: 2, impact: 3, verificationState: "partial",
      checks: [
        { key: "production_company", label: "Production company", status: "pass" },
        { key: "casting_contact", label: "Casting contact", status: "pass" },
        { key: "official_website", label: "Official website", status: "warn", note: "Company site is thin; contact domain matches." },
        { key: "submission_method", label: "Submission method", status: "pass", note: "No submission fee." },
        { key: "compensation_details", label: "Compensation details", status: "warn", note: "Confirm usage terms and payment timing." },
      ],
    },
    {
      title: "Background — Streaming Series (ATL)",
      production: "Untitled Streaming Drama",
      productionCompany: "Peachtree Productions",
      castingEntity: "Central Casting Atlanta",
      role: "Background — office workers",
      roleType: "background",
      type: "television",
      location: "Atlanta",
      productionType: "studio",
      experienceLevel: "beginner",
      compensation: "paid",
      payDetails: "$120/8 + OT; multiple dates",
      unionStatus: "SAG-AFTRA (some union spots)",
      description: "Background for an office setting. Multiple dates through the month.",
      submissionMethod: "Registered casting service",
      submissionRequirements: ["Current photo", "Sizes", "Availability"],
      deadlineDays: 3,
      contactName: "Central Casting Atlanta",
      contactEmail: "extras@centralcastingatl.example",
      source: "Casting professional (verified poster)",
      trustLevel: 4, likelihood: 1, impact: 2, verificationState: "verified",
      checks: [
        { key: "production_company", label: "Production company", status: "pass" },
        { key: "casting_contact", label: "Casting contact", status: "pass", note: "Established background casting service." },
        { key: "official_website", label: "Official website", status: "pass" },
        { key: "submission_method", label: "Submission method", status: "pass", note: "Registration free; standard for background." },
        { key: "compensation_details", label: "Compensation details", status: "pass" },
      ],
    },
    {
      title: "Voice Actor — Indie Animated Short",
      production: "Paper Lanterns",
      productionCompany: "Nightjar Animation",
      castingEntity: "Nightjar Animation",
      role: "Narrator (warm, mid-range)",
      roleType: "voice",
      type: "voice",
      location: "Remote",
      productionType: "independent",
      experienceLevel: "emerging",
      compensation: "paid",
      payDetails: "$300 for the session + buyout for festival use",
      description: "Remote VO for a festival-bound animated short. Home studio required.",
      submissionMethod: "Email demo + audition line",
      submissionRequirements: ["VO demo", "Audition of provided line"],
      deadlineDays: 15,
      contactName: "Nightjar Animation",
      contactEmail: "hello@nightjaranim.example",
      source: "Casting professional",
      trustLevel: 3, likelihood: 2, impact: 2, verificationState: "partial",
      checks: [
        { key: "production_company", label: "Production company", status: "pass" },
        { key: "casting_contact", label: "Casting contact", status: "warn", note: "Small studio; limited public footprint." },
        { key: "official_website", label: "Official website", status: "pass" },
        { key: "submission_method", label: "Submission method", status: "pass", note: "No fee to audition." },
        { key: "compensation_details", label: "Compensation details", status: "warn", note: "Confirm buyout scope in writing." },
      ],
    },
    {
      title: "Theater — Regional Production 'A Winter's Tale'",
      production: "A Winter's Tale",
      productionCompany: "Bayou City Rep",
      castingEntity: "Bayou City Rep",
      role: "Ensemble",
      roleType: "ensemble",
      type: "theater",
      location: "Houston",
      productionType: "nonprofit",
      experienceLevel: "experienced",
      compensation: "paid",
      payDetails: "Weekly stipend; rehearsal + 4-week run",
      description: "Equity-friendly regional theater seeking ensemble. In-person auditions by appointment.",
      submissionMethod: "Email for audition slot",
      submissionRequirements: ["Headshot", "Theater resume"],
      deadlineDays: 9,
      contactName: "Bayou City Rep",
      contactEmail: "auditions@bayoucityrep.example",
      source: "Casting professional (verified poster)",
      trustLevel: 4, likelihood: 1, impact: 2, verificationState: "verified",
      checks: [
        { key: "production_company", label: "Production company", status: "pass" },
        { key: "casting_contact", label: "Casting contact", status: "pass" },
        { key: "official_website", label: "Official website", status: "pass" },
        { key: "submission_method", label: "Submission method", status: "pass" },
        { key: "compensation_details", label: "Compensation details", status: "pass" },
      ],
    },
    {
      title: "\"Netflix Feature\" — Leads Needed, Apply Fast!!",
      production: "(unspecified major studio film)",
      productionCompany: undefined,
      castingEntity: "Talent Coordinator 'Michael'",
      role: "Lead roles — all types",
      roleType: "lead",
      type: "film",
      location: "Los Angeles",
      productionType: "other",
      experienceLevel: "beginner",
      compensation: "paid",
      payDetails: "$5,000/week guaranteed — no experience required!",
      description:
        "URGENT casting for a major streaming feature. Guaranteed roles. To reserve your spot, a refundable $199 'casting registration' is required via gift card. Message on Telegram to proceed.",
      submissionMethod: "Telegram DM",
      submissionRequirements: ["Full name", "Home address", "Photo"],
      deadlineDays: 2,
      contactName: "Michael (Talent Coordinator)",
      contactEmail: "castingmichael2291@fastmail.example",
      source: "User submitted",
      trustLevel: 1, likelihood: 5, impact: 5, verificationState: "high_risk",
      status: "flagged",
      checks: [
        { key: "production_company", label: "Production company", status: "fail", note: "No identifiable production company named." },
        { key: "casting_contact", label: "Casting contact", status: "fail", note: "Unverifiable individual; free email + Telegram only." },
        { key: "official_website", label: "Official website", status: "fail", note: "No official web presence found." },
        { key: "submission_method", label: "Submission method", status: "fail", note: "Off-platform DM; not a standard submission route." },
        { key: "compensation_details", label: "Compensation details", status: "fail", note: "Unrealistic guaranteed pay with no credits." },
        { key: "personal_info", label: "Personal info requests", status: "fail", note: "Requests home address up front without justification." },
      ],
      indicators: [
        { category: "financial", code: "upfront_fee", description: "Requires a paid 'casting registration' fee before any audition.", severity: "high" },
        { category: "financial", code: "gift_card", description: "Payment requested via gift card.", severity: "high" },
        { category: "communication", code: "guaranteed_role", description: "Guarantees employment / roles with no audition.", severity: "high" },
        { category: "communication", code: "urgency", description: "Extreme urgency and pressure to act immediately.", severity: "medium" },
        { category: "communication", code: "off_platform", description: "Pushes contact to Telegram.", severity: "medium" },
        { category: "identity", code: "unverifiable", description: "No verifiable company or person; free email domain.", severity: "high" },
        { category: "information", code: "excessive_pii", description: "Requests home address before providing production details.", severity: "high" },
      ],
    },
    {
      title: "Talent 'Agency' — Guaranteed Representation + Paid Photos",
      production: undefined,
      productionCompany: "Starlight Talent Group",
      castingEntity: "Starlight Talent Group",
      role: "New faces — all ages",
      roleType: "featured",
      type: "other",
      location: "Nationwide",
      productionType: "other",
      experienceLevel: "beginner",
      compensation: "unknown",
      payDetails: undefined,
      description:
        "We GUARANTEE representation and auditions. Mandatory $600 photo package with our in-house photographer required to join. Limited spots — pay today to secure representation.",
      submissionMethod: "Pay to join",
      submissionRequirements: ["Payment", "Photos with our photographer only"],
      deadlineDays: 4,
      contactName: "Starlight Talent Group",
      contactEmail: "join@starlighttalent.example",
      source: "User submitted",
      trustLevel: 1, likelihood: 4, impact: 4, verificationState: "high_risk",
      status: "flagged",
      checks: [
        { key: "production_company", label: "Entity identified", status: "warn", note: "Name given but business details unverifiable." },
        { key: "casting_contact", label: "Casting contact", status: "warn" },
        { key: "official_website", label: "Official website", status: "warn", note: "Site exists but makes guarantee claims." },
        { key: "submission_method", label: "Submission method", status: "fail", note: "Pay-to-join model." },
        { key: "compensation_details", label: "Compensation details", status: "fail", note: "Charges talent instead of paying/earning commission." },
      ],
      indicators: [
        { category: "financial", code: "mandatory_package", description: "Mandatory expensive photo package to join.", severity: "high" },
        { category: "financial", code: "pay_to_join", description: "Charges talent up front for representation.", severity: "high" },
        { category: "communication", code: "guaranteed_rep", description: "Guarantees representation and auditions.", severity: "high" },
        { category: "quality", code: "vague", description: "Vague, no specific productions or credible roster.", severity: "medium" },
      ],
    },
    {
      title: "Web Series — Recurring Role (Deferred Pay)",
      production: "Off the Grid",
      productionCompany: "Riverbend Media",
      castingEntity: "Riverbend Media",
      role: "Recurring — tech-savvy friend",
      roleType: "supporting",
      type: "web series",
      location: "Remote",
      productionType: "independent",
      experienceLevel: "emerging",
      compensation: "deferred",
      payDetails: "Deferred pay contingent on distribution; profit-share agreement.",
      description: "Scripted web series with a distribution plan. Remote shoots plus one in-person weekend.",
      submissionMethod: "Casting portal",
      submissionRequirements: ["Headshot", "Resume", "Self-tape"],
      deadlineDays: 18,
      contactName: "Riverbend Media",
      contactEmail: "casting@riverbendmedia.example",
      source: "Casting professional",
      trustLevel: 2, likelihood: 3, impact: 2, verificationState: "needs_review",
      checks: [
        { key: "production_company", label: "Production company", status: "warn", note: "Company found; limited track record." },
        { key: "casting_contact", label: "Casting contact", status: "warn" },
        { key: "official_website", label: "Official website", status: "pass" },
        { key: "submission_method", label: "Submission method", status: "pass", note: "No fee to submit." },
        { key: "compensation_details", label: "Compensation details", status: "warn", note: "Deferred pay — review the profit-share terms carefully." },
      ],
      indicators: [
        { category: "quality", code: "deferred", description: "Deferred compensation carries real uncertainty; not inherently a scam.", severity: "low" },
      ],
    },
    {
      title: "Short Film — Day Player (Reel Builder)",
      production: "The Long Drive Home",
      productionCompany: "North Oak Films",
      castingEntity: "North Oak Films",
      role: "Day player — diner patron with lines",
      roleType: "day player",
      type: "short",
      location: "Dallas/Fort Worth",
      productionType: "independent",
      experienceLevel: "beginner",
      compensation: "expenses",
      payDetails: "Travel + meals covered; copy of footage.",
      description: "One-day shoot for a festival short. Good speaking scene for a reel.",
      submissionMethod: "Email self-tape",
      submissionRequirements: ["Headshot", "Self-tape"],
      deadlineDays: 10,
      contactName: "North Oak Films",
      contactEmail: "casting@northoakfilms.example",
      source: "Casting professional",
      trustLevel: 3, likelihood: 2, impact: 2, verificationState: "partial",
      checks: [
        { key: "production_company", label: "Production company", status: "pass" },
        { key: "casting_contact", label: "Casting contact", status: "pass" },
        { key: "official_website", label: "Official website", status: "warn" },
        { key: "submission_method", label: "Submission method", status: "pass", note: "No fee." },
        { key: "compensation_details", label: "Compensation details", status: "warn", note: "Expenses-only; confirm what's covered." },
      ],
    },
  ];

  const createdOpps = [];
  for (const o of opps) {
    const score = riskScore(o.likelihood, o.impact);
    const created = await db.opportunity.create({
      data: {
        title: o.title,
        production: o.production,
        productionCompany: o.productionCompany,
        castingEntity: o.castingEntity,
        role: o.role,
        roleType: o.roleType,
        type: o.type,
        location: o.location,
        productionType: o.productionType,
        experienceLevel: o.experienceLevel,
        compensation: o.compensation,
        payDetails: o.payDetails,
        unionStatus: o.unionStatus,
        description: o.description,
        submissionMethod: o.submissionMethod,
        submissionRequirements: o.submissionRequirements ?? undefined,
        deadline: o.deadlineDays ? daysFromNow(o.deadlineDays) : null,
        contactName: o.contactName,
        contactEmail: o.contactEmail,
        source: o.source,
        sourceUrl: o.sourceUrl,
        trustLevel: o.trustLevel,
        riskLikelihood: o.likelihood,
        riskImpact: o.impact,
        riskLevel: riskLevel(score),
        verificationState: o.verificationState,
        status: o.status ?? "published",
        lastVerifiedAt: daysFromNow(-7),
        isDemo: true,
        checks: { create: o.checks.map((c) => ({ key: c.key, label: c.label, status: c.status, note: c.note })) },
        riskIndicators: o.indicators ? { create: o.indicators } : undefined,
      },
    });
    createdOpps.push(created);
  }

  // Seed a couple of saved + tracked items for the demo actor
  await db.savedOpportunity.create({ data: { userId: actor.id, opportunityId: createdOpps[0].id } });
  await db.application.create({
    data: {
      userId: actor.id,
      opportunityId: createdOpps[0].id,
      status: "applied",
      submissionDate: daysFromNow(-2),
      deadline: createdOpps[0].deadline,
      notes: "Sent self-tape with provided sides. Waiting to hear about callbacks.",
      materialsSubmitted: ["Headshot", "Resume", "Self-tape"],
      followUpDate: daysFromNow(5),
    },
  });
  await db.application.create({
    data: {
      userId: actor.id,
      opportunityId: createdOpps[3].id,
      status: "audition_scheduled",
      auditionDate: daysFromNow(4),
      notes: "Registered for background dates.",
    },
  });

  // --- Agencies --------------------------------------------------------------
  const agencies = [
    {
      name: "Kim Dawson Agency", location: "Dallas, TX", website: "https://example.com/kimdawson",
      contactEmail: "info@kimdawson.example", representationSpecialties: ["film/tv", "commercial", "modeling"],
      marketsServed: ["Dallas/Fort Worth", "Austin", "Nationwide"], submissionMethod: "open",
      submissionRequirements: ["Headshot", "Resume", "Reel (if available)"], commission: "Standard 10–20% by category",
      fees: "No upfront fees to join.", careerLevel: ["emerging", "experienced", "professional"],
      specialties: ["Established DFW market presence"], businessInfo: "Long-standing agency in the Texas market.",
      verificationState: "verified", trustLevel: 4,
    },
    {
      name: "Austin Talent Collective", location: "Austin, TX", website: "https://example.com/atc",
      contactEmail: "submissions@austintalent.example", representationSpecialties: ["film/tv", "commercial", "voice"],
      marketsServed: ["Austin", "Dallas/Fort Worth"], submissionMethod: "referral",
      submissionRequirements: ["Headshot", "Resume", "Referral preferred"], commission: "10–15%",
      fees: "No upfront fees.", careerLevel: ["emerging", "experienced"],
      specialties: ["Indie film relationships"], businessInfo: "Boutique agency focused on the Austin market.",
      verificationState: "verified", trustLevel: 4,
    },
    {
      name: "Houston Stage & Screen", location: "Houston, TX", website: "https://example.com/hss",
      contactEmail: "talent@hss.example", representationSpecialties: ["theater", "film/tv"],
      marketsServed: ["Houston"], submissionMethod: "open",
      submissionRequirements: ["Headshot", "Theater + screen resume"], commission: "10–20%",
      fees: "No upfront fees.", careerLevel: ["experienced", "professional"],
      specialties: ["Strong theater connections"], businessInfo: "Regional representation with theater emphasis.",
      verificationState: "partial", trustLevel: 3,
    },
    {
      name: "Peachtree Talent (ATL)", location: "Atlanta, GA", website: "https://example.com/peachtree",
      contactEmail: "newtalent@peachtreetalent.example", representationSpecialties: ["film/tv", "commercial"],
      marketsServed: ["Atlanta", "Nationwide"], submissionMethod: "open",
      submissionRequirements: ["Headshot", "Resume", "Reel"], commission: "10–20%",
      fees: "No upfront fees.", careerLevel: ["emerging", "experienced", "professional"],
      specialties: ["Studio production market"], businessInfo: "Agency serving the Atlanta production hub.",
      verificationState: "verified", trustLevel: 4,
    },
    {
      name: "West Coast Voices", location: "Los Angeles, CA", website: "https://example.com/wcv",
      contactEmail: "vo@westcoastvoices.example", representationSpecialties: ["voice"],
      marketsServed: ["Los Angeles", "Remote", "Nationwide"], submissionMethod: "referral",
      submissionRequirements: ["VO demo", "Home studio details"], commission: "10–15%",
      fees: "No upfront fees.", careerLevel: ["experienced", "professional"],
      specialties: ["Animation and commercial VO"], businessInfo: "Voice-focused representation.",
      verificationState: "verified", trustLevel: 4,
    },
    {
      name: "New York Screen Partners", location: "New York, NY", website: "https://example.com/nysp",
      contactEmail: "submissions@nysp.example", representationSpecialties: ["film/tv", "theater", "commercial"],
      marketsServed: ["New York", "Nationwide"], submissionMethod: "referral",
      submissionRequirements: ["Headshot", "Resume", "Reel"], commission: "10–20%",
      fees: "No upfront fees.", careerLevel: ["experienced", "professional"],
      specialties: ["Theater and prestige TV"], businessInfo: "Full-service NYC agency.",
      verificationState: "partial", trustLevel: 3,
    },
    {
      name: "Chicago Commercial Talent", location: "Chicago, IL", website: "https://example.com/cct",
      contactEmail: "hello@chicagocommercial.example", representationSpecialties: ["commercial", "film/tv"],
      marketsServed: ["Chicago", "Nationwide"], submissionMethod: "open",
      submissionRequirements: ["Headshot", "Resume"], commission: "10–20%",
      fees: "No upfront fees.", careerLevel: ["emerging", "experienced"],
      specialties: ["Commercial market"], businessInfo: "Midwest commercial representation.",
      verificationState: "needs_review", trustLevel: 2,
    },
    {
      name: "Starlight Talent Group", location: "Nationwide", website: "https://example.com/starlight",
      contactEmail: "join@starlighttalent.example", representationSpecialties: ["management"],
      marketsServed: ["Nationwide"], submissionMethod: "open",
      submissionRequirements: ["Payment", "Photos with our photographer"], commission: "Unclear",
      fees: "Requires a mandatory paid photo package to join.", careerLevel: ["beginner"],
      specialties: [], businessInfo: "Makes guaranteed-representation claims; charges talent up front.",
      verificationState: "flagged", trustLevel: 1,
    },
  ];

  for (const a of agencies) {
    await db.agency.create({
      data: {
        name: a.name, location: a.location, website: a.website, contactEmail: a.contactEmail,
        representationSpecialties: a.representationSpecialties, marketsServed: a.marketsServed,
        submissionMethod: a.submissionMethod, submissionRequirements: a.submissionRequirements,
        commission: a.commission, fees: a.fees, careerLevel: a.careerLevel, specialties: a.specialties,
        businessInfo: a.businessInfo, verificationState: a.verificationState, trustLevel: a.trustLevel,
        lastVerifiedAt: daysFromNow(-14), isDemo: true,
      },
    });
  }

  // --- Reports + Tickets -----------------------------------------------------
  const flagged = createdOpps.find((o) => o.status === "flagged");
  if (flagged) {
    await db.report.create({
      data: { opportunityId: flagged.id, userId: actor.id, reason: "Suspicious payment request",
        details: "Asked for a $199 fee via gift card before any audition.", status: "reviewing" },
    });
  }

  await db.ticket.create({
    data: {
      userId: actor.id, category: "Upload problems", priority: "medium", status: "open",
      subject: "Cannot upload self-tape", description: "My self-tape upload fails at 80% on Chrome.",
      assignedId: support.id,
    },
  });
  await db.ticket.create({
    data: {
      userId: actor.id, category: "Suspicious opportunities", priority: "critical", status: "in_progress",
      subject: "Casting call asked for my bank info", description: "A listing requested banking details before an audition.",
      assignedId: moderator.id, internalNotes: "Cross-reference with flagged listing; possible phishing pattern.",
    },
  });
  await db.ticket.create({
    data: {
      userId: actor.id, category: "Password reset", priority: "low", status: "resolved",
      subject: "Reset link expired", description: "The reset link expired before I could use it.",
      resolution: "Issued a new reset link; user confirmed access.", assignedId: support.id, closedAt: daysFromNow(-1),
    },
  });

  // --- Knowledge base --------------------------------------------------------
  const articles = [
    { slug: "how-verification-works", title: "How CASTCHECK verification works", category: "Trust & safety",
      summary: "What our verification states and trust levels mean.",
      body: "CASTCHECK reviews each opportunity across defined checks: production company, casting contact, official website, submission method, compensation, and personal-info requests. Nothing is labeled 'Verified' unless it meets our Level 4 requirements. We never hide uncertainty — every check is shown individually." },
    { slug: "information-to-avoid-sharing", title: "What information to avoid sharing", category: "Trust & safety",
      summary: "Never share these until you have independently verified an organization.",
      body: "Legitimate casting rarely needs your SSN, government ID, banking information, or passwords up front. Be cautious about home address before verifiable production details. If a listing asks for highly sensitive data early, verify the organization independently first." },
    { slug: "how-to-submit-an-audition", title: "How to submit an audition", category: "Getting started",
      summary: "Prepare and submit a self-tape.",
      body: "Read the sides and requirements carefully. Record in good light with clear audio, slate if requested, and follow the file-format instructions. Submit only through the stated method — never pay a fee to audition." },
    { slug: "how-to-save-an-opportunity", title: "How to save an opportunity", category: "Getting started",
      summary: "Save listings and track them.",
      body: "Use the Save button on any opportunity card or detail page. Saved items appear under Saved, and you can move them into your application tracker at any status." },
    { slug: "how-to-reset-your-password", title: "How to reset your password", category: "Account",
      summary: "Recover access to your account.",
      body: "Use the sign-in page's reset flow. Reset links expire for your security — request a new one if it lapses. If you're still stuck, open a support ticket." },
    { slug: "how-to-enable-mfa", title: "How to enable MFA", category: "Account",
      summary: "Add a second factor to your account.",
      body: "CASTCHECK is built MFA-ready. When enabled, you'll confirm a second factor at sign-in. This protects against account takeover even if your password is exposed." },
    { slug: "how-to-upload-a-self-tape", title: "How to upload a self-tape", category: "Getting started",
      summary: "Attach video materials to an application.",
      body: "From an application, choose Add materials and select your file. Keep files within the supported size and format. If an upload fails, try a smaller file or a different browser, then contact support." },
    { slug: "how-to-report-a-casting-call", title: "How to report a casting call", category: "Trust & safety",
      summary: "Flag a suspicious or incorrect listing.",
      body: "Every opportunity has a Report button. Choose a reason — scam, suspicious payment, excessive personal info, impersonation, and more. Your report becomes a trust & safety ticket our team reviews." },
    { slug: "how-to-evaluate-a-talent-agency", title: "How to evaluate a talent agency", category: "Trust & safety",
      summary: "Signals of a legitimate agency.",
      body: "Legitimate agencies earn commission from work you book — they do not require large upfront fees or mandatory in-house photo packages to sign you. Be wary of guaranteed representation. Check markets served, specialties, and public business information." },
    { slug: "how-to-update-your-profile", title: "How to update your profile", category: "Getting started",
      summary: "Keep your acting profile current.",
      body: "Update your headshot, resume, credits, skills, and career goals from Profile. Your goals power career-fit and agency matching, so keep preferred mediums, markets, and role types accurate." },
  ];
  for (const a of articles) await db.knowledgeArticle.create({ data: a });

  // --- GRC: risk register ----------------------------------------------------
  const register = [
    { risk: "Fake casting call", asset: "Opportunity records", threat: "Fraudsters posting fake listings", vulnerability: "Open submission of opportunities", likelihood: 4, impact: 5, control: "Opportunity verification workflow", residual: 8, owner: "Trust & safety", status: "active" },
    { risk: "Account takeover", asset: "User accounts", threat: "Credential theft / phishing", vulnerability: "Password-only auth", likelihood: 3, impact: 5, control: "MFA-ready + RBAC + secure sessions", residual: 5, owner: "IT / security", status: "active" },
    { risk: "Data exposure", asset: "Actor profiles", threat: "Unauthorized data access", vulnerability: "Over-collection of PII", likelihood: 3, impact: 5, control: "Data classification + minimization", residual: 6, owner: "Security", status: "active" },
    { risk: "Unauthorized access", asset: "Admin functions", threat: "Privilege misuse", vulnerability: "Broad permissions", likelihood: 3, impact: 4, control: "RBAC + least privilege", residual: 4, owner: "IT", status: "active" },
    { risk: "Bad listing", asset: "Opportunity records", threat: "Low-quality or misleading listings", vulnerability: "Limited review capacity", likelihood: 4, impact: 4, control: "Moderation + reporting workflow", residual: 6, owner: "Operations", status: "active" },
  ];
  for (const r of register) await db.riskRegisterEntry.create({ data: r });

  // --- GRC: incidents --------------------------------------------------------
  await db.incident.create({
    data: {
      reference: "IR-2026-014", category: "Fake casting call", severity: "high",
      affectedAssets: "Opportunity records; potentially affected users",
      summary: "A listing requesting gift-card payment and Telegram contact was reported by a user.",
      evidence: "User report CC-report; listing snapshot retained.",
      parties: "Reporting user; trust & safety analyst",
      immediateActions: "Listing flagged and hidden from discovery; report escalated.",
      recommendedActions: "Add gift-card + off-platform pattern to risk indicators; notify affected viewers.",
      status: "investigating",
    },
  });
  await db.incident.create({
    data: {
      reference: "IR-2026-009", category: "Phishing", severity: "medium",
      affectedAssets: "User accounts",
      summary: "Phishing email impersonating CASTCHECK support requested password reset.",
      evidence: "Email headers captured.", parties: "Security team",
      immediateActions: "Warned users; confirmed no CASTCHECK systems compromised.",
      recommendedActions: "Publish knowledge-base guidance on recognizing phishing.",
      status: "resolved", lessonsLearned: "Reinforced that CASTCHECK never requests passwords by email.",
    },
  });

  console.log("Seed complete.");
  console.log(`Demo accounts (password: ${DEMO_PW}):`);
  console.log("  actor@castcheck.app · casting@ · agency@ · moderator@ · support@ · grc@ · admin@castcheck.app");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
