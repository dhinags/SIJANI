import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { articles, domains, sources, scenario, questions } from "./content";
import { seedKnowledge } from "./knowledge-seed";
import { seedLab } from "./lab-seed";
import { questionSchema } from "../src/lib/scoring";
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
async function main() {
  await db.$transaction(async tx => {
    for (const item of domains) await tx.learningDomain.upsert({ where: { slug: item.slug }, create: item, update: {} });
    for (const item of sources) await tx.academicSource.upsert({ where: { id: item.id }, create: item, update: {} });
    for (const { locator, ...item } of articles) {
      await tx.article.upsert({ where: { slug: item.slug }, create: item, update: {} });
      const citation = { id: `${item.slug}-openstax`, articleSlug: item.slug, sourceId: "openstax", locator };
      await tx.sourceCitation.upsert({ where: { id: citation.id }, create: citation, update: {} });
    }
    const relationship = { id: "classical-operant", fromSlug: "pengondisian-klasik", toSlug: "pengondisian-operan", label: "Bandingkan mekanisme belajar", rationale: "Keduanya membahas pembelajaran asosiatif dengan fokus hubungan yang berbeda. Hubungan editorial; rujukan OpenStax menunggu tinjauan." };
    await tx.conceptRelationship.upsert({ where: { id: relationship.id }, create: relationship, update: {} });
    const block = { slug: "etik-hukum", title: "Kode Etik dan Hukum", description: "Latih cara menimbang bukti, tanggung jawab, dan keputusan profesional.", status: "PILOT", objectives: ["Membedakan fakta dari asumsi", "Mengenali dilema etik dan batas kewenangan", "Menyusun alasan yang mempertimbangkan ketidakpastian"] };
    await tx.learningBlock.upsert({ where: { slug: block.slug }, create: block, update: {} });
    const planned = { slug: "asesmen", title: "Asesmen Psikologi", description: "Kurikulum dan kegiatan belajar menunggu persetujuan akademik.", status: "PLANNED", objectives: [] };
    await tx.learningBlock.upsert({ where: { slug: planned.slug }, create: planned, update: {} });
    await tx.caseScenario.upsert({ where: { slug: scenario.slug }, create: scenario, update: {} });
    for (const [position, raw] of questions.entries()) {
      const definition = questionSchema.parse(raw);
      const item = { id: definition.id, caseSlug: scenario.slug, position, definition };
      await tx.simulationQuestion.upsert({ where: { id: item.id }, create: item, update: {} });
    }
    await seedKnowledge(tx);
    await seedLab(tx);
  }, { timeout: 30000 });
  console.log("Seed ready: knowledge collection preserved; 2 synthetic ethics cases, 10 questions, provisional rubric, and 8 source-orientation sections. No academic approvals or privileged users created.");
}
main().catch(() => { console.error("Seed failed. Check database connectivity and schema."); process.exitCode = 1; }).finally(() => db.$disconnect());
