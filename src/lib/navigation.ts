export type Crumb = { label: string; href?: string };
const labels: Record<string, string> = {
  laboratorium: "Laboratorium", kasus: "Kasus", riwayat: "Riwayat analisis", review: "Tinjauan kasus", beranda: "Beranda", tujuan: "Gerbang belajar", identitas: "Profil awal", encyclopedia: "Encyclopedia", "knowledge-map": "Knowledge Map",
  "learning-path": "Learning Path", blok: "Blok Pembelajaran", "etik-hukum": "Kode Etik dan Hukum", progress: "Progress Belajar",
  profil: "Profil", referensi: "Referensi", dosen: "Ruang Dosen", tips: "Tips Analisis Kasus", analisis: "Analisis Kasus",
  domain: "Domain", konsep: "Konsep", pendekatan: "Pendekatan", bandingkan: "Bandingkan teori", tersimpan: "Bacaan saya", editorial: "Ruang editorial", materi: "Materi Etika dan Hukum", teori: "Teori", tokoh: "Tokoh", "ivan-pavlov": "Ivan Pavlov", "bf-skinner": "B. F. Skinner",
  "alan-baddeley": "Alan Baddeley", "graham-hitch": "Graham Hitch", "jean-piaget": "Jean Piaget", "erik-erikson": "Erik Erikson"
};
export function breadcrumbs(pathname: string): Crumb[] {
  if (pathname === "/beranda") return [{ label: "Beranda" }];
  const parts = pathname.split("/").filter(Boolean);
  const prefix: Crumb[] = [{ label: "Beranda", href: "/beranda" }];
  if (["simulasi", "analisis", "tips", "laboratorium"].includes(parts[0])) {
    prefix.push({ label: "Blok Pembelajaran", href: "/blok" }, { label: "Kode Etik dan Hukum", href: "/blok/etik-hukum" });
    return [...prefix, { label: parts[0] === "simulasi" ? "Latihan kasus" : labels[parts[0]] }];
  }
  return [...prefix, ...parts.map((part, i) => ({
    label: labels[part] ?? part.replaceAll("-", " ").replace(/^./, c => c.toUpperCase()),
    ...(i < parts.length - 1 ? { href: "/" + parts.slice(0, i + 1).join("/") } : {})
  }))];
}
export function activeDestination(pathname: string, href: string) {
  if (href === "/beranda") return ["/beranda", "/tujuan"].includes(pathname);
  if (href === "/blok" && ["/simulasi/", "/analisis", "/tips", "/laboratorium"].some(p => pathname.startsWith(p))) return true;
  if (href === "/profil" && pathname === "/identitas") return true;
  return pathname === href || pathname.startsWith(href + "/");
}
export function initials(name: string) { return name.trim().split(/\s+/).slice(0, 2).map(part => Array.from(part)[0] ?? "").join("").toUpperCase() || "P"; }
