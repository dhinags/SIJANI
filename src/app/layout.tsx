import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ThemeProvider } from "@/components/theme";
import { NavigationGuard } from "@/components/navigation-guard";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@xyflow/react/dist/style.css";
import "./globals.css";
import "./experience.css";
import "./knowledge.css";
import "./lab.css";
export const metadata: Metadata = { title: { default: "SI JANI — Psikologi UNJANI Encyclopedia", template: "%s · SI JANI" }, description: "Jelajahi pengetahuan psikologi, latih penalaran profesional, dan kembangkan cara berpikir berbasis bukti.", robots: { index: false, follow: false } };
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = (await cookies()).get("sijani_theme")?.value === "dark" ? "dark" : "light";
  return <html lang="id" data-theme={theme} data-scroll-behavior="smooth"><body><a href="#main-content" className="skip-link">Lewati ke konten utama</a><ThemeProvider initial={theme}><NavigationGuard>{children}</NavigationGuard></ThemeProvider></body></html>;
}
