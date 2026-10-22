import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { visibleKnowledge, visibleRelations, domainInventory } from "@/lib/knowledge";
import { PageHeading } from "@/components/common";
import { KnowledgeMap } from "@/components/knowledge-map";
export default async function MapPage({searchParams}:{searchParams:Promise<{domain?:string;node?:string}>}) {
 const [params,user]=await Promise.all([searchParams,currentUser()]); const where=visibleKnowledge(user?.role);
 const [all,domains]=await Promise.all([db.knowledgeEntity.findMany({where:{AND:[where,...(params.domain?[{domains:{some:{domainSlug:params.domain}}}]:[])]},include:{domains:true},orderBy:[{kind:"asc"},{title:"asc"}],take:81}),domainInventory()]);
 // A domain query bounds database work; selecting another domain performs a normal route navigation in the filter below.
 const entities=all.slice(0,80);const relations=await db.knowledgeRelation.findMany({where:{fromId:{in:entities.map(e=>e.id)},toId:{in:entities.map(e=>e.id)},...visibleRelations(user?.role)},include:{source:true},take:300,orderBy:{id:"asc"}});
 return <><PageHeading eyebrow="IKUTI JEJAK GAGASAN" title="Knowledge Map" description="Jelajahi teori, konsep, tokoh, dan domain melalui hubungan yang disimpan beserta alasan dan statusnya."/><KnowledgeMap key={params.domain??"all"} entities={entities.map(e=>({id:e.id,slug:e.slug,title:e.title,summary:e.summary,kind:e.kind,status:e.status,domainSlugs:e.domains.map(d=>d.domainSlug)}))} relations={relations.map(r=>({id:r.id,fromId:r.fromId,toId:r.toId,type:r.type,explanation:r.explanation,status:r.status,citation:r.source?`${r.source.title} · ${r.locator}`:""}))} domains={domains.map(d=>({slug:d.slug,name:d.name}))} initialDomain={params.domain??""} initialNode={params.node??""} truncated={all.length>80}/></>;
}
