import Link from "@/components/safe-link";
import {notFound} from "next/navigation";
import {db} from "@/lib/db";
import {currentUser} from "@/lib/auth";
import {visibleCase} from "@/lib/lab";
import {caseContentSchema} from "@/lib/lab-model";
import {LabTabs,CaseContext} from "@/components/lab-common";
import {StartAnalysis} from "@/components/lab-actions";
import {PageHeading} from "@/components/common";
export default async function LabCase({params}:{params:Promise<{slug:string}>}){const{slug}=await params;const[user,c]=await Promise.all([currentUser(),db.caseScenario.findFirst({where:{AND:[{slug},visibleCase()]},include:{references:{include:{source:true}},_count:{select:{questions:true}}}})]);if(!c)notFound();const version=await db.caseVersion.findUnique({where:{caseSlug_number:{caseSlug:slug,number:c.version}}});if(!version)notFound();return <><PageHeading eyebrow="PERPUSTAKAAN KASUS / SIMULASI PENDIDIKAN" title={c.title} description={c.description}/><LabTabs/><div className="lab-workspace"><section className="surface"><CaseContext content={caseContentSchema.parse(version.content)} version={c.version}/></section><aside className="surface lab-pathways"><h2>Pilih jalur latihan</h2><p>Gunakan tulisan untuk mengeksplorasi ambiguitas; gunakan latihan terstruktur untuk memeriksa penalaran berdasarkan asumsi yang diberikan.</p>{user?<StartAnalysis caseSlug={slug}/>:<Link className="button button-primary" href="/masuk">Masuk untuk menyimpan analisis</Link>}{c._count.questions>0&&<Link className="button button-secondary" href={`/simulasi/${slug}`}>Latihan interaktif · lima format</Link>}<Link href={`/laboratorium/riwayat?case=${slug}`}>Riwayat saya untuk kasus ini</Link><h3>Rujukan yang perlu diperiksa</h3>{c.references.map(r=><section key={r.sourceId}><h4><Link href={`/blok/etik-hukum/referensi/${r.sourceId}`}>{r.source.title}</Link></h4><p>{r.source.jurisdiction} · {r.source.version}</p><p>{r.note}</p></section>)}</aside></div></>;}
