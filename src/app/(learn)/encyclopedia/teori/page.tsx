import { knowledgeCatalog } from "@/lib/knowledge";
import { KnowledgeTabs, KnowledgeCard } from "@/components/knowledge-common";
import { PageHeading, EmptyState } from "@/components/common";
export default async function Page() { const entries=await knowledgeCatalog("THEORY");return <><PageHeading eyebrow="ENCYCLOPEDIA" title="Teori psikologi" description="Kenali mekanisme, asumsi, dan batas penjelasan. Draf tidak setara dengan materi terverifikasi."/><KnowledgeTabs active="/encyclopedia/teori"/>{entries.length?<div className="knowledge-grid">{entries.map(entity=><KnowledgeCard key={entity.id} entity={entity}/>)}</div>:<EmptyState title="Materi sedang direncanakan">Belum ada entri yang tersedia untuk dibaca.</EmptyState>}</>; }
