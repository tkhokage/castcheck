import { ProblemCard } from "@/components/problem";

export default function MainNotFound() {
  return (
    <ProblemCard
      code="404"
      title="We couldn't find that"
      message="The page or listing you're looking for doesn't exist or may have been removed."
    />
  );
}
