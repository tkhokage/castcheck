// Domain vocabulary for CASTCHECK. Single source of truth for filters, labels,
// and select options across the app.

// TODO(operator): before launch, replace these PLACEHOLDER addresses with real,
// monitored inboxes on your own domain (the `.example` TLD is non-functional on
// purpose so nothing looks real until you set it). Update /.well-known/security.txt too.
export const CONTACT_EMAIL = "contact@castcheck.example";
export const SECURITY_EMAIL = "security@castcheck.example";

export const OPPORTUNITY_TYPES = [
  "film",
  "television",
  "theater",
  "commercial",
  "indie",
  "short",
  "student",
  "web series",
  "voice",
  "background",
  "music video",
  "other",
] as const;

export const LOCATIONS = [
  "Dallas/Fort Worth",
  "Austin",
  "Houston",
  "Atlanta",
  "Los Angeles",
  "New York",
  "Chicago",
  "Remote",
  "Nationwide",
] as const;

export const COMPENSATION = ["paid", "unpaid", "deferred", "expenses", "unknown"] as const;

export const PRODUCTION_TYPES = [
  "studio",
  "independent",
  "student",
  "nonprofit",
  "community",
  "experimental",
  "other",
] as const;

export const ROLE_TYPES = [
  "lead",
  "supporting",
  "featured",
  "day player",
  "background",
  "ensemble",
  "voice",
] as const;

export const EXPERIENCE_LEVELS = ["beginner", "emerging", "experienced", "professional"] as const;

export const REPRESENTATION_TYPES = [
  "film/tv",
  "commercial",
  "theater",
  "voice",
  "modeling",
  "management",
] as const;

export const APPLICATION_STATUSES = [
  "saved",
  "planning",
  "applied",
  "submitted",
  "audition_scheduled",
  "callback",
  "offer",
  "booked",
  "rejected",
  "withdrawn",
  "expired",
] as const;

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  saved: "Saved",
  planning: "Planning to apply",
  applied: "Applied",
  submitted: "Submitted",
  audition_scheduled: "Audition scheduled",
  callback: "Callback",
  offer: "Offer",
  booked: "Booked",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  expired: "Expired",
};

export const VERIFICATION_STATES = {
  verified: { label: "Verified", tone: "success" },
  partial: { label: "Partially verified", tone: "info" },
  needs_review: { label: "Needs review", tone: "neutral" },
  flagged: { label: "Flagged", tone: "warning" },
  high_risk: { label: "High risk", tone: "danger" },
  rejected: { label: "Rejected", tone: "danger" },
} as const;

export type VerificationState = keyof typeof VERIFICATION_STATES;

export const TRUST_LEVELS: Record<number, { name: string; meaning: string }> = {
  1: { name: "User submitted", meaning: "Came directly from a user" },
  2: { name: "Publicly observable", meaning: "Findable publicly" },
  3: { name: "Corroborated", meaning: "Multiple sources agree" },
  4: { name: "Verified", meaning: "Defined verification requirements satisfied" },
};

export const CHECK_KEYS = [
  { key: "production_company", label: "Production company" },
  { key: "casting_contact", label: "Casting contact" },
  { key: "official_website", label: "Official website" },
  { key: "submission_method", label: "Submission method" },
  { key: "compensation_details", label: "Compensation details" },
  { key: "contact_info", label: "Contact information" },
  { key: "personal_info", label: "Personal info requests" },
] as const;

export const REPORT_REASONS = [
  "Scam",
  "Fake casting call",
  "Suspicious payment request",
  "Excessive personal information request",
  "Impersonation",
  "Misleading information",
  "Broken link",
  "Duplicate",
  "Inappropriate content",
  "Incorrect information",
  "Other",
] as const;

export const TICKET_CATEGORIES = [
  "Login problems",
  "Password reset",
  "MFA issues",
  "Profile problems",
  "Upload problems",
  "Broken audition links",
  "Application tracking issues",
  "Incorrect agency information",
  "Suspicious opportunities",
  "Account problems",
  "General technical",
] as const;

export const TICKET_PRIORITIES = ["low", "medium", "high", "critical"] as const;
export const TICKET_STATUSES = ["open", "in_progress", "waiting", "resolved", "closed"] as const;

export const RISK_CATEGORIES = {
  financial: "Financial",
  identity: "Identity",
  communication: "Communication",
  information: "Information requests",
  quality: "Opportunity quality",
} as const;

export const ROLES = {
  actor: "Actor",
  casting: "Casting professional",
  agency: "Agency",
  moderator: "Moderator",
  support: "Support analyst",
  grc: "GRC analyst",
  admin: "Administrator",
} as const;

export type Role = keyof typeof ROLES;

export const DATA_TIERS = [
  { tier: "Public", examples: "Headshot, resume, demo reel, credits, website", handling: "Freely shared" },
  { tier: "Professional", examples: "Professional email and phone, submission history", handling: "Platform use" },
  { tier: "Sensitive", examples: "Home address, contracts, private correspondence", handling: "Optional, minimized" },
  { tier: "Highly sensitive", examples: "SSN, government ID, banking, passwords", handling: "Never collected" },
] as const;
