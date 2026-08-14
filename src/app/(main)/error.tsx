"use client";

import { useEffect } from "react";
import { ProblemCard } from "@/components/problem";

export default function MainError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ProblemCard
      title="Something went wrong"
      message="We hit an unexpected error loading this page. You can try again, or head back to browsing."
      reset={reset}
    />
  );
}
