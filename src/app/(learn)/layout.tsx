import { cookies } from "next/headers";
import { AppShell } from "@/components/navigation";
import { currentUser, demoEnabled } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  const [user, jar] = await Promise.all([currentUser(), cookies()]);
  return <AppShell profile={user ? { displayName: user.profile?.displayName ?? "Pelajar demo", staff: user.role !== "STUDENT", editorial: user.role === "EDITOR" || user.role === "REVIEWER" } : null} initialCollapsed={jar.get("sijani_sidebar")?.value === "collapsed"} demo={demoEnabled()}>{children}</AppShell>;
}
