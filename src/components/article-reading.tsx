import { z } from "zod";
import { ArrowUpRight } from "lucide-react";
import type { AcademicSource, SourceCitation } from "@prisma/client";
export const articleSections = z.array(z.object({ heading: z.string(), text: z.string() }));
export function ArticleSections({ sections }: { sections: z.infer<typeof articleSections> }) {
  return sections.map((section, index) => <section key={section.heading} id={`bagian-${index}`}><h2>{section.heading}</h2><p>{section.text}</p></section>);
}
export function CitationList({ citations }: { citations: (SourceCitation & { source: AcademicSource })[] }) {
  return <section className="article-sources" id="jejak-referensi"><h2>Jejak referensi</h2>{citations.length ? citations.map(c => <div className="citation" key={c.id}><a href={c.source.url} target="_blank" rel="noreferrer">{c.source.author}. ({c.source.year}). <em>{c.source.title}</em>. <ArrowUpRight size={14} /></a><p>{c.locator}.</p><span className="status-badge">{c.source.status === "VERIFIED" ? "SUMBER TERVERIFIKASI" : "MENUNGGU VERIFIKASI"}</span><p>{c.source.jurisdiction}</p></div>) : <p>Rujukan belum dipetakan. Materi memerlukan tinjauan akademik sebelum digunakan.</p>}</section>;
}
