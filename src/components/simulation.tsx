"use client";
import { ActionError } from "./action-error";
import { useRef, useState } from "react";
import Link from "@/components/safe-link";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, CheckCircle2, Save } from "lucide-react";
import { Button } from "./ui/button";
import { StartAttempt } from "./start-attempt";
import { requestJson } from "@/lib/client";
import {validateAnswers} from "@/lib/scoring";
import type { Answers, PublicQuestion } from "@/lib/scoring";
import type { PresentedAttempt } from "@/lib/attempts";
import { useWorkingCopy } from "./navigation-guard";
const typeLabels = { single: "Single-best-answer", multiple: "Multiple-response", matching: "Matching", sequence: "Sequencing", multipart: "Multi-part scenario" };
export function Simulation({ initial }: { initial: PresentedAttempt }) {
  const [attempt, setAttempt] = useState(initial);
  const work = useWorkingCopy(`attempt:${initial.id}`, { answers: initial.answers, revision: initial.revision }, initial.status === "DRAFT");
  const answers = attempt.status === "SUBMITTED" ? attempt.answers : work.value.answers; const dirty = work.dirty;
  const [step, setStep] = useState(0); const [pending, setPending] = useState(false); const [error, setError] = useState(""); const [saved, setSaved] = useState("");
  const titleRef = useRef<HTMLHeadingElement>(null); const q = attempt.questions[step];
  function change(value: Answers[string]) { work.update({ ...work.value, answers: { ...answers, [q.id]: value } }); setSaved(""); setError(""); }
  async function persist(submit: boolean, next = false) {
    if (pending) return;
    setPending(true); setError(""); setSaved("");
    const payload = { ...answers };
    if (q.type === "sequence" && !payload[q.id]) payload[q.id] = q.options.map(o => o.id);
    try {
      const result = await requestJson<PresentedAttempt>(`/api/attempts/${attempt.id}`, submit ? "POST" : "PATCH", { answers: payload, revision: work.value.revision });
      setAttempt(result); work.commit({ answers: result.answers, revision: result.revision }); setSaved(submit ? "Jawaban terkirim." : "Draf tersimpan di profil Anda.");
      if (next) setStep(s => Math.min(s + 1, attempt.questions.length - 1));
      if (next || submit) setTimeout(() => titleRef.current?.focus(), 0);
    } catch (e) { setError((e as Error).message); } finally { setPending(false); }
  }
  if (attempt.status === "SUBMITTED") return <section className="simulation-results"><div className="result-hero"><CheckCircle2 size={34} /><span className="eyebrow">LATIHAN SELESAI · UMPAN BALIK FORMATIF</span><h2 ref={titleRef} tabIndex={-1}>Luangkan waktu untuk meninjau.</h2><div className="score-display">{attempt.score}<span>/ 100</span></div><p>Skor latihan, bukan ukuran kompetensi profesional. Setiap pertanyaan berbobot 20%. Kredit parsial berlaku pada pilihan majemuk, pasangan, dan skenario multi-bagian.</p></div><div className="feedback-list">{attempt.feedback?.map((f, i) => <article key={f.id}><div className="feedback-heading"><span className="lesson-number">{String(i + 1).padStart(2, "0")}</span><h3>{f.title}</h3><span className={`feedback-score ${f.percent === 100 ? "positive" : "review"}`}>{f.percent}%</span></div><p>{f.explanation}</p>{f.parts&&<ul>{f.parts.map(p=><li key={p.id}>{p.label}: {p.correct?"sesuai kunci latihan":"perlu ditinjau"}</li>)}</ul>}{f.optionExplanations&&<ul>{Object.entries(f.optionExplanations).map(([id,text])=><li key={id}>{attempt.questions[i].options.find(o=>o.id===id)?.label}: {text}</li>)}</ul>}<details><summary>Lihat jawaban dan kunci latihan</summary><AnswerReview question={attempt.questions[i]} answer={answers[f.id]} correct={f.correct} /></details><div className="feedback-sources">Kerangka rujukan (belum diverifikasi): {f.sourceIds.map(id => <Link key={id} href={`/blok/etik-hukum/referensi/${id}`}>{id.toUpperCase()}</Link>)}</div></article>)}</div><div className="result-actions"><StartAttempt caseSlug={attempt.caseSlug} label="Latihan ulang" /><Button asChild variant="secondary"><Link href={`/laboratorium/kasus/${attempt.caseSlug}`}>Lanjutkan refleksi tertulis <ArrowRight size={17} /></Link></Button><Link href="/progress" className="text-link">Lihat progres</Link></div></section>;
  const answer = answers[q.id]; const mapping = typeof answer === "object" && !Array.isArray(answer) ? answer : {};
  const sequence = Array.isArray(answer) && answer.length === q.options.length ? answer : q.options.map(o => o.id);
  function move(index: number, offset: number) { const updated = [...sequence]; [updated[index], updated[index + offset]] = [updated[index + offset], updated[index]]; change(updated); }
  return <section className="simulation-player"><div className="question-stepper" aria-label="Daftar pertanyaan">{attempt.questions.map((question, i) => <button key={question.id} aria-label={`Pertanyaan ${i + 1}: ${typeLabels[question.type]}`} aria-current={step === i ? "step" : undefined} disabled={pending} className={step === i ? "current" : ""} onClick={() => { setStep(i); setError(""); setTimeout(() => titleRef.current?.focus(), 0); }}><span>{i + 1}</span><small>{typeLabels[question.type]}</small>{answers[question.id] !== undefined && validateAnswers([question],{[question.id]:answers[question.id]},true)===null ? <Check size={13} aria-label="Jawaban lengkap"/> : answers[question.id]!==undefined ? <span className="fine-print">Belum lengkap</span> : null}</button>)}</div><div className="question-panel"><div className="article-meta"><span>PERTANYAAN {step + 1} DARI {attempt.questions.length}</span><span>{typeLabels[q.type]}</span></div><h2 tabIndex={-1} ref={titleRef}>{q.title}</h2><p className="question-instruction">{q.instruction}</p>{q.multiplePolicy==="penalty-no-all-v2"&&<p className="fine-print">Kredit = (pilihan tepat − pilihan keliru) ÷ jumlah pilihan tepat, minimal nol. Memilih semua opsi ketika ada pengecoh mendapat nol.</p>}{attempt.caseSnapshot&&<details className="simulation-context"><summary>Baca kembali konteks kasus</summary><p>{attempt.caseSnapshot.narrative}</p></details>}<fieldset disabled={pending} className="question-fields"><legend className="sr-only">{q.title}</legend>
    {(q.type === "single" || q.type === "multiple") && q.options.map(option => <label key={option.id} className={`answer-option ${(q.type === "single" ? answer === option.id : Array.isArray(answer) && answer.includes(option.id)) ? "chosen" : ""}`}><input type={q.type === "single" ? "radio" : "checkbox"} name={q.id} value={option.id} checked={q.type === "single" ? answer === option.id : Array.isArray(answer) && answer.includes(option.id)} onChange={e => { if (q.type === "single") change(option.id); else { const current = Array.isArray(answer) ? answer : []; change(e.target.checked ? [...current, option.id] : current.filter(a => a !== option.id)); } }} /><span>{option.label}</span></label>)}
    {(q.type === "matching" || q.type === "multipart") && q.prompts?.map(prompt => <div className="matching-row" key={prompt.id}><label htmlFor={`${q.id}-${prompt.id}`}>{prompt.label}</label><select id={`${q.id}-${prompt.id}`} value={mapping[prompt.id] ?? ""} onChange={e => { const updated = { ...mapping }; if (e.target.value) updated[prompt.id] = e.target.value; else delete updated[prompt.id]; change(updated); }}><option value="">Pilih jawaban…</option>{q.options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}</select></div>)}
    {q.type === "sequence" && <ol className="sequence-list">{sequence.map((id, i) => <li key={id}><span className="sequence-index">{i + 1}</span><span>{q.options.find(o => o.id === id)?.label}</span><div><button type="button" className="icon-button" disabled={i === 0 || pending} onClick={() => move(i, -1)} aria-label={`Naikkan ${q.options.find(o => o.id === id)?.label}`}><ArrowUp size={17} /></button><button type="button" className="icon-button" disabled={i === sequence.length - 1 || pending} onClick={() => move(i, 1)} aria-label={`Turunkan ${q.options.find(o => o.id === id)?.label}`}><ArrowDown size={17} /></button></div></li>)}</ol>}
    </fieldset><div className="question-actions"><Button variant="ghost" disabled={step === 0 || pending} onClick={() => { setStep(s => s - 1); setTimeout(() => titleRef.current?.focus(), 0); }}><ArrowLeft size={16} />Sebelumnya</Button><Button variant="secondary" onClick={() => persist(false)} disabled={pending}><Save size={16} />Simpan draf</Button>{step < attempt.questions.length - 1 ? <Button onClick={() => persist(false, true)} disabled={pending}>{pending ? "Menyimpan…" : "Simpan & lanjut"}<ArrowRight size={16} /></Button> : <Button onClick={() => persist(true)} disabled={pending}>{pending ? "Mengirim…" : "Kirim jawaban"}<Check size={16} /></Button>}</div><div className="save-status"><p role="status">{saved || (dirty ? "Ada perubahan yang belum disimpan. Simpan sebelum meninggalkan halaman." : "Jawaban yang disimpan dapat dilanjutkan dari Progress Belajar.")}</p><ActionError message={error} /></div></div></section>;
}
function AnswerReview({ question, answer, correct }: { question: PublicQuestion; answer: Answers[string]; correct: Answers[string] }) {
  function describe(value: Answers[string]) {
    const label = (id: string) => question.options.find(o => o.id === id)?.label ?? id;
    if (typeof value === "string") return label(value);
    if (Array.isArray(value)) return value.map(label).join(question.type === "sequence" ? " → " : "; ");
    return Object.entries(value).map(([id, v]) => `${question.prompts?.find(p => p.id === id)?.label}: ${label(v)}`).join(" · ");
  }
  return <dl className="answer-review"><dt>Jawaban Anda</dt><dd>{describe(answer)}</dd><dt>Kunci latihan</dt><dd>{describe(correct)}</dd></dl>;
}
