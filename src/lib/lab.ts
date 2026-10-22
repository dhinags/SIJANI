import "server-only";
import { Prisma, type User } from "@prisma/client";
import { db } from "./db";
import { demoEnabled } from "./auth";
import { HttpError } from "./http";
import { assessRubric, caseContentSchema, emptyRatings, labRubric, ratingSchema, reviewProblems, rubricDefinitionSchema, writtenAnswersSchema, type ReviewInput, type WrittenAnswers } from "./lab-model";

export function visibleCase():Prisma.CaseScenarioWhereInput{return {OR:[{status:"PUBLISHED"},...(demoEnabled()?[{isDemoSeed:true,status:"DRAFT"}]:[])]};}
export function activeGrant(reviewerId:string):Prisma.CaseReviewGrantWhereInput{return {reviewerId,revokedAt:null,OR:[{expiresAt:null},{expiresAt:{gt:new Date()}}]};}
const submissionInclude={scenarioVersion:true,reviews:{orderBy:[{createdAt:"asc" as const},{id:"asc" as const}]},saves:{select:{number:true,action:true,createdAt:true},orderBy:{number:"desc" as const},take:50}} satisfies Prisma.WrittenSubmissionInclude;
export async function accessSubmission(tx:Prisma.TransactionClient,id:string,user:Pick<User,"id"|"role">){
 const s=await tx.writtenSubmission.findUnique({where:{id}});if(!s)throw new HttpError(404,"Analisis tidak ditemukan.");
 if(s.userId===user.id)return s;
 if(user.role!=="DOSEN"||s.status==="DRAFT"||!await tx.caseReviewGrant.findFirst({where:{...activeGrant(user.id),studentId:s.userId,caseSlug:s.caseSlug}}))throw new HttpError(404,"Analisis tidak ditemukan atau di luar izin Anda.");
 return s;
}
export async function labSubmission(id:string,user:User){
 return db.$transaction(async tx=>{
  const access=await accessSubmission(tx,id,user);const s=await tx.writtenSubmission.findUniqueOrThrow({where:{id},include:submissionInclude});
  const instructor=access.userId!==user.id;
  if(instructor)await tx.labAudit.create({data:{submissionId:id,actorId:user.id,action:"READ",detail:"Pembacaan melalui izin kasus aktif."}});
  return {id:s.id,caseSlug:s.caseSlug,caseVersion:s.caseVersion,status:s.status,revision:s.revision,parentId:s.parentId,createdAt:s.createdAt.toISOString(),submittedAt:s.submittedAt?.toISOString()??null,feedbackReadAt:s.feedbackReadAt?.toISOString()??null,answers:writtenAnswersSchema.parse(s.answers),rubric:rubricDefinitionSchema.parse(s.rubricSnapshot),scenario:caseContentSchema.parse(s.scenarioVersion.content),instructorGuide:instructor?s.scenarioVersion.instructorGuide:null,owner:!instructor,saves:!instructor?s.saves.map(v=>({...v,createdAt:v.createdAt.toISOString()})):[],reviews:s.reviews.filter(r=>r.status==="FINAL"||r.reviewerId===user.id).map(r=>({id:r.id,method:r.method,number:r.number,amendsId:r.amendsId,revision:r.revision,status:r.status,editable:r.reviewerId===user.id,ratings:ratingSchema.array().parse(r.ratings),summary:r.summary,strengths:r.strengths,improvements:r.improvements,nextSteps:r.nextSteps,outcome:r.outcome,score:r.score,createdAt:r.createdAt.toISOString(),finalizedAt:r.finalizedAt?.toISOString()??null}))};
 },{isolationLevel:"Serializable"});
}
export type LabSubmission=Awaited<ReturnType<typeof labSubmission>>;
export type PresentedReview=LabSubmission["reviews"][number];
export async function startWritten(caseSlug:string,parentId:string|undefined,user:User){
 try{return await db.$transaction(async tx=>{
  const parent=parentId?await tx.writtenSubmission.findFirst({where:{id:parentId,userId:user.id,caseSlug,status:{not:"DRAFT"}}}):null;
  if(parentId&&!parent)throw new HttpError(404,"Analisis asal tidak ditemukan.");
  if(parentId){const child=await tx.writtenSubmission.findFirst({where:{parentId,userId:user.id},orderBy:{createdAt:"desc"}});if(child)return child.id;}
  const existing=await tx.writtenSubmission.findFirst({where:{userId:user.id,caseSlug,status:"DRAFT"}});if(existing)return existing.id;
  const scenario=await tx.caseScenario.findFirst({where:{AND:[{slug:caseSlug},visibleCase()]}});if(!scenario)throw new HttpError(404,"Kasus belum tersedia.");
  const version=await tx.caseVersion.findUnique({where:{caseSlug_number:{caseSlug,number:parent?.caseVersion??scenario.version}}});if(!version)throw new HttpError(409,"Versi kasus belum disiapkan.");
  const definition=parent?rubricDefinitionSchema.parse(parent.rubricSnapshot):rubricDefinitionSchema.parse((await tx.rubricVersion.findUniqueOrThrow({where:{id:labRubric.id}})).definition);
  const answers=parent?writtenAnswersSchema.parse(parent.answers):{};
  const s=await tx.writtenSubmission.create({data:{userId:user.id,caseSlug,caseVersion:version.number,rubricVersionId:parent?.rubricVersionId??definition.id,rubricSnapshot:definition,parentId,answers,saves:{create:{number:0,answers,action:parent?"REVISION_STARTED":"STARTED"}}}});
  return s.id;
 },{isolationLevel:"Serializable"});}catch(e){if(e instanceof Prisma.PrismaClientKnownRequestError&&["P2002","P2034"].includes(e.code)){const existing=await db.writtenSubmission.findFirst({where:{userId:user.id,caseSlug,status:"DRAFT"}});if(existing)return existing.id;}throw e;}
}
export async function saveWritten(id:string,user:User,revision:number,answers:WrittenAnswers,submit:boolean){
 return db.$transaction(async tx=>{
  const s=await tx.writtenSubmission.findFirst({where:{id,userId:user.id}});if(!s)throw new HttpError(404,"Analisis tidak ditemukan.");
  if(s.status!=="DRAFT"){if(submit)return;throw new HttpError(409,"Analisis terkirim tetap utuh. Buat revisi baru.");}
  const rubric=rubricDefinitionSchema.parse(s.rubricSnapshot);
  if(submit&&rubric.dimensions.some(d=>!answers[d.id]?.trim()))throw new HttpError(400,"Isi seluruh dimensi. Nyatakan ketidakpastian bila informasi belum tersedia.");
  const updated=await tx.writtenSubmission.updateMany({where:{id,userId:user.id,revision,status:"DRAFT"},data:{answers,revision:{increment:1},...(submit?{status:"SUBMITTED",submittedAt:new Date()}: {})}});
  if(updated.count!==1)throw new HttpError(409,"Draf berubah di tab lain. Pertahankan tulisan Anda dan muat ulang sebelum menyimpan.");
  await tx.writtenRevision.create({data:{submissionId:id,number:revision+1,answers,action:submit?"SUBMITTED":"SAVED"}});
 },{isolationLevel:"Serializable"});
}
export async function startReview(id:string,user:User,amendsId?:string){
 return db.$transaction(async tx=>{
  const s=await accessSubmission(tx,id,user);if(s.status==="DRAFT")throw new HttpError(409,"Kirim analisis sebelum memulai tinjauan.");
  const own=s.userId===user.id;const method=own?"SELF_REVIEW":"INSTRUCTOR";
  if(amendsId){const duplicate=await tx.formativeReview.findUnique({where:{amendsId}});if(duplicate){if(duplicate.reviewerId!==user.id)throw new HttpError(404,"Tinjauan tidak ditemukan.");return duplicate.id;}}
  const existing=await tx.formativeReview.findFirst({where:{submissionId:id,reviewerId:user.id},orderBy:{number:"desc"}});
  if(existing?.status==="DRAFT"||existing&&!amendsId)return existing.id;
  if(amendsId&&(!existing||existing.id!==amendsId||existing.status!=="FINAL"))throw new HttpError(409,"Amandemen harus berdasarkan tinjauan final terbaru milik Anda.");
  const r=await tx.formativeReview.create({data:{submissionId:id,reviewerId:user.id,method,number:(existing?.number??0)+1,amendsId,ratings:existing?.ratings??emptyRatings(rubricDefinitionSchema.parse(s.rubricSnapshot)),summary:existing?.summary??"",strengths:existing?.strengths??"",improvements:existing?.improvements??"",nextSteps:existing?.nextSteps??"",outcome:existing?.outcome??"REVIEWED"}});
  if(!own)await tx.writtenSubmission.update({where:{id},data:{status:"UNDER_REVIEW"}});
  await tx.labAudit.create({data:{submissionId:id,actorId:user.id,action:amendsId?"AMENDMENT_STARTED":"REVIEW_STARTED",detail:`${method} · tinjauan ${r.number}`}});
  return r.id;
 },{isolationLevel:"Serializable"});
}
export async function saveReview(id:string,user:User,input:ReviewInput,final:boolean){
 return db.$transaction(async tx=>{
  const r=await tx.formativeReview.findUnique({where:{id}});if(!r||r.reviewerId!==user.id)throw new HttpError(404,"Tinjauan tidak ditemukan.");
  const s=await accessSubmission(tx,r.submissionId,user);
  if(r.status==="FINAL"){if(final)return r.submissionId;throw new HttpError(409,"Tinjauan final tidak diubah. Buat amandemen.");}
  const definition=rubricDefinitionSchema.parse(s.rubricSnapshot);const answers=writtenAnswersSchema.parse(s.answers);
  const problems=reviewProblems(definition,input.ratings,answers,final);
  if(final&&(!input.summary.trim()||!input.strengths.trim()||!input.improvements.trim()||!input.nextSteps.trim()))problems.push("Lengkapi ringkasan, kekuatan, perbaikan, dan langkah berikutnya.");
  const sourceIds=[...new Set(input.ratings.flatMap(r=>r.referenceIds))];if(await tx.caseReference.count({where:{caseSlug:s.caseSlug,sourceId:{in:sourceIds}}})!==sourceIds.length)problems.push("Referensi harus terhubung dengan kasus ini.");
  if(problems.length)throw new HttpError(400,problems[0]);
  const result=assessRubric(definition,input.ratings);const {revision,...fields}=input;
  const changed=await tx.formativeReview.updateMany({where:{id,reviewerId:user.id,revision,status:"DRAFT"},data:{...fields,revision:{increment:1},score:final?result.score:null,...(final?{status:"FINAL",finalizedAt:new Date()}: {})}});
  if(changed.count!==1)throw new HttpError(409,"Tinjauan berubah di tab lain. Muat ulang sebelum melanjutkan.");
  if(final)await tx.writtenSubmission.update({where:{id:s.id},data:{feedbackReadAt:null,...(r.method==="INSTRUCTOR"?{status:input.outcome}: {})}});
  await tx.labAudit.create({data:{submissionId:s.id,actorId:user.id,action:final?"REVIEW_FINALIZED":"REVIEW_SAVED",detail:`${r.method} · tinjauan ${r.number} · revisi ${revision+1}`}});
  return s.id;
 },{isolationLevel:"Serializable"});
}
export async function labSummary(userId?:string){if(!userId)return {drafts:0,submitted:0,instructorReviewed:0,selfReviewed:0,referenceRead:0,resume:null as string|null};const [drafts,submitted,instructorReviewed,selfReviewed,referenceRead,draft]=await Promise.all([db.writtenSubmission.count({where:{userId,status:"DRAFT"}}),db.writtenSubmission.count({where:{userId,status:{not:"DRAFT"}}}),db.writtenSubmission.count({where:{userId,reviews:{some:{method:"INSTRUCTOR",status:"FINAL"}}}}),db.writtenSubmission.count({where:{userId,reviews:{some:{method:"SELF_REVIEW",status:"FINAL"}}}}),db.referenceProgress.count({where:{userId}}),db.writtenSubmission.findFirst({where:{userId,status:"DRAFT"},orderBy:{updatedAt:"desc"},select:{id:true}})]);return {drafts,submitted,instructorReviewed,selfReviewed,referenceRead,resume:draft?.id??null};}
