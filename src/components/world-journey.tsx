"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play, ArrowDown } from "lucide-react";

const WorldScene = dynamic(() => import("./world-scene"), { ssr: false });

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function WorldJourney() {
  const [enabled, setEnabled] = useState(false);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(!media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return (
    <div className="journey-art" ref={stage}>
      <div className="journey-orbit orbit-one" /><div className="journey-orbit orbit-two" />
      <span className="world-note note-top">A WORLD OF POSSIBILITY</span>
      <div className="world-stage" role="img" aria-label="An actor runs around a miniature world toward a theater with comedy and tragedy masks as you scroll.">
        <Image src="/world/preview.png" alt="" fill sizes="(max-width: 800px) 90vw, 55vw" className="world-poster" style={{ opacity: enabled && ready ? 0 : 1 }} priority />
        {enabled && <SceneBoundary onFailure={() => setReady(false)}><WorldScene paused={paused} onReady={() => setReady(true)} /></SceneBoundary>}
      </div>
      <span className="world-coordinate">YOUR STORY STARTS HERE ↗</span>
      <div className="journey-controls">
        <span><ArrowDown size={14} /> Scroll to follow the journey</span>
        <button type="button" onClick={() => { if (!enabled) setEnabled(true); setPaused(enabled ? !paused : false); }} aria-label={enabled && !paused ? "Pause scene motion" : "Enable scene motion"}>
          {enabled && !paused ? <Pause size={14} /> : <Play size={14} />} {enabled && !paused ? "Pause motion" : "Play motion"}
        </button>
      </div>
    </div>
  );
}
