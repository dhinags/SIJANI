import type { Prisma } from "@prisma/client";
import { articles, domains } from "./content";
import { theorists } from "../src/lib/encyclopedia";
import { contentSchema, sourceFingerprint, type KnowledgeContent } from "../src/lib/knowledge-model";
export async function seedKnowledge(tx: Prisma.TransactionClient) {
  const allDomains = [...domains, { slug: "positif", name: "Psikologi Positif", description: "Kajian kesejahteraan, kekuatan, dan kehidupan yang bermakna. Materi menunggu kurasi.", color: "orange" }];
  for (const d of allDomains) {
    await tx.learningDomain.upsert({ where: { slug: d.slug }, create: d, update: {} });
  }
  for (const source of await tx.academicSource.findMany()) {
    if (!source.fingerprint) await tx.academicSource.update({ where: { id: source.id }, data: { fingerprint: sourceFingerprint(source) } });
  }
  const catalog: { id:string; slug:string; kind:"DOMAIN"|"THEORY"|"CONCEPT"|"THEORIST"; title:string; summary:string; domains:string[]; keywords:string; content:KnowledgeContent; source?:boolean }[] = [];
  for (const d of allDomains) catalog.push({ id:`domain:${d.slug}`, slug:d.slug, kind:"DOMAIN", title:d.name, summary:d.description, domains:[d.slug], keywords:d.name, content:{ definition:d.description, limitations:"Taksonomi editorial untuk navigasi. Cakupan domain ini belum lengkap." } });
  const classical = articles.find(a=>a.slug === "pengondisian-klasik")!;
  const operant = articles.find(a=>a.slug === "pengondisian-operan")!;
  const memory = articles.find(a=>a.slug === "memori-kerja")!;
  catalog.push(
    { id:"theory:classical", slug:classical.slug, kind:"THEORY", title:classical.title, summary:classical.summary, domains:["behaviorisme"], keywords:"classical conditioning Pavlov stimulus respons pembelajaran asosiatif", source:true, content:{ definition:classical.body[0].text, history:classical.body[1].text, mechanisms:classical.body[0].text, example:classical.body[2].text, limitations:classical.body[2].text, differences:classical.body[3].text } },
    { id:"theory:operant", slug:operant.slug, kind:"THEORY", title:operant.title, summary:operant.summary, domains:["behaviorisme"], keywords:"operant conditioning Skinner reinforcement konsekuensi perilaku", source:true, content:{ definition:operant.body[0].text, mechanisms:operant.body[1].text, applications:operant.body[2].text, example:operant.body[2].text, misconceptions:operant.body[3].text, limitations:operant.body[4].text } },
    { id:"theory:working-memory", slug:"model-memori-kerja", kind:"THEORY", title:"Model memori kerja", summary:memory.summary, domains:["kognitif"], keywords:"working memory Baddeley Hitch multicomponent", source:true, content:{ definition:memory.body[0].text, history:memory.body[1].text, applications:memory.body[2].text, limitations:memory.body[3].text } },
    { id:"concept:reinforcement", slug:"penguatan", kind:"CONCEPT", title:"Penguatan", summary:"Konsekuensi didefinisikan melalui perubahan perilaku, bukan niat pemberi hadiah.", domains:["behaviorisme","pendidikan"], keywords:"reinforcement penguatan positif negatif hadiah", source:true, content:{ definition:operant.body[1].text, context:operant.body[0].text, example:operant.body[2].text, misconceptions:operant.body[3].text, limitations:operant.body[4].text, check:{ question:"Dalam draf ini, apa yang menentukan apakah konsekuensi berfungsi sebagai penguat?", options:["Niat pemberi hadiah", "Meningkatnya kemungkinan perilaku dalam kondisi yang relevan", "Besarnya hadiah"], correct:1, explanation:"Kunci deterministik mengikuti definisi pada draf: fungsi penguat dinilai melalui perubahan perilaku. Ini latihan memahami bacaan yang belum ditinjau, bukan ukuran penguasaan." } } },
    { id:"concept:extinction", slug:"ekstingsi", kind:"CONCEPT", title:"Ekstingsi", summary:"Topik perencanaan: perubahan respons ketika kondisi belajar berubah.", domains:["behaviorisme"], keywords:"extinction pemadaman", source:true, content:{ definition:"Draf: dalam pengondisian klasik, ekstingsi membahas penurunan respons terkondisi ketika stimulus terkondisi tidak lagi diikuti stimulus tak terkondisi; dalam pengondisian operan, perilaku dapat menurun ketika penguatan dihentikan.", misconceptions:"Ekstingsi tidak boleh langsung diartikan sebagai penghapusan permanen seluruh pembelajaran sebelumnya.", limitations:"Penjelasan ini merupakan draf editorial baru. Perbedaan prosedur, kemungkinan kemunculan kembali respons, dan rujukan bagian perlu ditinjau sebelum publikasi." } },
    { id:"concept:working-memory", slug:"memori-kerja-konsep", kind:"CONCEPT", title:"Memori kerja", summary:memory.summary, domains:["kognitif","pendidikan"], keywords:"working memory perhatian instruksi", source:true, content:{ definition:memory.body[0].text, context:memory.body[1].text, example:memory.body[2].text, limitations:memory.body[3].text } }
  );
  for(const person of theorists) {
    const article=articles.find(a=>a.slug===person.articleSlugs[0])!;
    const context=article.body.find(s=>s.heading===person.section)!.text;
    catalog.push({id:`person:${person.slug}`,slug:person.slug,kind:"THEORIST",title:person.name,summary:`Konteks ${person.name} dalam bacaan ${article.title.toLowerCase()}.`,domains:[article.domainSlug],keywords:person.name,source:true,content:{context,contributions:context,limitations:"Biografi, tanggal hidup, karya utama, dan atribusi rinci belum diverifikasi. Tidak tersedia potret berlisensi."}});
  }
  for (const e of catalog) {
    const { domains:members, source, ...data }=e;
    const status = e.kind === "DOMAIN" && !catalog.some(x=>x.kind!=="DOMAIN" && x.domains.includes(e.slug)) ? "PLANNED" : "DRAFT";
    const created = await tx.knowledgeEntity.upsert({where:{id:e.id},create:{...data,content:contentSchema.parse(e.content),status,isDemoSeed:true,authorLabel:"Seed editorial SI JANI — belum ditinjau",domains:{create:members.map(domainSlug=>({domainSlug}))},citations:source ? {create:{sourceId:"openstax",section:"all",locator:"Pemetaan bagian belum diverifikasi"}} : undefined,revisions:{create:{number:1,snapshot:{...data,status,domainSlugs:members}}}},update:{}});
    if(created.revision!==1 || created.lastEditorId) continue;
    if(e.kind!=="DOMAIN") for(const domain of members) await tx.knowledgeRelation.upsert({where:{id:`membership:${e.id}:${domain}`},create:{isDemoSeed:true,id:`membership:${e.id}:${domain}`,fromId:e.id,toId:`domain:${domain}`,type:"BELONGS_TO_DOMAIN",explanation:"Pengelompokan editorial untuk navigasi; bukan klaim hubungan kausal."},update:{}});
  }
  const relations = [
    ["theory:classical","person:ivan-pavlov","DEVELOPED_BY","Konteks historis Pavlov dalam draf pengondisian klasik."],
    ["theory:operant","person:bf-skinner","DEVELOPED_BY","Konteks Skinner dalam draf pengondisian operan."],
    ["theory:classical","theory:operant","CONTRASTS_WITH",classical.body[3].text],
    ["theory:operant","concept:reinforcement","ASSOCIATED_WITH",operant.body[1].text],
    ["theory:classical","concept:extinction","RELATED_TO","Ekstingsi direncanakan sebagai konsep terkait; pemetaan prosedur masih memerlukan tinjauan."],
    ["theory:operant","concept:extinction","RELATED_TO","Ekstingsi juga dibahas dalam konteks konsekuensi; perbedaan prosedur perlu ditinjau."],
    ["theory:working-memory","concept:working-memory","ASSOCIATED_WITH",memory.body[0].text],
    ["theory:working-memory","person:alan-baddeley","DEVELOPED_BY",memory.body[1].text],
    ["theory:working-memory","person:graham-hitch","DEVELOPED_BY",memory.body[1].text]
  ] as const;
  const seedRelationIds = [...catalog.filter(e=>e.kind!=="DOMAIN").flatMap(e=>e.domains.map(d=>`membership:${e.id}:${d}`)),...relations.map(([from,to])=>`seed:${from}:${to}`)];
  await tx.knowledgeRelation.updateMany({where:{id:{in:seedRelationIds},from:{isDemoSeed:true},to:{isDemoSeed:true}},data:{isDemoSeed:true}});
  for(const [fromId,toId,type,explanation] of relations) { const id=`seed:${fromId}:${toId}`; await tx.knowledgeRelation.upsert({where:{id},create:{isDemoSeed:true,id,fromId,toId,type,explanation,sourceId:"openstax",locator:"Pemetaan bagian belum diverifikasi"},update:{}}); }
}
