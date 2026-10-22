"use client";
import { ActionError } from "./action-error";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { requestJson } from "@/lib/client";
import { useClearWorkingCopies, useConfirmNavigation, useUnsavedChanges } from "./navigation-guard";
export function DemoLogin({ enabled }: { enabled: boolean }) {
  const router = useRouter(); const [pending, setPending] = useState(false); const [error, setError] = useState("");
  async function start() { setPending(true); setError(""); try { const result = await requestJson<{ destination: string }>("/api/demo", "POST"); router.push(result.destination); router.refresh(); } catch (e) { setError((e as Error).message); setPending(false); } }
  return <><Button onClick={start} disabled={pending || !enabled} className="full-width">{pending ? "Menyiapkan profil…" : "Masuk ke ruang demo"}<ArrowRight size={18} /></Button>{!enabled && <p className="form-error" role="status">Akun institusi belum terhubung. Akses demo dinonaktifkan.</p>}<ActionError message={error} /></>;
}
export function ProfileForm({ displayName, preference, onboarding = false }: { displayName: string; preference: string; onboarding?: boolean }) {
  const router = useRouter(); const [name, setName] = useState(displayName); const [mode, setMode] = useState(preference); const [pending, setPending] = useState(false); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  useUnsavedChanges(!message && (name !== displayName || mode !== preference));
  async function save(event: React.FormEvent) { event.preventDefault(); if (pending) return; setPending(true); setError(""); setMessage(""); try { await requestJson("/api/profile", "PATCH", { displayName: name, preference: mode, onboardingDone: true }); setMessage("Preferensi berhasil disimpan."); if (onboarding) router.push("/tujuan"); router.refresh(); } catch (e) { setError((e as Error).message); } finally { setPending(false); } }
  return <form onSubmit={save} className="stack-form"><label htmlFor="display-name">Nama samaran<span>Gunakan alias, bukan nama atau NPM asli.</span></label><input id="display-name" name="displayName" value={name} onChange={e => { setName(e.target.value); setMessage(""); }} minLength={2} maxLength={40} required autoComplete="off" /><label htmlFor="preference">Cara belajar yang Anda sukai</label><select id="preference" value={mode} onChange={e => { setMode(e.target.value); setMessage(""); }}><option value="bertahap">Bertahap mengikuti learning path</option><option value="eksplorasi">Bebas mengeksplorasi konsep</option></select><Button type="submit" disabled={pending}>{pending ? "Menyimpan…" : onboarding ? "Lanjutkan ke pilihan belajar" : "Simpan preferensi"}{onboarding ? <ArrowRight size={17} /> : <Check size={17} />}</Button><ActionError message={error} /><p role="status" className="form-success">{message}</p></form>;
}
export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter(); const [error, setError] = useState(""); const [pending, setPending] = useState(false);
  const clear = useClearWorkingCopies(); const confirmNavigation = useConfirmNavigation();
  async function logout() { if (pending || !confirmNavigation() || !window.confirm("Keluar dari profil demo? Profil ini tidak dapat dibuka kembali setelah keluar karena pemulihan akun belum tersedia.")) return; setPending(true); setError(""); try { await requestJson("/api/session", "DELETE"); clear(); router.push("/masuk"); router.refresh(); } catch (e) { setError((e as Error).message); setPending(false); } }
  return <><Button variant={compact ? "ghost" : "secondary"} onClick={logout} disabled={pending}><LogOut size={16} />{pending ? "Keluar…" : "Keluar dari profil demo"}</Button><ActionError message={error} /></>;
}
