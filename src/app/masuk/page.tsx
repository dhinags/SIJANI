import Link from "@/components/safe-link";
import { ArrowLeft, BookOpen, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { DemoLogin } from "@/components/account-forms";
import { demoEnabled } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function Login() {
  const user = await currentUser();
  if (user) redirect(user.profile?.onboardingDone ? "/beranda" : "/identitas");
  return <div className="auth-layout"><aside className="auth-story"><Brand light /><div><span className="eyebrow">PERJALANANMU DIMULAI DI SINI</span><h2>Rasa ingin tahu.<br />Ruang untuk<br /><em>bertumbuh.</em></h2><p>Jelajahi konsep, pertimbangkan berbagai perspektif, dan latih penalaranmu satu langkah demi satu langkah.</p></div><span className="auth-story-footer">Learn Psychology. Think Critically. Practice Responsibly.</span></aside><main id="main-content" className="auth-main"><div className="auth-theme"><ThemeToggle /></div><Link href="/" className="back-link"><ArrowLeft size={16} />Kembali ke beranda</Link><div className="auth-card"><span className="large-icon"><BookOpen size={28} /></span><p className="eyebrow">SELAMAT DATANG DI SI JANI</p><h1>Siap membuka<br />perspektif baru?</h1><p>Mulai dengan profil praktik pribadi. Simpan latihan, lanjutkan eksplorasi, dan lihat perkembangan belajarmu.</p><div className="auth-demo-note"><ShieldCheck size={20} /><div><strong>Pengalaman demo, profil terpisah</strong><p>Tidak memerlukan akun atau NPM asli. Profil tersimpan melalui sesi di browser ini selama 7 hari. Keluar atau menghapus cookie mengakhiri akses ke profil demo ini.</p></div></div><DemoLogin enabled={demoEnabled()} /><p className="fine-print">Autentikasi dan verifikasi NPM institusi belum terhubung. Jangan masukkan data mahasiswa atau kasus nyata.</p><Link href="/encyclopedia" className="text-link">Jelajahi materi tanpa masuk <span aria-hidden>→</span></Link></div></main></div>;
}
