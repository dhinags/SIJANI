import "server-only";
import { randomUUID } from "node:crypto";
import type { Prisma, User } from "@prisma/client";
import { db } from "./db";
import { HttpError } from "./http";
import { entityInput, importSchema, publicationProblems, sourceFingerprint, editorialRole } from "./knowledge-model";
import { knowledgeInclude } from "./knowledge";
import type { z } from "zod";
export function requireEditorial(user:Pick<User,"role">, review=false) { if(!editorialRole(user.role)||review&&user.role!=="REVIEWER") throw new HttpError(403,"Tindakan ini memerlukan izin editor atau reviewer yang sesuai."); }
async function dependencies(tx:Prisma.TransactionClient,input:z.infer<typeof entityInput>) {
  if(new Set(input.domainSlugs).size!==input.domainSlugs.length || await tx.learningDomain.count({where:{slug:{in:input.domainSlugs}}})!==input.domainSlugs.length) throw new HttpError(400,"Domain tidak valid atau duplikat.");
  const sources=[...new Set(input.citations.map(c=>c.sourceId))];
  if(await tx.academicSource.count({where:{id:{in:sources}}})!==sources.length) throw new HttpError(400,"Rujukan sumber tidak ditemukan.");
  if(new Set(input.citations.map(c=>`${c.sourceId}:${c.section}`)).size!==input.citations.length) throw new HttpError(400,"Pemetaan kutipan duplikat.");
}
export async function importKnowledge(input:z.infer<typeof importSchema>,user:User) {
  requireEditorial(user);
  try { return await db.$transaction(async tx=>{
    for(const s of input.sources) await tx.academicSource.create({data:{...s,doi:s.doi?.toLowerCase()??null,isbn:s.isbn?.replaceAll("-","")??null,fingerprint:sourceFingerprint(s),status:"PENDING"}});
    for(const e of input.entities) {
      if(e.kind==="DOMAIN") {
        if(e.id!==`domain:${e.slug}`||e.domainSlugs.length!==1||e.domainSlugs[0]!==e.slug)throw new HttpError(400,"Domain menggunakan ID domain:slug dan keanggotaan pada slug-nya sendiri.");
        await tx.learningDomain.create({data:{slug:e.slug,name:e.title,description:e.summary,color:"blue"}});
      }
      await dependencies(tx,e); const {domainSlugs,citations,...data}=e;
      await tx.knowledgeEntity.create({data:{...data,authorLabel:`Import oleh ${user.role.toLowerCase()}`,lastEditorId:user.id,domains:{create:domainSlugs.map(domainSlug=>({domainSlug}))},citations:{create:citations},revisions:{create:{number:1,editorId:user.id,snapshot:e}}}});
      for(const domain of domainSlugs) {
        if(!await tx.knowledgeEntity.findUnique({where:{id:`domain:${domain}`}})) throw new HttpError(400,"Simpul domain belum terdaftar.");
        if(data.kind!=="DOMAIN") await tx.knowledgeRelation.create({data:{id:randomUUID(),fromId:e.id,toId:`domain:${domain}`,type:"BELONGS_TO_DOMAIN",explanation:"Kategori ditetapkan editor. Pemetaan ini belum diverifikasi."}});
      }
    }
    for(const r of input.relations) {
      const nodes=await tx.knowledgeEntity.findMany({where:{id:{in:[r.fromId,r.toId]}}});
      if(nodes.length!==2 || r.type==="BELONGS_TO_DOMAIN"&&nodes.find(n=>n.id===r.toId)?.kind!=="DOMAIN" || r.type==="DEVELOPED_BY"&&nodes.find(n=>n.id===r.toId)?.kind!=="THEORIST") throw new HttpError(400,"Simpul atau tipe hubungan tidak valid.");
      if(r.sourceId&&!await tx.academicSource.findUnique({where:{id:r.sourceId}})) throw new HttpError(400,"Sumber hubungan tidak ditemukan.");
      await tx.knowledgeRelation.create({data:r});
    }
    return {entities:input.entities.length,sources:input.sources.length,relations:input.relations.length};
  }, { isolationLevel: "Serializable" }); } catch(error) { if(error&&typeof error==="object"&&"code" in error&&error.code==="P2002") throw new HttpError(409,"ID, slug, sumber, atau hubungan sudah terdaftar. Impor dibatalkan seluruhnya."); throw error; }
}
export async function editKnowledge(id:string,revision:number,input:z.infer<typeof entityInput>,user:User) {
  requireEditorial(user);
  return db.$transaction(async tx=>{
    const entity=await tx.knowledgeEntity.findUnique({where:{id}});
    if(!entity)throw new HttpError(404,"Materi tidak ditemukan.");
    if(input.id!==id||input.slug!==entity.slug||input.kind!==entity.kind)throw new HttpError(400,"ID, slug, dan jenis tetap agar tautan stabil.");
    if(!["DRAFT","PLANNED"].includes(entity.status))throw new HttpError(409,"Kembalikan ke draf sebelum mengedit.");
    await dependencies(tx,input);
    const {domainSlugs,citations,...data}=input;
    const changed=await tx.knowledgeEntity.updateMany({where:{id,revision,status:entity.status},data:{...data,status:"DRAFT",revision:{increment:1},lastEditorId:user.id,verifiedAt:null,publishedAt:null}});
    if(changed.count!==1)throw new HttpError(409,"Revisi berubah. Muat ulang sebelum menyimpan.");
    await tx.knowledgeMembership.deleteMany({where:{entityId:id}});
    await tx.knowledgeMembership.createMany({data:domainSlugs.map(domainSlug=>({entityId:id,domainSlug}))});
    await tx.knowledgeCitation.deleteMany({where:{entityId:id}});
    await tx.knowledgeCitation.createMany({data:citations.map(c=>({...c,entityId:id}))});
    if(entity.kind==="DOMAIN") {
      if(domainSlugs.length!==1||domainSlugs[0]!==entity.slug)throw new HttpError(400,"Keanggotaan simpul domain harus tetap pada slug-nya sendiri.");
      await tx.learningDomain.update({where:{slug:entity.slug},data:{name:input.title,description:input.summary}});
    } else {
      const targets=domainSlugs.map(slug=>`domain:${slug}`);
      await tx.knowledgeRelation.deleteMany({where:{fromId:id,type:"BELONGS_TO_DOMAIN",toId:{notIn:targets}}});
      for(const toId of targets) await tx.knowledgeRelation.upsert({where:{fromId_toId_type:{fromId:id,toId,type:"BELONGS_TO_DOMAIN"}},create:{id:randomUUID(),fromId:id,toId,type:"BELONGS_TO_DOMAIN",explanation:"Kategori ditetapkan editor; belum diverifikasi."},update:{}});
    }
    // A changed endpoint invalidates prior scientific relationship review.
    await tx.knowledgeRelation.updateMany({where:{OR:[{fromId:id},{toId:id}]},data:{status:"DRAFT",verifiedAt:null,reviewerId:null}});
    await tx.knowledgeRevision.create({data:{entityId:id,number:revision+1,editorId:user.id,snapshot:input}});
    return {revision:revision+1};
  }, { isolationLevel: "Serializable" });
}
export async function reviewKnowledge(id:string,revision:number,action:"submit"|"verify"|"publish"|"revert",note:string,user:User) {
  requireEditorial(user,action==="verify"||action==="publish");
  return db.$transaction(async tx=>{
    const e=await tx.knowledgeEntity.findUnique({where:{id},include:knowledgeInclude});
    if(!e)throw new HttpError(404,"Materi tidak ditemukan.");
    const next={submit:"UNDER_REVIEW",verify:"VERIFIED",publish:"PUBLISHED",revert:"DRAFT"} as const;
    if(action==="submit"&&e.status!=="DRAFT"||action==="verify"&&e.status!=="UNDER_REVIEW"||action==="publish"&&e.status!=="VERIFIED")throw new HttpError(409,"Urutan tinjauan tidak valid.");
    if(action==="verify") {
      if(e.lastEditorId===user.id)throw new HttpError(403,"Reviewer harus berbeda dari editor revisi terakhir.");
      // This explicit action attests the exact cited sections of this revision.
      const problems=publicationProblems({...e,citations:e.citations.map(c=>({...c,verified:true}))});
      if(problems.length)throw new HttpError(400,problems.join(" "));
    }
    if(action==="publish") { const problems=publicationProblems(e); if(!e.verifiedAt||problems.length)throw new HttpError(400,problems.join(" ")||"Revisi belum diverifikasi."); }
    const changed=await tx.knowledgeEntity.updateMany({where:{id,revision,status:e.status},data:{status:next[action],revision:{increment:1},...(action==="verify"?{verifiedAt:new Date()}:{}),...(action==="publish"?{publishedAt:new Date()}:{}),...(action==="revert"?{verifiedAt:null,publishedAt:null}: {})}});
    if(changed.count!==1)throw new HttpError(409,"Revisi berubah. Muat ulang sebelum melanjutkan.");
    if(action==="verify"||action==="revert")await tx.knowledgeCitation.updateMany({where:{entityId:id},data:{verified:action==="verify"}});
    if(action==="revert")await tx.knowledgeRelation.updateMany({where:{OR:[{fromId:id},{toId:id}]},data:{status:"DRAFT",verifiedAt:null,reviewerId:null}});
    await tx.knowledgeReview.create({data:{entityId:id,revision:revision+1,action,note,reviewerId:user.id}});
    await tx.knowledgeRevision.create({data:{entityId:id,number:revision+1,editorId:user.id,snapshot:JSON.parse(JSON.stringify(await tx.knowledgeEntity.findUniqueOrThrow({where:{id},include:knowledgeInclude})))}});
    return {status:next[action],revision:revision+1};
  }, { isolationLevel: "Serializable" });
}
export async function reviewSource(id:string,verified:boolean,note:string,user:User) {
  requireEditorial(user,true);
  return db.$transaction(async tx=>{
    const source=await tx.academicSource.findUnique({where:{id}}); if(!source)throw new HttpError(404,"Sumber tidak ditemukan.");
    if(verified&&(!source.author||!/^\d{4}$/.test(source.year)||!source.version||!(source.url||source.doi||source.isbn)))throw new HttpError(400,"Penulis, tahun, versi, dan pengenal sumber diperlukan untuk verifikasi.");
    await tx.academicSource.update({where:{id},data:{status:verified?"VERIFIED":"PENDING",verifiedAt:verified?new Date():null}});
    await tx.sourceReview.create({data:{sourceId:id,reviewerId:user.id,note:`${verified?"VERIFY":"REVERT"}: ${note}`}});
    if(!verified) {
      await tx.knowledgeCitation.updateMany({where:{sourceId:id},data:{verified:false}});
      const entities=await tx.knowledgeEntity.findMany({where:{citations:{some:{sourceId:id}}},include:knowledgeInclude});
      for(const e of entities) {
        await tx.knowledgeEntity.update({where:{id:e.id},data:{status:"DRAFT",verifiedAt:null,publishedAt:null,revision:{increment:1}}});
        await tx.knowledgeReview.create({data:{entityId:e.id,revision:e.revision+1,action:"source-reverted",note,reviewerId:user.id}});
        await tx.knowledgeRevision.create({data:{entityId:e.id,number:e.revision+1,editorId:user.id,snapshot:JSON.parse(JSON.stringify(await tx.knowledgeEntity.findUniqueOrThrow({where:{id:e.id},include:knowledgeInclude})))}});
      }
      await tx.knowledgeRelation.updateMany({where:{OR:[{sourceId:id},{fromId:{in:entities.map(e=>e.id)}},{toId:{in:entities.map(e=>e.id)}}]},data:{status:"DRAFT",verifiedAt:null,reviewerId:null}});
    }
    return {ok:true};
  }, { isolationLevel: "Serializable" });
}
export async function reviewRelation(id:string,note:string,user:User) {
  requireEditorial(user,true);
  return db.$transaction(async tx=>{
    const relation=await tx.knowledgeRelation.findUnique({where:{id},include:{source:true,from:true,to:true}});
    if(!relation)throw new HttpError(404,"Hubungan tidak ditemukan.");
    if(!relation.source?.verifiedAt||relation.source.status!=="VERIFIED"||!relation.locator.trim()||/belum|pending/i.test(relation.locator)||!["VERIFIED","PUBLISHED"].includes(relation.from.status)||!["VERIFIED","PUBLISHED"].includes(relation.to.status))throw new HttpError(400,"Kedua simpul, sumber, dan lokasi hubungan harus telah diverifikasi.");
    await tx.knowledgeRelation.update({where:{id},data:{status:"VERIFIED",verifiedAt:new Date(),reviewerId:user.id}});
    await tx.knowledgeReview.create({data:{entityId:relation.fromId,revision:relation.from.revision,action:`relation:${id}`,note,reviewerId:user.id}});
    return {ok:true};
  },{isolationLevel:"Serializable"});
}
