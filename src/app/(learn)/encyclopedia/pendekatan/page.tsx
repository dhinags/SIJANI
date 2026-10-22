import { knowledgeCatalog } from "@/lib/knowledge";
import { KnowledgeTabs, KnowledgeCard } from "@/components/knowledge-common";
import { PageHeading, EmptyState } from "@/components/common";
export default async function Page() { const entries=await knowledgeCatalog("APPROACH");return <><PageHeading eyebrow="ENCYCLOPEDIA" title="Pendekatan psikologi" description="Kerangka pendekatan disiapkan untuk kurasi berikutnya. Entri hanya ditampilkan bila sudah tersedia."/><KnowledgeTabs active="/encyclopedia/pendekatan"/>{entries.length?<div className="knowledge-grid">{entries.map(entity=><KnowledgeCard key={entity.id} entity={entity}/>)}</div>:<EmptyState title="Materi sedang direncanakan">Belum ada entri yang tersedia untuk dibaca.</EmptyState>}</>; }
