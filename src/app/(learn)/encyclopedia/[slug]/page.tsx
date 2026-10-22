import Link from "@/components/safe-link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, ArrowUpRight } from "lucide-react";
import { articleSections, ArticleSections, CitationList } from "@/components/article-reading";
import { safeEncyclopediaReturn, theorists } from "@/lib/encyclopedia";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { CompleteArticle } from "@/components/complete-article";
import { ContentNotice } from "@/components/common";
export default async function ArticlePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ from?: string }> }) {
  const { slug } = await params;
  const [article, user] = await Promise.all([db.article.findUnique({ where: { slug }, include: { domain: true, citations: { include: { source: true } }, outgoing: { include: { to: true } }, incoming: { include: { from: true } } } }), currentUser()]);
  if (!article) notFound();
  const sections = articleSections.parse(article.body);
  const query = await searchParams; const returnTo = safeEncyclopediaReturn(typeof query.from === "string" ? query.from : undefined);
  const people = theorists.filter(t => t.articleSlugs.includes(slug));
  const completed = user ? !!await db.learningProgress.findUnique({ where: { userId_articleSlug: { userId: user.id, articleSlug: slug } } }) : false;
  const related = [...article.outgoing.map(r => r.to), ...article.incoming.map(r => r.from)];
  return <><Link href={returnTo} className="back-link"><ArrowLeft size={16} />Encyclopedia</Link><header className="article-header"><span className="eyebrow">{article.domain.name}</span><h1>{article.title}</h1><p>{article.summary}</p><div className="article-header-meta"><span><Clock3 size={15} />{article.minutes} menit baca</span><span className="status-badge">DRAF EDITORIAL</span></div></header><div className="article-layout"><article className="article-prose"><ContentNotice /><ArticleSections sections={sections} /><div className="reflect-callout"><span className="eyebrow">JEDA UNTUK BERPIKIR</span><h3>Bagaimana konsep ini mengubah cara Anda membaca sebuah situasi?</h3><p>Temukan satu contoh, lalu tanyakan penjelasan alternatif dan batas kesimpulannya.</p></div><CitationList citations={article.citations} /><div className="reading-complete"><div><h3>Satu konsep, satu langkah maju.</h3><p>Catat bacaan ini dalam progres belajarmu.</p></div><CompleteArticle slug={slug} completed={completed} signedIn={!!user} /></div></article><aside className="article-toc"><span className="eyebrow">DALAM ARTIKEL INI</span><nav aria-label="Daftar isi artikel">{sections.map((s, i) => <a key={s.heading} href={`#bagian-${i}`}>{s.heading}</a>)}</nav><div className="toc-related"><span className="eyebrow">TOKOH DALAM BACAAN</span>{people.length ? people.map(t => <Link href={`/encyclopedia/tokoh/${t.slug}`} key={t.slug}>{t.name}<ArrowUpRight size={14} /></Link>) : <p className="fine-print">Tokoh terkait belum dipetakan.</p>}</div><div className="toc-related"><span className="eyebrow">HUBUNGKAN GAGASAN</span>{related.map(a => <Link key={a.slug} href={`/encyclopedia/${a.slug}`}>{a.title}<ArrowUpRight size={14} /></Link>)}<Link href={`/knowledge-map?domain=${article.domainSlug}`}>Buka Knowledge Map <ArrowUpRight size={14} /></Link></div></aside></div></>;
}
