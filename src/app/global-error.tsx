"use client";

import { useEffect } from "react";
import { ProblemCard } from "@/components/problem";
import "./globals.css";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen" style={{ background: "var(--bg)", color: "var(--foreground)" }}>
        <ProblemCard
          title="Something went really wrong"
          message="The app hit a serious error. Please try again — if it keeps happening, contact support."
          reset={reset}
        />
      </body>
    </html>
  );
}
