import "server-only";
import { db } from "./db";
export async function learningSummary(userId?: string) {
  const [totalArticles, domains, recent, completed, submitted, draft, reflection] = await Promise.all([
    db.article.count(),
    db.learningDomain.findMany({ where: { articles: { some: {} } }, orderBy: { name: "asc" }, take: 3 }),
    userId ? db.learningProgress.findMany({ where: { userId }, include: { article: { include: { domain: true } } }, orderBy: { completedAt: "desc" }, take: 3 }) : [],
    userId ? db.learningProgress.count({ where: { userId } }) : 0,
    userId ? db.simulationAttempt.count({ where: { userId, caseSlug: "kerahasiaan-dalam-supervisi", status: "SUBMITTED" } }) : 0,
    userId ? db.simulationAttempt.findFirst({ where: { userId, caseSlug: "kerahasiaan-dalam-supervisi", status: "DRAFT" }, orderBy: { updatedAt: "desc" } }) : null,
    userId ? db.rubricAssessment.findUnique({ where: { userId_caseSlug: { userId, caseSlug: "kerahasiaan-dalam-supervisi" } } }) : null
  ]);
  return { totalArticles, domains, recent, completed, submitted, draft, reflection, activities: Number(submitted > 0) + Number(!!reflection) };
}
export type LearningSummary = Awaited<ReturnType<typeof learningSummary>>;
