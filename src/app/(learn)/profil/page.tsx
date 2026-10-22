import Link from "@/components/safe-link";
import { ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import { PageHeading } from "@/components/common";
import { ProfileForm, LogoutButton } from "@/components/account-forms";
import { pageUser } from "@/lib/auth";
import { learningSummary } from "@/lib/learning";
import { initials } from "@/lib/navigation";
export default async function Profile() {
  const user = await pageUser(); const summary = await learningSummary(user.id);
  const displayName = user.profile?.displayName ?? "Pelajar demo";
  return <><PageHeading eyebrow="RUANG PRIBADI" title="Profil belajar" description="Atur preferensimu dan lanjutkan perjalanan yang sudah kamu mulai." /><section className="profile-overview surface"><span className="avatar avatar-large">{initials(displayName)}</span><div><h2>{displayName}</h2><p>Profil demo · identitas mahasiswa belum diverifikasi</p></div><Link href={summary.draft ? `/simulasi/${summary.draft.caseSlug}?attempt=${summary.draft.id}` : "/beranda"} className="button button-primary">Lanjutkan belajar <ArrowRight size={17} /></Link></section><div className="profile-stats"><span><BookOpen size={20} />{summary.completed} bacaan dipelajari</span><span><CheckCircle2 size={20} />{summary.submitted} latihan selesai</span><Link href="/progress" className="text-link">Lihat seluruh progres <ArrowRight size={16} /></Link></div><div className="two-columns"><section className="surface"><h2>Preferensi belajar</h2><ProfileForm displayName={displayName} preference={user.profile?.preference ?? "bertahap"} /><p className="fine-print">Preferensi disimpan. Rekomendasi personal belum diaktifkan.</p></section><aside className="surface soft"><span className="status-badge">PROFIL DEMO</span><h2>Sesi praktik pribadi</h2><p>Jawaban dan progres dihubungkan dengan sesi Anda di server. Profil ini bukan identitas mahasiswa terverifikasi.</p><p>Sesi berakhir setelah 7 hari. Keluar atau menghapus cookie membuat profil demo ini tidak dapat dibuka kembali. Tidak ada pemulihan akun pada mode demo.</p><LogoutButton /></aside></div></>;
}
