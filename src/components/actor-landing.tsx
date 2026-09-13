import Link from "next/link";
import { ArrowUpRight, ArrowRight, Search, ShieldCheck, Sparkles, Bookmark, Check, Theater } from "lucide-react";
import { WorldJourney } from "./world-journey";

export function ActorLanding() {
  return <div className="actor-landing">
    <div className="journey-shell" id="actor-journey">
      <div className="journey-visual"><WorldJourney /></div>
      <div className="journey-copy">
        <section className="journey-chapter chapter-intro">
          <p className="eyebrow"><span /> FOR THE PART YOU HAVEN’T PLAYED YET</p>
          <h1>Your next role.<br />A whole new<br /><em>world.</em></h1>
          <p className="chapter-description">Big dreams deserve a clearer path. Find casting opportunities, understand the evidence, and make your next move.</p>
          <div className="landing-actions"><Link href="/discover" className="landing-button">Find your next role <ArrowUpRight size={18} /></Link><Link href="/find/import" className="landing-text-link">Bring a casting call <ArrowRight size={16} /></Link></div>
          <div className="hero-footnote"><ShieldCheck size={16} /><span>Built for actors. Grounded in evidence.</span></div>
          <div className="chapter-index"><span>01 / 04</span><span>THE FIRST STEP</span></div>
        </section>
        <section className="journey-chapter" id="discover-your-path">
          <p className="eyebrow">01 — DISCOVER</p><h2>Somewhere out there,<br />there’s a part<br /><em>for you.</em></h2>
          <p className="chapter-description">Explore the collection by role or market. Already spotted something elsewhere? Bring the source into your own workspace.</p>
          <form className="landing-search" action="/discover" role="search"><label><span className="sr-only">Search casting calls</span><Search size={19} /><input name="q" placeholder="Role, production, or company" /></label><button aria-label="Search casting calls"><ArrowRight size={21} /></button></form>
          <div className="market-links">{["Dallas", "Austin", "Los Angeles", "New York", "Remote"].map(city => <Link key={city} href={`/discover?location=${encodeURIComponent(city)}`}>{city} ↗</Link>)}</div>
          <p className="landing-small">Source dates and sample labels stay visible. Always confirm a call is still open.</p>
          <div className="chapter-index"><span>02 / 04</span><span>FIND YOUR DIRECTION</span></div>
        </section>
        <section className="journey-chapter">
          <p className="eyebrow">02 — GET CLARITY</p><h2>More confidence.<br /><em>Less guesswork.</em></h2>
          <p className="chapter-description">Put the source, checks, and questions in one place. See what’s known, what’s missing, and what deserves a closer look.</p>
          <div className="evidence-note"><div className="evidence-heading"><ShieldCheck size={20} /><span>Evidence before excitement.</span></div><ul><li><Check size={16} /> Follow the original source</li><li><Check size={16} /> Understand risk separately from career fit</li><li><Check size={16} /> Keep your imported calls private</li></ul><Link href="/knowledge/how-verification-works">See how checks work <ArrowUpRight size={16} /></Link></div>
          <p className="landing-small">A check is a starting point. It cannot guarantee that an opportunity is safe.</p>
          <div className="chapter-index"><span>03 / 04</span><span>MOVE WITH CONFIDENCE</span></div>
        </section>
        <section className="journey-chapter chapter-finale">
          <p className="eyebrow"><Theater size={17} /> 03 — TAKE YOUR PLACE</p><h2>The world’s a stage.<br /><em>Make your entrance.</em></h2>
          <p className="chapter-description">Save the possibilities. Track the applications. Find representation that fits your direction. Your next chapter starts with one step.</p>
          <Link href="/register" className="landing-button">Create your workspace <ArrowUpRight size={18} /></Link>
          <Link href="/agencies" className="landing-text-link finale-link">Explore the agency district <ArrowRight size={16} /></Link>
          <div className="chapter-index"><span>04 / 04</span><span>THIS IS YOUR CUE</span></div>
        </section>
      </div>
    </div>
    <section className="landing-toolkit"><div><p className="eyebrow">BACKSTAGE, ORGANIZED</p><h2>Space for your ambition.</h2></div><div className="toolkit-grid">{[{ icon: Search, title: "Find the possibilities", text: "Search the collection or head straight to casting source websites.", href: "/find" }, { icon: Sparkles, title: "Find your people", text: "Explore agencies, their specialties, and the evidence behind each record.", href: "/agencies" }, { icon: Bookmark, title: "Keep the story moving", text: "Keep saved calls and application progress together in your workspace.", href: "/tracker" }].map(item => <Link href={item.href} key={item.title}><item.icon size={24} /><h3>{item.title}</h3><p>{item.text}</p><ArrowUpRight className="toolkit-arrow" size={21} /></Link>)}</div></section>
  </div>;
}
