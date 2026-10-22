import Link from "@/components/safe-link";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeading } from "@/components/common";
import { ShieldCheck } from "lucide-react";
export default async function Lecturer() {
  const user = await currentUser();
  if (!user || user.role !== "DOSEN") return <section className="access-denied"><ShieldCheck size={38} /><h1>Ruang dosen dilindungi.</h1><p>Halaman ini memerlukan akun pengajar yang diberi izin di server. Profil demo mahasiswa tidak dapat mengubah perannya sendiri.</p><p>Integrasi akun institusi dan proses pemberian izin pengajar belum tersedia pada milestone ini.</p></section>;
  const [articles, sources] = await Promise.all([db.article.findMany({ select: { slug: true, title: true, status: true } }), db.academicSource.findMany()]);
  return <><section className="surface"><h2>Tinjauan kasus mahasiswa</h2><p>Izin diberikan per mahasiswa dan kasus. Peran DOSEN saja tidak membuka analisis.</p><Link className="button button-primary" href="/dosen/review">Buka antrean tinjauan kasus</Link></section><PageHeading eyebrow="RUANG DOSEN / TINJAUAN KONTEN" title="Antrean tinjauan akademik" description="Inventaris materi percontohan. Akses ini tidak memberikan izin melihat jawaban atau profil mahasiswa." /><section className="surface"><h2>{articles.length} artikel untuk ditinjau</h2><ul>{articles.map(a => <li key={a.slug}>{a.title} · {a.status}</li>)}</ul><h2>{sources.length} sumber menunggu verifikasi</h2><ul>{sources.map(s => <li key={s.id}>{s.title} · {s.status}</li>)}</ul><p>Penyuntingan konten membutuhkan peran editorial terpisah. Tinjauan mahasiswa menggunakan izin kasus eksplisit.</p></section></>;
}
