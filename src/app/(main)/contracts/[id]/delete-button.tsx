"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteContract } from "@/app/actions/contracts";
import { Trash2 } from "lucide-react";

export function DeleteContractButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <button
      onClick={() => start(async () => { await deleteContract(id); router.push("/contracts"); })}
      disabled={pending}
      className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-danger disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" /> {pending ? "Deleting…" : "Delete analysis"}
    </button>
  );
}
