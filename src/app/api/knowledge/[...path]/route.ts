import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { api, checkOrigin, HttpError, parseBody, rateLimit } from "@/lib/http";
import { contentSchema, entityInput, idSchema, importSchema } from "@/lib/knowledge-model";
import { visibleKnowledge, searchKnowledge, knowledgeInclude } from "@/lib/knowledge";
import { editKnowledge, importKnowledge, requireEditorial, reviewKnowledge, reviewSource, reviewRelation } from "@/lib/editorial";
export const dynamic="force-dynamic";
const revision=z.number().int().positive();
const reviewInput=z.object({revision,action:z.enum(["submit","verify","publish","revert"]),note:z.string().trim().min(10).max(2000)}).strict();
async function route(request:Request,{params}:{params:Promise<{path:string[]}>}) { return api(async()=>{
  const path=(await params).path; const key=path.join("/");
  if(request.method==="GET"&&key==="search") {
    const p=new URL(request.url).searchParams;
    return NextResponse.json(await searchKnowledge((p.get("q")??"").trim().slice(0,100),(p.get("domain")??"").slice(0,100),(p.get("type")??"").slice(0,30),Math.min(1000,Math.max(1,Number.parseInt(p.get("page")??"1")||1))));
  }
  const user=await requireUser();
  if(request.method==="GET") {
    if(key==="activity")return NextResponse.json(await db.knowledgeProgress.findMany({where:{userId:user.id,entity:visibleKnowledge(user.role)},include:{entity:{select:{slug:true,kind:true,title:true}}},orderBy:{viewedAt:"desc"},take:100}));
    if(path[0]==="editorial"&&path.length===2) {
      requireEditorial(user); const e=await db.knowledgeEntity.findUnique({where:{id:path[1]},include:{...knowledgeInclude,revisions:{orderBy:{number:"desc"},take:20},reviews:{orderBy:{createdAt:"desc"},take:20}}});
      if(!e)throw new HttpError(404,"Materi tidak ditemukan."); return NextResponse.json(e);
    }
    throw new HttpError(404,"Halaman tidak ditemukan.");
  }
  checkOrigin(request); await rateLimit(`knowledge:${user.id}`);
  if(key==="activity"&&request.method==="POST") {
    const input=await parseBody(request,z.object({entityId:idSchema,action:z.enum(["view","bookmark","unbookmark","review","complete","practice"]),answer:z.number().int().min(0).max(4).optional(),revision:revision.optional()}).strict());
    const entity=await db.knowledgeEntity.findFirst({where:{AND:[{id:input.entityId},visibleKnowledge(user.role)]}}); if(!entity)throw new HttpError(404,"Materi tidak tersedia.");
    const now=new Date(); let data: {viewedAt?:Date;bookmarkedAt?:Date|null;reviewedAt?:Date;completedAt?:Date;practicedAt?:Date;checkRevision?:number;checkCorrect?:boolean}={}; let feedback: {correct:boolean;explanation:string}|undefined;
    if(input.action==="view")data={viewedAt:now};
    if(input.action==="bookmark")data={bookmarkedAt:now};
    if(input.action==="unbookmark")data={bookmarkedAt:null};
    if(input.action==="review")data={reviewedAt:now};
    if(input.action==="complete")data={completedAt:now};
    if(input.action==="practice") {
      const check=contentSchema.parse(entity.content).check; if(!check||input.answer===undefined||input.answer>=check.options.length)throw new HttpError(400,"Pilihan latihan tidak valid.");
      if(input.revision!==entity.revision)throw new HttpError(409,"Materi berubah. Muat ulang untuk memakai kunci revisi terbaru.");
      feedback={correct:input.answer===check.correct,explanation:check.explanation}; data={practicedAt:now,checkRevision:entity.revision,checkCorrect:feedback.correct};
    }
    await db.knowledgeProgress.upsert({where:{userId_entityId:{userId:user.id,entityId:entity.id}},create:{userId:user.id,entityId:entity.id,...data},update:data});
    return NextResponse.json({ok:true,...feedback});
  }
  requireEditorial(user);
  if(key==="import"&&request.method==="POST")return NextResponse.json(await importKnowledge(await parseBody(request,importSchema),user),{status:201});
  if(path[0]==="editorial"&&path.length===2&&request.method==="PATCH") { const input=await parseBody(request,z.object({revision,entity:entityInput}).strict()); return NextResponse.json(await editKnowledge(path[1],input.revision,input.entity,user)); }
  if(path[0]==="editorial"&&path.length===3&&path[2]==="review"&&request.method==="POST") { const input=await parseBody(request,reviewInput); return NextResponse.json(await reviewKnowledge(path[1],input.revision,input.action,input.note,user)); }
  if(path[0]==="sources"&&path.length===2&&request.method==="POST") { const input=await parseBody(request,z.object({verified:z.boolean(),note:z.string().trim().min(20).max(2000)}).strict()); return NextResponse.json(await reviewSource(path[1],input.verified,input.note,user)); }
  if(path[0]==="relations"&&path.length===2&&request.method==="POST") {
    requireEditorial(user,true); const input=await parseBody(request,z.object({note:z.string().trim().min(20).max(2000)}).strict());
    await reviewRelation(path[1],input.note,user);
    return NextResponse.json({ok:true});
  }
  throw new HttpError(404,"Halaman tidak ditemukan.");
}); }
export const GET=route; export const POST=route; export const PATCH=route;
