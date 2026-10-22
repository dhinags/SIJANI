import { knowledgeCatalog } from "@/lib/knowledge";
import { KnowledgeTabs, KnowledgeCard } from "@/components/knowledge-common";
import { PageHeading, EmptyState } from "@/components/common";
export default async function Page() { const entries=await knowledgeCatalog("THEORIST");return <><PageHeading eyebrow="ENCYCLOPEDIA" title="Tokoh & jejak gagasan" description="Konteks kontribusi berdasarkan materi tersimpan. Data biografis yang belum didukung sumber tetap kosong."/><KnowledgeTabs active="/encyclopedia/tokoh"/>{entries.length?<div className="knowledge-grid">{entries.map(entity=><KnowledgeCard key={entity.id} entity={entity}/>)}</div>:<EmptyState title="Materi sedang direncanakan">Belum ada entri yang tersedia untuk dibaca.</EmptyState>}</>; }
