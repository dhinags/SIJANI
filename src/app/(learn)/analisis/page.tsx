import Link from "@/components/safe-link";
import { z } from "zod";
import { PageHeading } from "@/components/common";
import { Reflection } from "@/components/reflection";
import { pageUser } from "@/lib/auth";
import { db } from "@/lib/db";
export default async function Analysis() {
  const user = await pageUser(); const caseSlug = "kerahasiaan-dalam-supervisi";
  const [scenario, assessment] = await Promise.all([db.caseScenario.findUniqueOrThrow({ where: { slug: caseSlug } }), db.rubricAssessment.findUnique({ where: { userId_caseSlug: { userId: user.id, caseSlug } } })]);
  const entries = assessment ? z.array(z.object({ id: z.string(), text: z.string(), rating: z.number() })).parse(assessment.entries) : [];
  return <><section className="surface"><h2>Laboratorium dengan draf tersimpan</h2><p>Gunakan ruang kasus untuk menyimpan analisis parsial, tinjauan, dan revisi. Refleksi lama Anda tetap tersedia di bawah.</p><Link className="text-link" href="/laboratorium">Buka Laboratorium Analisis Kasus</Link></section><PageHeading eyebrow="RUANG REFLEKSI / 11 DIMENSI" title="Bukan hanya jawaban. Alasanmu berarti." description="Tulis analisis kasus, lalu gunakan rubrik untuk meninjau kualitas penalaranmu sendiri." /><section className="case-narrative"><span className="eyebrow">{scenario.title}</span><p>{scenario.narrative}</p></section><Reflection initial={entries} draftKey={`reflection:${user.id}:${caseSlug}`} /></>;
}
