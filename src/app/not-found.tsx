import { Nav } from "@/components/nav";
import { ProblemCard } from "@/components/problem";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <ProblemCard
          code="404"
          title="Page not found"
          message="That URL doesn't match anything on CASTCHECK. It may have moved, or never existed."
        />
      </main>
    </>
  );
}
