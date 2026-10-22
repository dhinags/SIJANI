import "server-only";
import { db } from "./db";
import { HttpError } from "./http";
import { questionSchema, publicQuestion, answersSchema } from "./scoring";
import type { scoreAttempt } from "./scoring";
import type { SimulationAttempt } from "@prisma/client";
import { z } from "zod";
export const scenarioSnapshotSchema=z.object({title:z.string(),narrative:z.string(),description:z.string(),version:z.number(),sourceIds:z.array(z.string())});
export async function ownedAttempt(id: string, userId: string) {
  const attempt = await db.simulationAttempt.findFirst({ where: { id, userId } });
  if (!attempt) throw new HttpError(404, "Latihan tidak ditemukan.");
  return attempt;
}
export function presentAttempt(attempt: SimulationAttempt) {
  return {
    id: attempt.id, caseSlug: attempt.caseSlug, caseVersion: attempt.caseVersion, status: attempt.status,
    revision: attempt.revision, answers: answersSchema.parse(attempt.answers), score: attempt.score,
    feedback: (attempt.status === "SUBMITTED" ? attempt.feedback : null) as ReturnType<typeof scoreAttempt>["feedback"] | null,
    updatedAt: attempt.updatedAt.toISOString(), questions: questionSchema.array().parse(attempt.snapshot).map(publicQuestion),
    caseSnapshot:attempt.caseSnapshot?scenarioSnapshotSchema.parse(attempt.caseSnapshot):null
  };
}
export type PresentedAttempt = ReturnType<typeof presentAttempt>;
