import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { currentUser, createDemoSession, demoEnabled, endSession, requireDosen, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ownedAttempt, presentAttempt } from "@/lib/attempts";
import { api, checkOrigin, HttpError, parseBody, rateLimit } from "@/lib/http";
import { answersSchema, questionSchema, rubricScore, scoreAttempt, validateAnswers } from "@/lib/scoring";
import { rubric } from "@/lib/rubric";
import { visibleCase } from "@/lib/lab";
import {prepareSimulationQuestion} from "@/lib/simulation-policies";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
const attemptInput = z.object({ answers: answersSchema, revision: z.number().int().nonnegative() }).strict();
async function route(request: Request, context: Context) {
  return api(async () => {
    const path = (await context.params).path; const key = path.join("/"); const method = request.method;
    if (method === "GET") {
      if (key === "health") { await db.$queryRaw`SELECT 1`; return NextResponse.json({ status: "ok" }); }
      if (key === "dosen") {
        await requireDosen();
        return NextResponse.json({ articles: await db.article.findMany({ select: { slug: true, title: true, status: true } }), sources: await db.academicSource.findMany() });
      }
      if (path[0] === "attempts" && path.length === 2) {
        const user = await requireUser(); return NextResponse.json(presentAttempt(await ownedAttempt(path[1], user.id)));
      }
      throw new HttpError(404, "Halaman tidak ditemukan.");
    }
    checkOrigin(request);
    if (key === "demo" && method === "POST") {
      if (!demoEnabled()) throw new HttpError(503, "Akses demo dinonaktifkan. Integrasi akun institusi belum dikonfigurasi.");
      const user = await currentUser();
      if (user) return NextResponse.json({ destination: user.profile?.onboardingDone ? "/tujuan" : "/identitas" });
      await rateLimit("demo-create", 120, 3_600_000);
      await createDemoSession(); return NextResponse.json({ destination: "/identitas" });
    }
    if (key === "session" && method === "DELETE") { await endSession(); return NextResponse.json({ ok: true }); }
    const user = await requireUser(); await rateLimit(user.id);
    if (key === "profile" && method === "PATCH") {
      const input = await parseBody(request, z.object({ displayName: z.string().trim().min(2).max(40), preference: z.enum(["bertahap", "eksplorasi"]), onboardingDone: z.literal(true) }).strict());
      await db.profile.update({ where: { userId: user.id }, data: input }); return NextResponse.json({ ok: true });
    }
    if (key === "progress" && method === "POST") {
      const { articleSlug } = await parseBody(request, z.object({ articleSlug: z.string().max(100) }).strict());
      if (!await db.article.findUnique({ where: { slug: articleSlug } })) throw new HttpError(404, "Artikel tidak ditemukan.");
      await db.learningProgress.upsert({ where: { userId_articleSlug: { userId: user.id, articleSlug } }, create: { userId: user.id, articleSlug }, update: {} });
      return NextResponse.json({ ok: true });
    }
    if (key === "reflection" && method === "PUT") {
      const { entries } = await parseBody(request, z.object({ entries: z.array(z.object({ id: z.string(), text: z.string().trim().min(1).max(2000), rating: z.number().int().min(1).max(4) }).strict()).length(11) }).strict());
      if (new Set(entries.map(e => e.id)).size !== 11 || entries.some(e => !rubric.some(r => r.id === e.id))) throw new HttpError(400, "Dimensi rubrik tidak valid.");
      const score = rubricScore(entries.map(e => e.rating)); const caseSlug = "kerahasiaan-dalam-supervisi";
      await db.rubricAssessment.upsert({ where: { userId_caseSlug: { userId: user.id, caseSlug } }, create: { userId: user.id, caseSlug, entries, score }, update: { entries, score } });
      return NextResponse.json({ score, method: "SELF_REVIEW" });
    }
    if (key === "attempts" && method === "POST") {
      const { caseSlug } = await parseBody(request, z.object({ caseSlug: z.string().max(100) }).strict());
      const scenario = await db.caseScenario.findFirst({ where: { AND:[{slug:caseSlug},visibleCase()] }, include: { questions: { orderBy: { position: "asc" } } } });
      if (!scenario) throw new HttpError(404, "Kasus tidak ditemukan.");
      const existing = await db.simulationAttempt.findFirst({ where: { userId: user.id, caseSlug, status: "DRAFT" } });
      if (existing) return NextResponse.json(presentAttempt(existing));
      try {
        const snapshot = questionSchema.array().min(1).parse(scenario.questions.map(q => q.definition)).map(prepareSimulationQuestion);
        const caseSnapshot={title:scenario.title,narrative:scenario.narrative,description:scenario.description,version:scenario.version,sourceIds:z.array(z.string()).parse(scenario.sources)};
        return NextResponse.json(presentAttempt(await db.simulationAttempt.create({ data: { userId: user.id, caseSlug, caseVersion: scenario.version, snapshot,caseSnapshot } })), { status: 201 });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return NextResponse.json(presentAttempt(await db.simulationAttempt.findFirstOrThrow({ where: { userId: user.id, caseSlug, status: "DRAFT" } })));
        throw e;
      }
    }
    if (path[0] === "attempts" && path.length === 2 && ["PATCH", "POST"].includes(method)) {
      const input = await parseBody(request, attemptInput); const attempt = await ownedAttempt(path[1], user.id); const submit = method === "POST";
      if (attempt.status === "SUBMITTED") {
        if (submit) return NextResponse.json(presentAttempt(attempt));
        throw new HttpError(409, "Hasil yang sudah dikirim tidak dapat diubah. Mulai latihan ulang.");
      }
      const questions = questionSchema.array().parse(attempt.snapshot);
      const error = validateAnswers(questions, input.answers, submit); if (error) throw new HttpError(400, error);
      const result = submit ? scoreAttempt(questions, input.answers) : null;
      const changed = await db.simulationAttempt.updateMany({ where: { id: attempt.id, userId: user.id, status: "DRAFT", revision: input.revision }, data: { answers: input.answers, revision: { increment: 1 }, ...(result ? { status: "SUBMITTED", score: result.score, feedback: result.feedback, submittedAt: new Date() } : {}) } });
      if (changed.count !== 1) throw new HttpError(409, "Latihan berubah di tab lain. Muat ulang sebelum melanjutkan.");
      return NextResponse.json(presentAttempt(await ownedAttempt(attempt.id, user.id)));
    }
    throw new HttpError(404, "Halaman tidak ditemukan.");
  });
}
export const GET = route;
export const POST = route;
export const PATCH = route;
export const PUT = route;
export const DELETE = route;
