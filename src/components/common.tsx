import Link from "@/components/safe-link";
import { ArrowUpRight, BookOpen, Clock3, FlaskConical } from "lucide-react";
import type { Article, LearningDomain } from "@prisma/client";
export function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <header className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-description">{description}</p></div>{action}</header>;
}
export function ContentNotice() {
  return <div className="notice"><FlaskConical size={18} aria-hidden /><p><strong>Materi percontohan.</strong> Parafrase editorial dan rujukan masih menunggu tinjauan akademik. Untuk belajar, bukan layanan atau penilaian kompetensi profesional.</p></div>;
}
export function ArticleCard({ article, returnTo }: { article: Article & { domain: LearningDomain }; returnTo?: string }) {
  return <Link href={`/encyclopedia/${article.slug}${returnTo ? `?from=${encodeURIComponent(returnTo)}` : ""}`} className="article-card"><div className={`article-art tint-${article.domain.color}`}><BookOpen size={36} strokeWidth={1.2} /><span className="article-art-label">CATATAN KONSEP</span></div><div className="article-card-body"><div className="article-meta"><span>{article.domain.name}</span><span className="draft-dot">Draf</span></div><h3>{article.title}</h3><p>{article.summary}</p><div className="article-foot"><span><Clock3 size={14} />{article.minutes} menit baca</span><ArrowUpRight size={18} /></div></div></Link>;
}
export function EmptyState({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="empty-state"><BookOpen size={30} /><h2>{title}</h2><p>{children}</p></div>;
}
