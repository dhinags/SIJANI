import { z } from "zod";
import { rubric, anchors } from "./rubric";
export const dimensionNames = ["Fakta dan Bukti","Pemangku Kepentingan","Isu Etika","Pertimbangan Hukum","Informasi yang Belum Tersedia","Alternatif Tindakan","Risiko dan Konsekuensi","Batas Kompetensi Profesional","Konsultasi dan Supervisi","Kualitas Keputusan","Argumentasi dan Koherensi"];
export const rubricDefinitionSchema=z.object({id:z.string(),title:z.string(),provisional:z.boolean(),dimensions:z.array(z.object({id:z.string(),name:z.string(),description:z.string(),question:z.string(),indicator:z.string(),mistake:z.string(),example:z.string(),guidance:z.string(),anchors:z.array(z.string()).length(4),maximum:z.number().positive(),weight:z.number().nonnegative(),scoreBearing:z.boolean(),allowNA:z.boolean()})).length(11)}).superRefine((r,c)=>{if(new Set(r.dimensions.map(d=>d.id)).size!==11)c.addIssue({code:"custom",message:"Dimensi harus unik."});});
export type LabRubric=z.infer<typeof rubricDefinitionSchema>;
export const labRubric:LabRubric={id:"ethics-reasoning-v1",title:"Penalaran etika · v1 (provisional)",provisional:true,dimensions:rubric.map((d,i)=>({id:d.id,name:dimensionNames[i],description:d.indicator,question:d.question,indicator:d.indicator,mistake:d.mistake,example:d.example,guidance:`Tunjukkan bagian jawaban yang memenuhi indikator, lalu tentukan satu perbaikan konkret. Waspadai: ${d.mistake}`,anchors:[`Emerging — Identifikasi awal belum membedakan konteks: ${d.indicator}`,`Developing — Mengidentifikasi unsur relevan, tetapi kaitannya dengan bukti dan batas informasi belum jelas. Indikator: ${d.indicator}`,`Proficient — Menghubungkan bukti kasus dengan indikator dan menyatakan batas kesimpulan: ${d.indicator}`,`Very Strong — Selain indikator, membandingkan penjelasan atau tindakan alternatif dan menjelaskan kapan kesimpulan perlu direvisi: ${d.indicator}`],maximum:4,weight:1,scoreBearing:true,allowNA:false}))};
export const levelLabels=anchors;
export const writtenAnswersSchema=z.record(z.string().max(40),z.string().max(3000)).superRefine((a,c)=>{if(Object.keys(a).some(id=>!rubric.some(d=>d.id===id)))c.addIssue({code:"custom",message:"Dimensi tidak dikenal."});});
export type WrittenAnswers=z.infer<typeof writtenAnswersSchema>;
export const ratingSchema=z.object({dimensionId:z.string().max(40),status:z.enum(["RATED","UNASSESSED","NOT_APPLICABLE"]),level:z.number().int().min(1).max(4).nullable(),feedback:z.string().max(1200),evidence:z.string().max(800),improvement:z.string().max(1200),referenceIds:z.array(z.string().max(100)).max(8)}).strict();
export type LabRating=z.infer<typeof ratingSchema>;
export const reviewInputSchema=z.object({revision:z.number().int().nonnegative(),ratings:z.array(ratingSchema).max(11),summary:z.string().max(2000),strengths:z.string().max(1200),improvements:z.string().max(1200),nextSteps:z.string().max(1200),outcome:z.enum(["REVIEWED","REVISION_REQUESTED"])}).strict();
export type ReviewInput=z.infer<typeof reviewInputSchema>;
export function emptyRatings(r:LabRubric):LabRating[]{return r.dimensions.map(d=>({dimensionId:d.id,status:"UNASSESSED",level:null,feedback:"",evidence:"",improvement:"",referenceIds:[]}));}
export function assessRubric(rubric:LabRubric,ratings:LabRating[]){
 if(new Set(ratings.map(r=>r.dimensionId)).size!==ratings.length||ratings.some(r=>!rubric.dimensions.some(d=>d.id===r.dimensionId)))throw new Error("Dimensi penilaian tidak valid.");
 let numerator=0,denominator=0,missing=0,assessed=0,excluded=0;
 const dimensions=rubric.dimensions.map(d=>{const r=ratings.find(r=>r.dimensionId===d.id);if(r?.status==="NOT_APPLICABLE"){if(!d.allowNA||r.level!==null||!r.feedback.trim())throw new Error("Tidak berlaku memerlukan kebijakan rubrik dan alasan eksplisit.");excluded++;return {id:d.id,points:null};}
 if(!r||r.status==="UNASSESSED"){if(r?.level!=null)throw new Error("Dimensi belum dinilai tidak boleh memiliki tingkat.");if(d.scoreBearing&&d.weight>0)missing++;return {id:d.id,points:null};}
 if(r.level===null||!Number.isInteger(r.level)||r.level<1||r.level>4)throw new Error("Tingkat penilaian tidak valid.");
 const points=d.maximum*r.level/4;assessed++;if(d.scoreBearing&&d.weight>0){numerator+=d.weight*points/d.maximum;denominator+=d.weight;}return {id:d.id,points};});
 return {score:missing||!denominator?null:Math.round(100*numerator/denominator),missing,assessed,excluded,dimensions};
}
export function reviewProblems(r:LabRubric,ratings:LabRating[],answers:WrittenAnswers,final:boolean){
 const problems:string[]=[];try{assessRubric(r,ratings);}catch(e){problems.push((e as Error).message);}
 if(final&&ratings.length!==r.dimensions.length)problems.push("Catat status penilaian untuk semua dimensi.");
 for(const rating of ratings){if(rating.evidence.trim()&&!(answers[rating.dimensionId]??"").includes(rating.evidence.trim()))problems.push("Kutipan bukti harus berasal dari jawaban dimensi yang dinilai.");if(final&&rating.status==="RATED"&&(!rating.evidence.trim()||!rating.feedback.trim()||!rating.improvement.trim()))problems.push("Dimensi yang dinilai memerlukan bukti, alasan, dan saran perbaikan.");}
 return problems;
}
export const caseContentSchema=z.object({title:z.string(),description:z.string(),narrative:z.string(),facts:z.array(z.string()),stakeholders:z.array(z.string()),evidence:z.array(z.object({title:z.string(),text:z.string()})),unknowns:z.array(z.string()),objectives:z.array(z.string()),alternatives:z.array(z.string()),sourceIds:z.array(z.string()),notice:z.string()});
export type CaseContent=z.infer<typeof caseContentSchema>;
export const submissionLabels:Record<string,string>={DRAFT:"Draf",SUBMITTED:"Dikirim · belum ditinjau",UNDER_REVIEW:"Sedang ditinjau pengajar",REVIEWED:"Ditinjau pengajar",REVISION_REQUESTED:"Perlu revisi"};
