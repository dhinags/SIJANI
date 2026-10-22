import Link from "@/components/safe-link";
import { Brain } from "lucide-react";
export function Brand({ light = false, href = "/" }: { light?: boolean; href?: string }) {
  return <Link href={href} className={`brand ${light ? "brand-light" : ""}`} aria-label="SI JANI — Beranda"><span className="brand-symbol"><Brain size={25} strokeWidth={1.6} /></span><span className="brand-wordmark"><strong>SI JANI<span className="gold-dot">.</span></strong><small>PSIKOLOGI UNJANI ENCYCLOPEDIA</small></span></Link>;
}
