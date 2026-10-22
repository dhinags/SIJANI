"use client";
import { ActionError } from "./action-error";
import { useState } from "react";
import Link from "@/components/safe-link";
import { Check, CheckCheck } from "lucide-react";
import { Button } from "./ui/button";
import { requestJson } from "@/lib/client";
export function CompleteArticle({ slug, completed, signedIn }: { slug: string; completed: boolean; signedIn: boolean }) {
  const [done, setDone] = useState(completed); const [pending, setPending] = useState(false); const [error, setError] = useState("");
  async function mark() { if (pending || done) return; setPending(true); setError(""); try { await requestJson("/api/progress", "POST", { articleSlug: slug }); setDone(true); } catch (e) { setError((e as Error).message); } finally { setPending(false); } }
  if (!signedIn) return <Button asChild><Link href="/masuk">Masuk untuk menyimpan progres</Link></Button>;
  return <><Button disabled={done || pending} onClick={mark}>{done ? <CheckCheck size={18} /> : <Check size={18} />}{done ? "Sudah dipelajari" : pending ? "Menyimpan…" : "Tandai sudah dipelajari"}</Button><ActionError message={error} /><span className="sr-only" role="status">{done ? "Progres membaca tersimpan." : ""}</span></>;
}
