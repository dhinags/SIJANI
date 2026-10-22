import { describe, expect, it } from "vitest";
import { articles, domains, questions, scenario, sources } from "../../prisma/content";
import { rubric } from "../../src/lib/rubric";
import { publicQuestion, questionSchema, rubricScore, scoreAttempt, validateAnswers, type Answers } from "../../src/lib/scoring";
const complete = (): Answers => Object.fromEntries(questions.map(q => [q.id, structuredClone(q.correct)]));

describe("deterministic structured scoring", () => {
  it("covers all five formats and scores the exact key as 100", () => {
    expect(new Set(questions.map(q => q.type)).size).toBe(5);
    expect(scoreAttempt(questions, complete()).score).toBe(100);
  });
  it("awards zero for valid but fully incorrect answers", () => {
    const answers = complete();
    answers["langkah-awal"] = "share";
    answers.informasi = ["popular"];
    answers.prinsip = { p1: "consent", p2: "competence", p3: "privacy" };
    answers.alur = ["document", "choose", "consult", "clarify"];
    answers.lanjutan = { unique: "no", foreign: "yes" };
    expect(scoreAttempt(questions, answers).score).toBe(0);
  });
  it("deducts incorrect multi-select choices with a zero floor", () => {
    const q = questions.filter(q => q.type === "multiple");
    expect(scoreAttempt(q, { informasi: ["consent", "access", "policy", "popular"] }).score).toBe(67);
    expect(scoreAttempt(q, { informasi: ["consent", "popular"] }).score).toBe(0);
  });
  it("is insensitive to multi-select order and preserves sequence order", () => {
    const answers = complete(); answers.informasi = ["policy", "access", "consent"];
    expect(scoreAttempt(questions, answers).score).toBe(100);
    answers.alur = ["document", "consult", "clarify", "choose"];
    expect(scoreAttempt(questions, answers).score).toBe(80);
  });
  it("awards partial credit to matching and multi-part scenarios", () => {
    const answers = complete(); answers.prinsip = { p1: "privacy", p2: "competence", p3: "consent" };
    answers.lanjutan = { unique: "yes", foreign: "yes" };
    const result = scoreAttempt(questions, answers);
    expect(result.score).toBe(77);
    expect(result.feedback.map(f => f.percent)).toEqual([100, 100, 33, 100, 50]);
  });
  it("rejects duplicates, unknown questions, and unknown options", () => {
    expect(validateAnswers(questions, { informasi: ["consent", "consent"] }, false)).toBeTruthy();
    expect(validateAnswers(questions, { fabricated: "x" }, false)).toBeTruthy();
    expect(validateAnswers(questions, { "langkah-awal": "injected" }, false)).toBeTruthy();
  });
  it("allows partial drafts but rejects incomplete submission", () => {
    expect(validateAnswers(questions, { prinsip: { p1: "privacy" } }, false)).toBeNull();
    expect(validateAnswers(questions, { prinsip: { p1: "privacy" } })).toBeTruthy();
    expect(() => scoreAttempt(questions, {})).toThrow();
  });
  it("rejects repeated matching destinations, extra prompts, and wrong types", () => {
    expect(validateAnswers(questions, { prinsip: { p1: "privacy", p2: "privacy" } }, false)).toBeTruthy();
    expect(validateAnswers(questions, { lanjutan: { injected: "yes" } }, false)).toBeTruthy();
    expect(validateAnswers(questions, { "langkah-awal": ["clarify"] }, false)).toBeTruthy();
  });
  it("never leaks answer keys or explanations in public question data", () => {
    const exposed = questions.map(publicQuestion);
    expect(exposed.every(q => !("correct" in q) && !("explanation" in q))).toBe(true);
    expect(exposed).toHaveLength(5);
  });
  it("does not mutate the stored keys or answers while scoring", () => {
    const answers = complete(); const before = JSON.stringify({ questions, answers });
    scoreAttempt(questions, answers);
    expect(JSON.stringify({ questions, answers })).toBe(before);
  });
  it("rejects empty question sets instead of returning a false success", () => {
    expect(() => scoreAttempt([], {})).toThrow();
  });
  it("rejects malformed authored keys before questions can be installed", () => {
    expect(questionSchema.safeParse({ ...questions[0], correct: ["clarify"] }).success).toBe(false);
    expect(questionSchema.safeParse({ ...questions[1], correct: [] }).success).toBe(false);
    expect(questionSchema.safeParse({ ...questions[3], correct: ["clarify"] }).success).toBe(false);
    expect(questionSchema.safeParse({ ...questions[2], correct: { p1: "privacy", p2: "privacy", p3: "privacy" } }).success).toBe(false);
  });
  it("validates every authored question against its declared format", () => {
    expect(questionSchema.array().parse(questions)).toHaveLength(5);
  });
});
describe("self-review and content integrity", () => {
  it("normalizes eleven 1–4 ratings and does not score prose", () => {
    expect(rubricScore(Array(11).fill(1))).toBe(25);
    expect(rubricScore(Array(11).fill(3))).toBe(75);
    expect(rubricScore(Array(11).fill(4))).toBe(100);
    expect(() => rubricScore([1, 2])).toThrow();
    expect(() => rubricScore(Array(11).fill(4.1))).toThrow();
  });
  it("has eleven unique dimensions, each with an indicator and reasoning example", () => {
    expect(new Set(rubric.map(r => r.id)).size).toBe(11);
    expect(rubric.every(r => r.question && r.indicator && r.mistake && r.example)).toBe(true);
  });
  it("has valid source associations and honest source status", () => {
    const ids = new Set(sources.map(s => s.id));
    expect(questions.every(q => q.sourceIds.length && q.sourceIds.every(id => ids.has(id)))).toBe(true);
    expect(scenario.sources.every(id => ids.has(id))).toBe(true);
    expect(sources.every(s => s.status === "PENDING" && s.url.startsWith("https://"))).toBe(true);
    expect(articles.every(a => domains.some(d => d.slug === a.domainSlug) && a.body.length > 0)).toBe(true);
  });
});
