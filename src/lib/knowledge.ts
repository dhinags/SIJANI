import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { currentUser, demoEnabled } from "./auth";
import { editorialRole, knowledgeHref, contentSchema, kindLabels, literalSearch } from "./knowledge-model";
export function visibleKnowledge(role?: string): Prisma.KnowledgeEntityWhereInput {
  return editorialRole(role) ? {} : { OR: [{ status:"PUBLISHED" }, ...(demoEnabled() ? [{ isDemoSeed:true, status:{ in:["DRAFT", "PLANNED"] as ("DRAFT"|"PLANNED")[] } }] : [])] };
}
export function visibleRelations(role?:string): Prisma.KnowledgeRelationWhereInput { return editorialRole(role) ? {} : { OR:[{status:"VERIFIED"},...(demoEnabled()?[{isDemoSeed:true,status:"DRAFT" as const}]:[])] }; }
export const knowledgeInclude = { domains:{include:{domain:true}}, citations:{include:{source:true}} } satisfies Prisma.KnowledgeEntityInclude;
export async function getKnowledge(slug:string, kind?:string) {
  const user=await currentUser();
  const entity=await db.knowledgeEntity.findFirst({where:{AND:[visibleKnowledge(user?.role),{slug},...(kind?[{kind:kind as "THEORY"}]:[])]},include:knowledgeInclude});
  if(!entity) return null;
  const relations=await db.knowledgeRelation.findMany({where:{AND:[{OR:[{fromId:entity.id},{toId:entity.id}]},{from:visibleKnowledge(user?.role)},{to:visibleKnowledge(user?.role)},visibleRelations(user?.role)]},include:{from:true,to:true,source:true},orderBy:{id:"asc"}});
  const progress=user?await db.knowledgeProgress.findUnique({where:{userId_entityId:{userId:user.id,entityId:entity.id}}}):null;
  return {entity,user,relations,progress};
}
export async function knowledgeCatalog(kind?:"THEORY"|"THEORIST"|"CONCEPT"|"APPROACH", domain?:string) {
  const user=await currentUser();
  return db.knowledgeEntity.findMany({where:{AND:[visibleKnowledge(user?.role),...(kind?[{kind}]:[]),...(domain?[{domains:{some:{domainSlug:domain}}}]:[])]},include:knowledgeInclude,orderBy:{title:"asc"},take:100});
}
export async function domainInventory() {
  const user=await currentUser();
  return db.learningDomain.findMany({where:editorialRole(user?.role)?{}:{OR:[{articles:{some:{}}},{knowledge:{some:{entity:{AND:[{kind:"DOMAIN"},visibleKnowledge(user?.role)]}}}}]},include:{knowledge:{where:{entity:visibleKnowledge(user?.role)},include:{entity:{select:{kind:true,status:true}}}},_count:{select:{articles:true}}},orderBy:{name:"asc"}});
}
export async function searchKnowledge(q:string,domain:string,type:string,page:number) {
  const user=await currentUser(); const visible=visibleKnowledge(user?.role); const skip=(page-1)*12; const literal=literalSearch(q);
  const kind=Object.keys(kindLabels).includes(type)?type as "THEORY":undefined;
  const where:Prisma.KnowledgeEntityWhereInput={AND:[visible,...(kind?[{kind}]:[]),...(domain?[{domains:{some:{domainSlug:domain}}}]:[]),...(q?[{OR:[{title:{contains:literal,mode:"insensitive" as const}},{summary:{contains:literal,mode:"insensitive" as const}},{keywords:{contains:literal,mode:"insensitive" as const}}]}]:[])]};
  const sourceWhere:Prisma.AcademicSourceWhereInput={AND:[...(q?[{OR:[{title:{contains:literal,mode:"insensitive" as const}},{author:{contains:literal,mode:"insensitive" as const}},{doi:{contains:literal,mode:"insensitive" as const}},{note:{contains:literal,mode:"insensitive" as const}}]}]:[]),...(domain?[{OR:[{knowledgeCitations:{some:{entity:{AND:[visible,{domains:{some:{domainSlug:domain}}}]}}}},{citations:{some:{article:{domainSlug:domain}}}}]}]:[])]};
  const [entities,total,sources,sourceTotal]=await Promise.all([type==="SOURCE"?[]:db.knowledgeEntity.findMany({where,orderBy:[{kind:"asc"},{title:"asc"},{id:"asc"}],skip,take:12}),type==="SOURCE"?0:db.knowledgeEntity.count({where}),type&&type!=="SOURCE"?[]:db.academicSource.findMany({where:sourceWhere,orderBy:{id:"asc"},skip,take:12}),type&&type!=="SOURCE"?0:db.academicSource.count({where:sourceWhere})]);
  return {results:[...entities.map(e=>({id:e.id,title:e.title,summary:e.summary,kind:e.kind,status:e.status,href:knowledgeHref(e)})),...sources.map(s=>({id:s.id,title:s.title,summary:`${s.author} · ${s.year}`,kind:"SOURCE",status:s.status,href:`/referensi#${s.id}`}))],page,pages:Math.max(1,Math.ceil(Math.max(total,sourceTotal)/12)),total:total+sourceTotal};
}
export function publicContent(content:unknown) { const body=contentSchema.parse(content); return {...body,check:body.check?{question:body.check.question,options:body.check.options}:undefined}; }
