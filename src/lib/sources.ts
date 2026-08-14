// External casting sources. CASTCHECK links OUT to these official sites — it does
// not scrape them or store your login for them. You sign in on their own site.
// This is the ToS-safe "launchpad" model: find calls there, then import the ones
// you're pursuing into CASTCHECK to verify, risk-check, and track.

export interface CastingSource {
  id: string;
  name: string;
  url: string;
  blurb: string;
  access: string; // honest note about accounts/subscriptions
  /** Optional deep search by opportunity type / market, where the site supports it. */
  search?: (opts: { type?: string; location?: string }) => string;
}

export const CASTING_SOURCES: CastingSource[] = [
  {
    id: "actors-access",
    name: "Actors Access",
    url: "https://www.actorsaccess.com/",
    blurb: "Breakdown Services' actor submission site — a primary source for film, TV, and commercial roles.",
    access: "Free to create a profile and browse many roles; submitting to most projects needs a paid Actors Access / Showfax account.",
  },
  {
    id: "casting-networks",
    name: "Casting Networks",
    url: "https://www.castingnetworks.com/",
    blurb: "Casting platform used widely by casting directors for on-camera, commercial, and theatrical work.",
    access: "Account required. Free and paid membership tiers.",
  },
  {
    id: "backstage",
    name: "Backstage",
    url: "https://www.backstage.com/casting/",
    blurb: "Open casting calls across film, TV, theater, student & indie film, voiceover, and more.",
    access: "Some listings are viewable publicly; applying requires a Backstage subscription.",
    search: ({ type, location }) => {
      const params = new URLSearchParams();
      if (type) params.set("q", type);
      if (location) params.set("location", location);
      const qs = params.toString();
      return `https://www.backstage.com/casting/${qs ? `?${qs}` : ""}`;
    },
  },
  {
    id: "imdbpro",
    name: "IMDbPro",
    url: "https://pro.imdb.com/",
    blurb: "Industry database — productions in development, company and representation contacts, and casting info.",
    access: "Requires an IMDbPro subscription (separate from a free IMDb account).",
  },
];
