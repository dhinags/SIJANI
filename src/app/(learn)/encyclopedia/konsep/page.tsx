import { knowledgeCatalog } from "@/lib/knowledge";
import { KnowledgeTabs, KnowledgeCard } from "@/components/knowledge-common";
import { PageHeading, EmptyState } from "@/components/common";
export default async function Page() { const entries=await knowledgeCatalog("CONCEPT");return <><PageHeading eyebrow="ENCYCLOPEDIA" title="Konsep psikologi" description="Satu konsep dapat terhubung dengan beberapa domain. Telusuri definisi, contoh, dan batas penggunaannya."/><KnowledgeTabs active="/encyclopedia/konsep"/>{entries.length?<div className="knowledge-grid">{entries.map(entity=><KnowledgeCard key={entity.id} entity={entity}/>)}</div>:<EmptyState title="Materi sedang direncanakan">Belum ada entri yang tersedia untuk dibaca.</EmptyState>}</>; }
