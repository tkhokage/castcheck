"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { uploadMedia } from "@/app/actions/upload";
import { Card } from "@/components/ui";
import { Upload, FileText, Video, Check, Loader2 } from "lucide-react";

type Kind = "headshot" | "resume" | "reel";

const META: Record<Kind, { title: string; accept: string; hint: string; icon: React.ElementType }> = {
  headshot: { title: "Headshot", accept: "image/png,image/jpeg,image/webp", hint: "PNG/JPG/WebP · up to 5MB", icon: Upload },
  resume: { title: "Resume", accept: "application/pdf", hint: "PDF · up to 10MB", icon: FileText },
  reel: { title: "Demo reel", accept: "video/mp4,video/quicktime,video/webm", hint: "MP4/MOV/WebM · up to 10MB", icon: Video },
};

export function Uploader({ kind, currentUrl }: { kind: Kind; currentUrl?: string | null }) {
  const meta = META[kind];
  const [url, setUrl] = useState<string | null>(currentUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.set("kind", kind);
    fd.set("file", file);
    start(async () => {
      const res = await uploadMedia(undefined, fd);
      if (res?.error) setError(res.error);
      else if (res?.url) setUrl(res.url);
    });
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <meta.icon className="h-4 w-4 text-primary" />
          <span className="font-medium">{meta.title}</span>
        </div>
        {url && !pending && <Check className="h-4 w-4 text-success" />}
        {pending && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
      </div>

      {kind === "headshot" && url && (
        <div className="mt-3 overflow-hidden rounded-lg border border-border">
          <Image src={url} alt="Headshot" width={200} height={200} unoptimized className="h-40 w-full object-cover" />
        </div>
      )}
      {kind !== "headshot" && url && (
        <a href={url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">
          View current {meta.title.toLowerCase()}
        </a>
      )}

      <input ref={inputRef} type="file" accept={meta.accept} onChange={onChange} className="hidden" />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={pending}
        className="mt-3 w-full rounded-lg border border-dashed border-border-strong px-3 py-2 text-sm font-medium text-muted hover:border-primary hover:text-primary disabled:opacity-50"
      >
        {pending ? "Uploading…" : url ? "Replace" : "Upload"}
      </button>
      <p className="mt-1 text-xs text-muted-2">{meta.hint}</p>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </Card>
  );
}
