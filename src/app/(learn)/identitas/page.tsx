import { redirect } from "next/navigation";
import { pageUser } from "@/lib/auth";
import { ProfileForm } from "@/components/account-forms";
import { PageHeading } from "@/components/common";
export default async function Identity() {
  const user = await pageUser();
  if (user.profile?.onboardingDone) redirect("/beranda");
  return <><PageHeading eyebrow="01 / PROFIL BELAJAR" title="Mari mulai dari dirimu." description="Pilih nama samaran dan cara belajar untuk ruang praktik ini." /><div className="two-columns"><section className="surface"><h2>Profil praktik</h2><ProfileForm displayName={user.profile?.displayName ?? "Pelajar demo"} preference={user.profile?.preference ?? "bertahap"} onboarding /></section><aside className="surface soft"><span className="status-badge">BELUM TERHUBUNG</span><h2>Verifikasi NPM</h2><p>Verifikasi identitas institusi memerlukan layanan resmi yang belum dikonfigurasi. Dalam demo, langkah ini dilewati tanpa memberikan status mahasiswa terverifikasi.</p><p>NPM bukan kata sandi dan tidak memberikan izin pengajar. Gunakan hanya informasi sintetis.</p></aside></div></>;
}
