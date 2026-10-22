import { describe, expect, it, vi, afterEach } from "vitest";
import { breadcrumbs, activeDestination, initials } from "../../src/lib/navigation";
import { safeEncyclopediaReturn } from "../../src/lib/encyclopedia";
import { requestJson } from "../../src/lib/client";
afterEach(() => vi.unstubAllGlobals());
describe("learning navigation", () => {
  it("keeps a case inside the correct module ancestry", () => {
    expect(breadcrumbs("/simulasi/kerahasiaan-dalam-supervisi")).toEqual([
      { label: "Beranda", href: "/beranda" }, { label: "Blok Pembelajaran", href: "/blok" },
      { label: "Kode Etik dan Hukum", href: "/blok/etik-hukum" }, { label: "Latihan kasus" }
    ]);
    expect(activeDestination("/analisis", "/blok")).toBe(true);
    expect(activeDestination("/encyclopedia/tokoh/ivan-pavlov", "/encyclopedia")).toBe(true);
    expect(activeDestination("/blokade", "/blok")).toBe(false);
  });
  it("preserves local search context without allowing external return destinations", () => {
    expect(safeEncyclopediaReturn("/encyclopedia?q=memori&domain=kognitif")).toBe("/encyclopedia?q=memori&domain=kognitif");
    for (const target of ["https://example.com", "//example.com/encyclopedia", "javascript:alert(1)", "/api/session", "/encyclopedia/../profil"]) expect(safeEncyclopediaReturn(target)).toBe("/encyclopedia");
    expect(safeEncyclopediaReturn("/encyclopedia?q=belajar&ignored=secret")).toBe("/encyclopedia?q=belajar");
  });
  it("uses readable initials for aliases without requiring an identity", () => {
    expect(initials("  Pelajar Uji  ")).toBe("PU");
    expect(initials("Rani")).toBe("R");
    expect(initials(" ")).toBe("P");
  });
});
describe("honest persistence feedback", () => {
  it("explains a network failure without claiming the save succeeded", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(requestJson("/api/progress", "POST")).rejects.toThrow("belum dikonfirmasi tersimpan");
  });
  it("explains session expiry while leaving work in place", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 401, ok: false }));
    await expect(requestJson("/api/progress", "POST")).rejects.toThrow("Sesi berakhir");
  });
  it("does not treat a malformed upstream response as a save acknowledgement", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 502, ok: false, json: async () => { throw new SyntaxError(); } }));
    await expect(requestJson("/api/progress", "POST")).rejects.toThrow("belum mengonfirmasi penyimpanan");
  });
});
