"use client";
import { ActionError } from "./action-error";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { requestJson } from "@/lib/client";
export function StartAttempt({ caseSlug, label = "Mulai latihan" }: { caseSlug: string; label?: string }) {
  const router = useRouter(); const [error, setError] = useState(""); const [pending, setPending] = useState(false);
  async function start() { setPending(true); try { const attempt = await requestJson<{ id: string }>("/api/attempts", "POST", { caseSlug }); router.push(`/simulasi/${caseSlug}?attempt=${attempt.id}`); router.refresh(); } catch (e) { setError((e as Error).message); setPending(false); } }
  return <><Button onClick={start} disabled={pending}>{pending ? "Menyiapkan latihan…" : label}<ArrowRight size={17} /></Button><ActionError message={error} /></>;
}
