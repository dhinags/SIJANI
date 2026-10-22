// Navigation metadata for names already present in the six editorial seed articles.
// These associations inherit the articles' draft status; no reviewed biography is claimed.
export const theorists = [
  { slug: "ivan-pavlov", name: "Ivan Pavlov", articleSlugs: ["pengondisian-klasik"], section: "Konteks historis" },
  { slug: "bf-skinner", name: "B. F. Skinner", articleSlugs: ["pengondisian-operan"], section: "Perilaku dan konsekuensinya" },
  { slug: "alan-baddeley", name: "Alan Baddeley", articleSlugs: ["memori-kerja"], section: "Tokoh dan perkembangan teori" },
  { slug: "graham-hitch", name: "Graham Hitch", articleSlugs: ["memori-kerja"], section: "Tokoh dan perkembangan teori" },
  { slug: "jean-piaget", name: "Jean Piaget", articleSlugs: ["perkembangan-sepanjang-hayat"], section: "Membaca teori secara kritis" },
  { slug: "erik-erikson", name: "Erik Erikson", articleSlugs: ["perkembangan-sepanjang-hayat"], section: "Membaca teori secara kritis" }
];
export function encyclopediaUrl(q: string, domain: string) {
  const params = new URLSearchParams();
  if (q) params.set("q", q); if (domain) params.set("domain", domain);
  return `/encyclopedia${params.size ? `?${params}` : ""}`;
}
export function safeEncyclopediaReturn(value?: string) {
  if (!value) return "/encyclopedia";
  try {
    const url = new URL(value, "https://sijani.invalid");
    if (url.origin !== "https://sijani.invalid" || url.pathname !== "/encyclopedia") return "/encyclopedia";
    return encyclopediaUrl((url.searchParams.get("q") ?? "").slice(0, 100), (url.searchParams.get("domain") ?? "").slice(0, 100));
  } catch { return "/encyclopedia"; }
}
