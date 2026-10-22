import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { api, checkOrigin, HttpError, parseBody, rateLimit } from "@/lib/http";
import { db } from "@/lib/db";
import { labSubmission, saveReview, saveWritten, startReview, startWritten } from "@/lib/lab";
import { reviewInputSchema, writtenAnswersSchema } from "@/lib/lab-model";
export const dynamic="force-dynamic";
async function route(request:Request,context:{params:Promise<{path:string[]}>}){return api(async()=>{
 const user=await requireUser();const path=(await context.params).path;const method=request.method;
 if(method==="GET"){
  if(path[0]==="submissions"&&path.length===2)return NextResponse.json(await labSubmission(path[1],user));
  if(path[0]==="submissions"&&path.length===4&&path[2]==="revisions"){
   const s=await db.writtenSubmission.findFirst({where:{id:path[1],userId:user.id}});if(!s)throw new HttpError(404,"Analisis tidak ditemukan.");if(!/^\d+$/.test(path[3])||!Number.isSafeInteger(Number(path[3])))throw new HttpError(400,"Nomor revisi tidak valid.");const revision=await db.writtenRevision.findUnique({where:{submissionId_number:{submissionId:s.id,number:Number(path[3])}}});if(!revision)throw new HttpError(404,"Revisi tidak ditemukan.");return NextResponse.json({number:revision.number,action:revision.action,answers:revision.answers,createdAt:revision.createdAt});
  }
  throw new HttpError(404,"Halaman tidak ditemukan.");
 }
 checkOrigin(request);await rateLimit(`lab:${user.id}`);
 if(path[0]==="submissions"&&path.length===1&&method==="POST"){const data=await parseBody(request,z.object({caseSlug:z.string().max(100),parentId:z.string().max(100).optional()}).strict());return NextResponse.json({id:await startWritten(data.caseSlug,data.parentId,user)},{status:201});}
 if(path[0]==="submissions"&&path.length===2&&["PATCH","POST"].includes(method)){const data=await parseBody(request,z.object({revision:z.number().int().nonnegative(),answers:writtenAnswersSchema}).strict());await saveWritten(path[1],user,data.revision,data.answers,method==="POST");return NextResponse.json(await labSubmission(path[1],user));}
 if(path[0]==="submissions"&&path.length===3&&path[2]==="reviews"&&method==="POST"){const data=await parseBody(request,z.object({amendsId:z.string().max(100).optional()}).strict());const reviewId=await startReview(path[1],user,data.amendsId);return NextResponse.json({reviewId,submission:await labSubmission(path[1],user)});}
 if(path[0]==="reviews"&&path.length===2&&["PATCH","POST"].includes(method)){const input=await parseBody(request,reviewInputSchema);const id=await saveReview(path[1],user,input,method==="POST");return NextResponse.json(await labSubmission(id,user));}
 if(path[0]==="submissions"&&path.length===3&&path[2]==="complete"&&method==="POST"){
  await parseBody(request,z.object({}).strict());const changed=await db.writtenSubmission.updateMany({where:{id:path[1],userId:user.id,reviews:{some:{status:"FINAL"}}},data:{feedbackReadAt:new Date()}});if(!changed.count)throw new HttpError(404,"Umpan balik final tidak ditemukan.");return NextResponse.json({ok:true});
 }
 if(path[0]==="reference-progress"&&path.length===1&&method==="POST"){const {sectionId}=await parseBody(request,z.object({sectionId:z.string().max(100)}).strict());if(!await db.referenceSection.findUnique({where:{id:sectionId}}))throw new HttpError(404,"Bagian sumber belum tersedia.");await db.referenceProgress.upsert({where:{userId_sectionId:{userId:user.id,sectionId}},create:{userId:user.id,sectionId},update:{}});return NextResponse.json({ok:true});}
 throw new HttpError(404,"Halaman tidak ditemukan.");
});}
export const GET=route;export const POST=route;export const PATCH=route;
