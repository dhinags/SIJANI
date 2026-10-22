"use client";
import Link from "./safe-link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BookOpen, ChartNoAxesCombined, ChevronDown, ChevronRight, Compass, GraduationCap, House, Library, Map, Menu, PanelLeftClose, PanelLeftOpen, Route, ShieldCheck, UserRound, X } from "lucide-react";
import { Brand } from "./brand";
import { ThemeToggle } from "./theme";
import { LogoutButton } from "./account-forms";
import { activeDestination, breadcrumbs, initials } from "@/lib/navigation";
const destinations = [
  { href: "/beranda", label: "Beranda", icon: House },
  { href: "/encyclopedia", label: "Encyclopedia", icon: BookOpen },
  { href: "/knowledge-map", label: "Knowledge Map", icon: Map },
  { href: "/learning-path", label: "Learning Path", icon: Route },
  { href: "/blok", label: "Blok Pembelajaran", icon: GraduationCap },
  { href: "/progress", label: "Progress Belajar", icon: ChartNoAxesCombined },
  { href: "/referensi", label: "Referensi", icon: Library },
  { href: "/profil", label: "Profil", icon: UserRound }
];
type Profile = { displayName: string; staff: boolean; editorial?: boolean } | null;
export function AppShell({ profile, initialCollapsed, demo, children }: { profile: Profile; initialCollapsed: boolean; demo: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [open, setOpen] = useState(false);
  const drawer = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const profileMenu = useRef<HTMLDetailsElement>(null);
  const crumbs = breadcrumbs(pathname);
  function closeDrawer() { drawer.current?.close(); }
  function trapDrawerFocus(event: React.KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), [tabindex="0"]')).filter(el => el.getClientRects().length);
    const first = items[0]; const last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
  function toggleSidebar() {
    setCollapsed(!collapsed);
    document.cookie = `sijani_sidebar=${collapsed ? "expanded" : "collapsed"}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const resize = () => { if (media.matches) drawer.current?.close(); };
    media.addEventListener("change", resize);
    return () => media.removeEventListener("change", resize);
  }, []);
  useEffect(() => {
    const outside = (e: PointerEvent) => { if (profileMenu.current && !profileMenu.current.contains(e.target as Node)) profileMenu.current.open = false; };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  function navLinks(mobile = false) {
    return <nav aria-label="Navigasi utama">{[...destinations, ...(profile?.staff ? [{ href: profile.editorial ? "/editorial" : "/dosen", label: profile.editorial ? "Ruang Editorial" : "Ruang Dosen", icon: ShieldCheck }] : [])].map(({ href, label, icon: Icon }) => {
      const active = activeDestination(pathname, href);
      return <Link href={href} key={href} className={`nav-link ${active ? "active" : ""}`} aria-label={label} aria-current={active ? "page" : undefined} title={collapsed && !mobile ? label : undefined} onNavigate={mobile ? closeDrawer : undefined}><Icon size={20} strokeWidth={1.7} /><span className="nav-label">{label}</span>{href === "/blok" && <span className="nav-count">01</span>}</Link>;
    })}</nav>;
  }
  return <div className={`app-shell ${collapsed ? "shell-collapsed" : ""}`}>
    <aside className="sidebar" aria-label="Panel navigasi desktop"><div className="desktop-brand"><Brand href="/beranda" /></div><p className="nav-caption">RUANG BELAJAR</p>{navLinks()}<div className="sidebar-bottom"><Compass size={24} /><strong>Belajar dengan arah.</strong><p>Satu konsep, satu langkah maju.</p><Link href="/tips">Tips Analisis Kasus <ChevronRight size={15} /></Link></div><button className="sidebar-collapse" onClick={toggleSidebar} aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"} aria-expanded={!collapsed}>{collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}<span>Ciutkan navigasi</span></button></aside>
    <div className="app-body">
      <header className="shell-topbar"><div className="shell-location"><button ref={trigger} className="icon-button drawer-trigger" aria-label="Buka navigasi" aria-expanded={open} aria-controls="navigation-drawer" onClick={() => { drawer.current?.showModal(); setOpen(true); }}><Menu size={21} /></button><div className="mobile-brand"><Brand href="/beranda" /></div><nav className="breadcrumbs" aria-label="Jejak navigasi"><ol>{crumbs.map((crumb, i) => <li key={`${crumb.label}-${i}`}>{i > 0 && <ChevronRight size={13} aria-hidden />}{crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}</li>)}</ol></nav></div>
        <div className="topbar-actions"><ThemeToggle /><JaniGuide key={pathname} pathname={pathname} />{profile ? <details ref={profileMenu} className="profile-menu" onKeyDown={e => { if (e.key === "Escape") { e.currentTarget.open = false; e.currentTarget.querySelector("summary")?.focus(); } }}><summary aria-label="Menu profil"><span className="avatar">{initials(profile.displayName)}</span><span className="profile-menu-name">{profile.displayName}</span><ChevronDown size={14} /></summary><div className="profile-popover"><strong>{profile.displayName}</strong><p>Profil praktik pribadi</p><Link href="/profil" onNavigate={() => { if (profileMenu.current) profileMenu.current.open = false; }}>Atur profil</Link><Link href="/progress" onNavigate={() => { if (profileMenu.current) profileMenu.current.open = false; }}>Lihat progres</Link><LogoutButton compact /></div></details> : <Link href="/masuk" className="button button-primary button-sm">Masuk<span className="sr-only"> untuk menyimpan progres</span></Link>}</div>
      </header>
      <nav className="mobile-breadcrumbs breadcrumbs" aria-label="Jejak navigasi seluler"><ol>{crumbs.map((crumb, i) => <li key={`${crumb.label}-${i}`}>{i > 0 && <ChevronRight size={12} aria-hidden />}{crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}</li>)}</ol></nav>
      {demo && <div className="demo-strip"><span className="demo-label">MODE DEMO</span><span>Profil praktik pribadi · gunakan nama samaran dan kasus sintetis.</span></div>}
      <main id="main-content" className="workspace-content"><div className="page-transition" key={pathname}>{children}</div></main>
      <footer className="app-footer"><span>SI JANI · Belajar. Bernalar. Bertanggung jawab.</span><span>Ruang belajar percontohan · v0.3</span></footer>
    </div>
    <dialog ref={drawer} id="navigation-drawer" className="navigation-drawer" aria-labelledby="drawer-title" onKeyDown={trapDrawerFocus} onClose={() => { setOpen(false); trigger.current?.focus(); }} onClick={e => { if (e.target === drawer.current) closeDrawer(); }}>
      <div className="drawer-content"><header><h2 id="drawer-title">Ruang belajar</h2><button className="icon-button" onClick={closeDrawer} aria-label="Tutup navigasi" autoFocus><X size={21} /></button></header><p>Pilih arah belajarmu.</p>{navLinks(true)}<Link className="drawer-profile" href={profile ? "/profil" : "/masuk"} onNavigate={closeDrawer}><span className="avatar">{profile ? initials(profile.displayName) : <UserRound size={19} />}</span>{profile?.displayName ?? "Masuk ke mode demo"}</Link></div>
    </dialog>
  </div>;
}
function JaniGuide({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false); const close = useRef<HTMLButtonElement>(null); const button = useRef<HTMLButtonElement>(null);
  const guide = pathname.startsWith("/simulasi") ? { title: "Baca, timbang, lalu simpan.", text: "Pisahkan fakta dari asumsi. Gunakan Simpan & lanjut untuk menyimpan jawaban; setelah mengirim, tinjau alasan di setiap umpan balik.", href: "/tips", label: "Lihat panduan analisis" }
    : pathname === "/analisis" ? { title: "Alasanmu lebih berarti dari angka.", text: "Lengkapi sebelas dimensi dan pilih tingkat berdasarkan bukti dalam tulisanmu. Ini penilaian diri; simpan setelah semua dimensi terisi.", href: "/tips", label: "Pahami indikator rubrik" }
    : pathname.startsWith("/encyclopedia") || pathname === "/knowledge-map" ? { title: "Mulai dari rasa ingin tahu.", text: "Pilih domain atau cari konsep. Baca hubungan antargagasan dan status sumber, lalu tandai bacaan yang sudah dipelajari. Label draf berarti materi masih perlu ditinjau.", href: "/knowledge-map", label: "Hubungkan konsep di peta" }
    : pathname === "/progress" ? { title: "Beri ruang untuk meninjau.", text: "Buka draf untuk melanjutkan atau hasil latihan untuk membaca penjelasan. Catatan aktivitas dan skor formatif tidak menyatakan kompetensi profesional.", href: "/blok/etik-hukum", label: "Kembali ke Blok 1" }
    : { title: "Satu langkah belajar hari ini.", text: "Jelajahi Encyclopedia untuk membangun landasan, atau buka Blok 1 untuk melatih penalaran. Anda dapat berpindah tujuan kapan saja.", href: "/learning-path", label: "Ikuti Learning Path" };
  useEffect(() => { if (open) close.current?.focus(); }, [open]);
  function dismiss() { setOpen(false); button.current?.focus(); }
  return <div className="jani-guide" onKeyDown={e => { if (e.key === "Escape") dismiss(); }}>{open && <section id="jani-panel" className="jani-panel" aria-label="Panduan JANI"><header><span className="eyebrow">JANI · PANDUAN KONTEKSTUAL</span><button ref={close} className="icon-button" aria-label="Tutup panduan JANI" onClick={dismiss}><X size={18} /></button></header><h2>{guide.title}</h2><p>{guide.text}</p><Link href={guide.href} className="text-link">{guide.label} <ChevronRight size={16} /></Link><small>Panduan tetap sesuai halaman, bukan percakapan AI.</small></section>}<button ref={button} aria-label="Panduan JANI" className="jani-trigger" aria-controls="jani-panel" aria-expanded={open} onClick={() => open ? dismiss() : setOpen(true)}><Compass size={20} /><span>Panduan JANI</span></button></div>;
}
