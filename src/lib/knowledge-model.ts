import { z } from "zod";
export const kinds = ["DOMAIN", "APPROACH", "THEORY", "CONCEPT", "THEORIST"] as const;
export const statuses = ["PLANNED", "DRAFT", "UNDER_REVIEW", "VERIFIED", "PUBLISHED"] as const;
export const relationshipTypes = ["BELONGS_TO_DOMAIN", "DEVELOPED_BY", "ASSOCIATED_WITH", "BUILDS_ON", "RELATED_TO", "CONTRASTS_WITH", "APPLIED_IN"] as const;
export const kindLabels = { DOMAIN: "Domain", APPROACH: "Pendekatan", THEORY: "Teori", CONCEPT: "Konsep", THEORIST: "Tokoh" };
export const statusLabels = { PLANNED: "Direncanakan", DRAFT: "Draf", UNDER_REVIEW: "Dalam tinjauan", VERIFIED: "Terverifikasi", PUBLISHED: "Terbit" };
export const relationshipLabels = { BELONGS_TO_DOMAIN: "Termasuk domain", DEVELOPED_BY: "Dikembangkan oleh", ASSOCIATED_WITH: "Berkaitan dengan", BUILDS_ON: "Mengembangkan gagasan", RELATED_TO: "Terkait", CONTRASTS_WITH: "Dibandingkan dengan", APPLIED_IN: "Diterapkan dalam" };
export const fields = {
  alternativeTerms: "Istilah alternatif", definition: "Definisi & gambaran umum", history: "Sejarah & latar belakang", assumptions: "Asumsi utama", mechanisms: "Mekanisme penjelasan",
  applications: "Penerapan", example: "Contoh praktis", misconceptions: "Miskonsepsi umum", evidence: "Dukungan empiris", limitations: "Kritik, batas & ketidakpastian",
  research: "Pendekatan penelitian", strengths: "Kekuatan penjelasan", differences: "Fokus pembeda", biography: "Gambaran biografis", dates: "Tanggal hidup terverifikasi", works: "Karya utama", contributions: "Kontribusi", context: "Konteks teori & pendekatan"
} as const;
const text = z.string().trim().max(6000);
export const checkSchema = z.object({ question: z.string().min(5).max(500), options: z.array(z.string().min(1).max(400)).min(2).max(5), correct: z.number().int().min(0).max(4), explanation: z.string().min(5).max(1200) }).strict().refine(v => v.correct < v.options.length, "Kunci harus menunjuk opsi yang tersedia.");
export const contentSchema = z.object({
  alternativeTerms: text.optional(), definition: text.optional(), history: text.optional(), assumptions: text.optional(), mechanisms: text.optional(), applications: text.optional(), example: text.optional(), misconceptions: text.optional(), evidence: text.optional(), limitations: text.optional(), research: text.optional(), strengths: text.optional(), differences: text.optional(), biography: text.optional(), dates: text.optional(), works: text.optional(), contributions: text.optional(), context: text.optional(), check: checkSchema.optional()
}).strict();
export type KnowledgeContent = z.infer<typeof contentSchema>;
export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100);
export const idSchema = z.string().regex(/^[a-zA-Z0-9:_-]+$/).min(1).max(130);
export const citationSchema = z.object({ sourceId: idSchema, section: z.enum(["all", ...Object.keys(fields) as [keyof typeof fields, ...(keyof typeof fields)[]]]), locator: z.string().trim().min(1).max(500) }).strict();
export const entityInput = z.object({ id: idSchema, slug: slugSchema, kind: z.enum(kinds), title: z.string().trim().min(2).max(180), summary: z.string().trim().min(5).max(1000), keywords: z.string().max(1000).default(""), content: contentSchema, domainSlugs: z.array(slugSchema).max(12), citations: z.array(citationSchema).max(40) }).strict();
export const safeUrl = z.string().max(2000).refine(v => { if (!v) return true; try { const u = new URL(v); return ["https:", "http:"].includes(u.protocol) && !u.username && !u.password; } catch { return false; } }, "Gunakan URL http atau https tanpa kredensial.");
export const sourceInput = z.object({ id: idSchema, title: z.string().trim().min(2).max(500), author: z.string().trim().max(500), year: z.string().trim().max(20), version: z.string().max(200), jurisdiction: z.string().max(200), kind: z.enum(["Buku ajar", "Buku", "Artikel jurnal", "Publikasi organisasi", "Kode etik", "Undang-undang", "Materi ajar berizin", "Laporan penelitian"]), url: safeUrl, note: z.string().max(2000), publication: z.string().max(300).default(""), publisher: z.string().max(300).default(""), edition: z.string().max(100).default(""), doi: z.string().trim().regex(/^10\.\d{4,9}\/\S+$/).max(200).nullable().default(null), isbn: z.string().regex(/^[0-9Xx-]{10,20}$/).nullable().default(null) }).strict();
export const relationInput = z.object({ id: idSchema, fromId: idSchema, toId: idSchema, type: z.enum(relationshipTypes), explanation: z.string().trim().min(10).max(1500), sourceId: idSchema.nullable().default(null), locator: z.string().max(500).default("") }).strict().refine(v => v.fromId !== v.toId, "Simpul tidak dapat dihubungkan ke dirinya sendiri.");
export const importSchema = z.object({ sources: z.array(sourceInput).max(25).default([]), entities: z.array(entityInput).max(25).default([]), relations: z.array(relationInput).max(100).default([]) }).strict().refine(v => v.sources.length + v.entities.length + v.relations.length > 0, "Impor kosong.");
export const comparisonFields = ["assumptions", "mechanisms", "research", "applications", "strengths", "limitations", "differences"] as const;
export function knowledgeHref(entity: { kind: string; slug: string }) { return `/encyclopedia/${({ DOMAIN: "domain", THEORY: "teori", CONCEPT: "konsep", THEORIST: "tokoh", APPROACH: "pendekatan" } as Record<string,string>)[entity.kind]}/${entity.slug}`; }
export function editorialRole(role?: string) { return role === "EDITOR" || role === "REVIEWER"; }
export function sourceFingerprint(s: { title: string; author: string; version: string }) { return [s.title,s.author,s.version].map(v=>v.normalize("NFKC").toLowerCase().replace(/\s+/g," ").trim()).join("|"); }
export function publicationProblems(entity: { kind: string; title: string; summary: string; content: unknown; domains: unknown[]; citations: { section: string; locator: string; verified: boolean; source: { status: string; verifiedAt: Date | null } }[] }) {
  const parsed = contentSchema.safeParse(entity.content); if (!parsed.success) return ["Format konten tidak valid."];
  const body = parsed.data; const problems: string[] = [];
  const required: (keyof typeof fields)[] = entity.kind === "THEORY" ? ["definition", "assumptions", "mechanisms", "applications", "limitations"] : entity.kind === "THEORIST" ? ["biography", "contributions", "limitations"] : ["definition", "limitations"];
  for (const key of required) if (!body[key]?.trim()) problems.push(`${fields[key]} belum diisi.`);
  if (!entity.domains.length) problems.push("Minimal satu domain diperlukan.");
  const verified = entity.citations.filter(c => c.verified && c.source.status === "VERIFIED" && c.source.verifiedAt && c.locator.trim() && !/belum|pending|unverified/i.test(c.locator));
  for (const key of Object.keys(body)) if (!verified.some(c => c.section === "all" || c.section === key)) problems.push(`Pemetaan sumber terverifikasi untuk ${key} belum ada.`);
  if (!entity.title.trim() || !entity.summary.trim() || !verified.length) problems.push("Judul, ringkasan, dan referensi terverifikasi diperlukan.");
  return problems;
}
export function highlightedParts(value: string, query: string) {
  if (!query.trim()) return [{ text: value, match: false }];
  const q = query.toLocaleLowerCase(); const lower = value.toLocaleLowerCase(); const parts: {text:string;match:boolean}[] = []; let offset=0; let found=lower.indexOf(q);
  while (found>=0) { if(found>offset) parts.push({text:value.slice(offset,found),match:false}); parts.push({text:value.slice(found,found+q.length),match:true}); offset=found+q.length; found=lower.indexOf(q,offset); }
  if(offset<value.length) parts.push({text:value.slice(offset),match:false}); return parts;
}

export function literalSearch(query:string) { return query.replace(/[\\%_]/g, character => `\\${character}`); }
