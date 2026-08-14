"use client";

import { useEffect } from "react";
import { ProblemCard } from "@/components/problem";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ProblemCard
      title="Something went wrong"
      message="An unexpected error occurred. Try again, or head back to browsing casting calls."
      reset={reset}
    />
  );
}
