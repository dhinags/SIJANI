import { z } from "zod";
export const optionSchema = z.object({ id: z.string(), label: z.string() });
export const questionSchema = z.object({
  id: z.string(), type: z.enum(["single", "multiple", "matching", "sequence", "multipart"]),
  title: z.string(), instruction: z.string(), options: z.array(optionSchema).min(1),
  prompts: z.array(optionSchema).optional(),
  correct: z.union([z.string(), z.array(z.string()), z.record(z.string(), z.string())]),
  explanation: z.string(), sourceIds: z.array(z.string()).min(1),
  validSequences: z.array(z.array(z.string())).max(10).optional(),
  optionExplanations: z.record(z.string(),z.string()).optional()
  ,multiplePolicy:z.enum(["penalty-v1","penalty-no-all-v2"]).optional()
}).superRefine((q, ctx) => {
  const invalid = (message: string) => ctx.addIssue({ code: "custom", message });
  const options = new Set(q.options.map(o => o.id));
  if(q.validSequences&&(q.type!=="sequence"||q.validSequences.some(sequence=>sequence.length!==options.size||new Set(sequence).size!==options.size||sequence.some(id=>!options.has(id)))))invalid("Alternative sequences must cover each option exactly once.");
  if(q.optionExplanations&&Object.keys(q.optionExplanations).some(id=>!options.has(id)))invalid("Option explanations must refer to valid options.");
  if (options.size !== q.options.length) invalid("Option IDs must be unique.");
  if (q.type === "single") {
    if (typeof q.correct !== "string" || !options.has(q.correct)) invalid("Single-answer key must name one valid option.");
  } else if (q.type === "multiple" || q.type === "sequence") {
    if (!Array.isArray(q.correct) || !q.correct.length || new Set(q.correct).size !== q.correct.length || q.correct.some(id => !options.has(id))) invalid("Answer key must contain unique valid options.");
    if (q.type === "sequence" && (!Array.isArray(q.correct) || q.correct.length !== options.size)) invalid("Sequence key must cover every option.");
  } else {
    const prompts = new Set(q.prompts?.map(p => p.id));
    if (!prompts.size || prompts.size !== q.prompts?.length) invalid("Prompt IDs must be nonempty and unique.");
    if (!q.correct || typeof q.correct !== "object" || Array.isArray(q.correct)) invalid("A keyed answer is required for each prompt.");
    else {
      if (Object.keys(q.correct).length !== prompts.size || Object.entries(q.correct).some(([id, value]) => !prompts.has(id) || !options.has(value))) invalid("Key must cover exactly the valid prompts and options.");
      if (q.type === "matching" && new Set(Object.values(q.correct)).size !== prompts.size) invalid("Matching keys must use distinct destinations.");
    }
  }
});
export type Question = z.infer<typeof questionSchema>;
export type PublicQuestion = Omit<Question, "correct" | "explanation" | "validSequences" | "optionExplanations">;
export const answersSchema = z.record(z.string().max(100), z.union([
  z.string().max(200), z.array(z.string().max(200)).max(30), z.record(z.string().max(200), z.string().max(200))
]));
export type Answers = z.infer<typeof answersSchema>;
export function publicQuestion(q: Question): PublicQuestion {
  return { id: q.id, type: q.type, title: q.title, instruction: q.instruction, options: q.options, ...(q.prompts ? { prompts: q.prompts } : {}), sourceIds: q.sourceIds, ...(q.multiplePolicy?{multiplePolicy:q.multiplePolicy}:{}) };
}
export function validateAnswers(questions: PublicQuestion[], answers: Answers, complete = true): string | null {
  if (!questions.length) return "Latihan belum memiliki pertanyaan.";
  if (Object.keys(answers).some(id => !questions.some(q => q.id === id))) return "Pertanyaan tidak dikenal.";
  for (const q of questions) {
    const a = answers[q.id];
    if (a === undefined) { if (complete) return "Lengkapi semua pertanyaan sebelum mengirim."; continue; }
    const valid = new Set(q.options.map(o => o.id));
    if (q.type === "single") {
      if (typeof a !== "string" || !valid.has(a)) return "Pilihan jawaban tidak valid.";
    } else if (q.type === "multiple" || q.type === "sequence") {
      if (!Array.isArray(a) || a.some(v => !valid.has(v)) || new Set(a).size !== a.length) return "Daftar pilihan tidak valid.";
      if (complete && (a.length === 0 || (q.type === "sequence" && a.length !== q.options.length))) return "Lengkapi pilihan atau urutan jawaban.";
    } else {
      if (!a || typeof a !== "object" || Array.isArray(a)) return "Pasangan jawaban tidak valid.";
      const prompts = new Set(q.prompts?.map(p => p.id));
      if (Object.entries(a).some(([k, v]) => !prompts.has(k) || !valid.has(v))) return "Pasangan jawaban tidak dikenal.";
      if (complete && Object.keys(a).length !== prompts.size) return "Lengkapi setiap bagian jawaban.";
      if (q.type === "matching" && new Set(Object.values(a)).size !== Object.keys(a).length) return "Gunakan setiap pasangan sekali.";
    }
  }
  return null;
}
export function scoreAttempt(questions: Question[], answers: Answers) {
  const error = validateAnswers(questions, answers);
  if (error) throw new Error(error);
  const feedback = questions.map(q => {
    const a = answers[q.id]; let fraction = 0;
    if (q.type === "single") fraction = a === q.correct ? 1 : 0;
    else if (q.type === "multiple") {
      const expected = q.correct as string[]; const actual = a as string[];
      fraction = Math.max(0, (actual.filter(v => expected.includes(v)).length - actual.filter(v => !expected.includes(v)).length) / expected.length);
      if(q.multiplePolicy==="penalty-no-all-v2"&&actual.length===q.options.length&&expected.length<q.options.length)fraction=0;
    } else if (q.type === "sequence") fraction = [q.correct,...(q.validSequences??[])].some(sequence=>JSON.stringify(a)===JSON.stringify(sequence)) ? 1 : 0;
    else {
      const expected = q.correct as Record<string, string>;
      fraction = Object.entries(expected).filter(([key, value]) => (a as Record<string, string>)[key] === value).length / Object.keys(expected).length;
    }
    return { id: q.id, title: q.title, percent: Math.round(fraction * 100), fraction, explanation: q.explanation, correct: q.correct, sourceIds: q.sourceIds, ...(q.optionExplanations?{optionExplanations:q.optionExplanations}:{}), ...((q.type==="matching"||q.type==="multipart")?{parts:q.prompts!.map(p=>({id:p.id,label:p.label,correct:(a as Record<string,string>)[p.id]===(q.correct as Record<string,string>)[p.id]}))}:{}) };
  });
  return { score: Math.round(feedback.reduce((sum, f) => sum + f.fraction, 0) / feedback.length * 100), feedback: feedback.map(({ fraction: _, ...f }) => { void _; return f; }) };
}
export function rubricScore(ratings: number[]) {
  if (ratings.length !== 11 || ratings.some(r => !Number.isInteger(r) || r < 1 || r > 4)) throw new Error("Isi sebelas dimensi dengan tingkat 1–4.");
  return Math.round(ratings.reduce((a, b) => a + b, 0) / 44 * 100);
}
