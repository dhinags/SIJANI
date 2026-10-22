"use client";
import { createContext, useContext, useState } from "react";
import { Moon, Sun } from "lucide-react";
type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: "light", toggle: () => {} });
export function ThemeProvider({ initial, children }: { initial: Theme; children: React.ReactNode }) {
  const [theme, setTheme] = useState(initial);
  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    document.cookie = `sijani_theme=${next}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    setTheme(next);
  }
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}
export function ThemeToggle() {
  const { theme, toggle } = useContext(ThemeContext);
  return <button type="button" className="icon-button" onClick={toggle} aria-label={theme === "light" ? "Gunakan mode gelap" : "Gunakan mode terang"} title={theme === "light" ? "Mode gelap" : "Mode terang"}>{theme === "light" ? <Moon size={19} /> : <Sun size={19} />}</button>;
}
