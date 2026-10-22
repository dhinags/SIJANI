import Link from "@/components/safe-link";
import { ArrowRight, GraduationCap, LockKeyhole } from "lucide-react";
import { PageHeading } from "@/components/common";
export default function Blocks() {
  return <><PageHeading eyebrow="DARI KONSEP MENUJU PENALARAN" title="Blok Pembelajaran" description="Ruang belajar terstruktur untuk menghubungkan pengetahuan dengan tanggung jawab profesional." /><Link href="/blok/etik-hukum" className="block-feature"><div><span className="status-badge light-badge">BLOK 01 · PILOT PEMBELAJARAN</span><h2>Kode Etik<br />dan Hukum</h2><p>Kenali dilema, pertimbangkan alternatif, dan bangun keputusan yang beralasan.</p><span className="text-link">Jelajahi blok <ArrowRight size={18} /></span></div><GraduationCap size={120} strokeWidth={0.8} /></Link><section className="planned-block"><div><span className="eyebrow">BLOK 02 · DIRENCANAKAN</span><h2>Asesmen Psikologi</h2><p>Kurikulum, materi, dan kegiatan belajar menunggu persetujuan akademik. Belum diluncurkan.</p></div><LockKeyhole size={30} strokeWidth={1.3} /></section></>;
}
