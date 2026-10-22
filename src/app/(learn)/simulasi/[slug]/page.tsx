import Link from "@/components/safe-link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, FileText, Save } from "lucide-react";
import { db } from "@/lib/db";
import { pageUser } from "@/lib/auth";
import {visibleCase} from "@/lib/lab";
import { presentAttempt } from "@/lib/attempts";
import { PageHeading, ContentNotice } from "@/components/common";
import { StartAttempt } from "@/components/start-attempt";
import { Simulation } from "@/components/simulation";
export default async function CasePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ attempt?: string }> }) {
  const user = await pageUser(); const { slug } = await params; const query = await searchParams;
  const scenario = await db.caseScenario.findFirst({ where: { AND:[{slug},visibleCase()] } }); if (!scenario) notFound();
  const raw = typeof query.attempt === "string" ? await db.simulationAttempt.findFirst({ where: { id: query.attempt, userId: user.id, caseSlug: slug } }) : null;
  if (query.attempt && !raw) notFound();
  const attempt = raw ? presentAttempt(raw) : null;
  const draft = !attempt ? await db.simulationAttempt.findFirst({ where: { userId: user.id, caseSlug: slug, status: "DRAFT" } }) : null;
  return <><Link href="/blok/etik-hukum" className="back-link"><ArrowLeft size={16} />Blok 1: Kode Etik dan Hukum</Link><PageHeading eyebrow="LABORATORIUM PENALARAN / KASUS SINTETIS" title={attempt?.caseSnapshot?.title??scenario.title} description="Baca konteksnya. Pertimbangkan informasi yang tersedia sebelum memilih tindakan." /><section className="case-narrative"><span className="eyebrow">SITUASI KASUS</span><p>{attempt?.caseSnapshot?.narrative??scenario.narrative}</p>{attempt&&!attempt.caseSnapshot&&<p className="fine-print">Percobaan lama belum menyimpan narasi; konteks yang ditampilkan berasal dari catatan kasus saat ini.</p>}<span className="fine-print">Kasus fiktif untuk latihan. Tidak merepresentasikan peserta layanan nyata.</span></section>{attempt ? <Simulation key={attempt.id} initial={attempt} /> : <section className="surface case-start"><h2>Berlatih mengambil perspektif.</h2><p>Lima pertanyaan dalam lima format: pilihan tunggal, pilihan majemuk, pasangan, urutan, dan skenario multi-bagian.</p><div className="case-start-meta"><span><Clock3 size={18} />{scenario.estimatedMinutes?`${scenario.estimatedMinutes} menit`:"Durasi belum ditetapkan"}</span><span><FileText size={18} />Skor formatif 0–100</span><span><Save size={18} />Simpan & lanjutkan</span></div><p>Setiap pertanyaan berbobot sama. Jawaban majemuk yang tidak tepat mengurangi kredit; tidak ada skor negatif. Umpan balik dan kunci muncul setelah seluruh jawaban dikirim.</p><StartAttempt caseSlug={slug} label={draft ? "Lanjutkan draf" : "Mulai latihan"} /></section>}<ContentNotice /></>;
}
