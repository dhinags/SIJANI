import { KnowledgeArticle } from "@/components/knowledge-article";
export default async function Page({params}:{params:Promise<{slug:string}>}) { const {slug}=await params; return <KnowledgeArticle slug={slug} kind="CONCEPT"/>; }
