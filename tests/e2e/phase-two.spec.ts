import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createHash } from "node:crypto";
import { mkdirSync } from "node:fs";
import { questions } from "../../prisma/content";
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const origin = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const headers = { origin };
const createdUsers = new Set<string>();
const caseSlug = "kerahasiaan-dalam-supervisi";
async function login(context: BrowserContext) {
  expect((await context.request.post(`${origin}/api/demo`, { headers })).ok()).toBe(true);
  const cookie = (await context.cookies()).find(c => c.name === "sijani_session")!;
  const session = await db.session.findUniqueOrThrow({ where: { tokenHash: createHash("sha256").update(cookie.value).digest("hex") } });
  createdUsers.add(session.userId);
  expect((await context.request.patch(`${origin}/api/profile`, { headers, data: { displayName: "Pelajar Fase Dua", preference: "bertahap", onboardingDone: true } })).ok()).toBe(true);
  return session.userId;
}
async function start(context: BrowserContext) {
  const result = await context.request.post(`${origin}/api/attempts`, { headers, data: { caseSlug } });
  expect(result.ok()).toBe(true); return result.json();
}
async function accessible(page: Page) {
  await expect(page.locator("h1").first()).toBeVisible();
  await expect(page.locator(".skeleton-page")).toHaveCount(0);
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(result.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}
test.afterAll(async () => { await db.user.deleteMany({ where: { id: { in: [...createdUsers] }, isDemo: true } }); await db.$disconnect(); });

test("gateway and profile use saved progress and resume the owned draft", async ({ page, context }) => {
  await login(context);
  expect((await context.request.post(`${origin}/api/progress`, { headers, data: { articleSlug: "memori-kerja" } })).ok()).toBe(true);
  const attempt = await start(context);
  await page.goto("/masuk"); await expect(page).toHaveURL(/\/beranda$/);
  await expect(page.getByRole("heading", { name: "Selamat Datang di SI JANI" })).toBeVisible();
  await expect(page.locator(".gateway-greeting")).toContainText("Pelajar Fase Dua");
  await expect(page.getByRole("progressbar", { name: "Progres bacaan Encyclopedia" })).toHaveAttribute("value", "1");
  await expect(page.locator(".recent-list")).toContainText("Memori kerja");
  await page.getByRole("link", { name: "Lanjutkan latihan tersimpan", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`attempt=${attempt.id}`));
  await page.goto("/profil");
  await expect(page.locator(".profile-overview .avatar")).toHaveText("PF");
  await expect(page.locator(".profile-stats")).toContainText("1 bacaan dipelajari");
  await page.goto("/identitas"); await expect(page).toHaveURL(/\/beranda$/);
  await expect(page.locator(".future-module")).toContainText("Coming Soon");
  await expect(page.locator(".future-module a")).toHaveCount(0);
});

test("desktop sidebar, profile disclosure, breadcrumbs, and JANI work with keyboard", async ({ page, context }) => {
  await login(context); await page.setViewportSize({ width: 1440, height: 1000 }); await page.goto("/beranda");
  await page.getByRole("button", { name: "Ciutkan sidebar" }).click();
  await expect(page.locator(".app-shell")).toHaveClass(/shell-collapsed/);
  await page.reload(); await expect(page.getByRole("button", { name: "Perluas sidebar" })).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("navigation", { name: "Navigasi utama", exact: true }).getByRole("link", { name: "Blok Pembelajaran", exact: true }).click();
  await expect(page.getByRole("navigation", { name: "Navigasi utama", exact: true }).getByRole("link", { name: "Blok Pembelajaran", exact: true })).toHaveAttribute("aria-current", "page");
  await page.goto("/blok/etik-hukum/materi");
  await expect(page.getByRole("navigation", { name: "Jejak navigasi", exact: true })).toContainText("Blok PembelajaranKode Etik dan HukumMateri Etika dan Hukum");
  await page.locator(".profile-menu summary").focus(); await page.keyboard.press("Enter");
  await expect(page.getByRole("link", { name: "Atur profil" })).toBeVisible();
  await page.keyboard.press("Escape"); await expect(page.locator(".profile-menu summary")).toBeFocused();
  await expect(page.getByRole("link", { name: "Atur profil" })).not.toBeVisible();
  await page.goto("/tips"); await expect(page.locator(".sidebar .nav-link.active")).toHaveAccessibleName("Blok Pembelajaran");
  await page.getByRole("button", { name: "Panduan JANI", exact: true }).click();
  await expect(page.getByRole("button", { name: "Tutup panduan JANI" })).toBeFocused();
  await expect(page.getByRole("region", { name: "Panduan JANI" })).toContainText("bukan percakapan AI");
  await page.keyboard.press("Escape"); await expect(page.getByRole("button", { name: "Panduan JANI", exact: true })).toBeFocused();
});

test("mobile drawer traps focus, closes with Escape and route selection, and restores focus", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 }); await page.goto("/encyclopedia");
  const trigger = page.getByRole("button", { name: "Buka navigasi" });
  await trigger.click(); const drawer = page.getByRole("dialog", { name: "Ruang belajar" });
  await expect(drawer).toBeVisible();
  await expect(page.getByRole("button", { name: "Tutup navigasi" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  expect(await drawer.evaluate(el => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Tab"); await expect(page.getByRole("button", { name: "Tutup navigasi" })).toBeFocused();
  await accessible(page);
  await page.keyboard.press("Escape"); await expect(trigger).toBeFocused();
  await trigger.click();
  await drawer.getByRole("link", { name: "Blok Pembelajaran", exact: true }).click();
  await expect(page).toHaveURL(/\/blok$/); await expect(drawer).not.toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("article return preserves filters and real theory/theorist routes expose source status", async ({ page }) => {
  await page.goto("/encyclopedia?q=klasik&domain=behaviorisme");
  await page.locator(".article-card").click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Pengondisian klasik");
  await page.locator(".back-link").click();
  await expect(page.getByLabel("Cari konsep")).toHaveValue("klasik");
  await expect(page.getByLabel("Filter domain")).toHaveValue("behaviorisme");
  await page.locator(".article-card").click(); await page.getByRole("link", { name: "Ivan Pavlov" }).click();
  await expect(page).toHaveURL(/\/encyclopedia\/tokoh\/ivan-pavlov$/);
  await expect(page.locator(".theorist-context")).toContainText("Penelitian Ivan Pavlov");
  await expect(page.locator(".citation")).toContainText("MENUNGGU VERIFIKASI");
  await page.goto("/encyclopedia/teori"); await expect(page.locator(".knowledge-card")).toHaveCount(3);
  await page.getByRole("navigation", { name: "Jelajahi Encyclopedia" }).getByRole("link", { name: "Tokoh", exact: true }).click();
  await expect(page.locator(".theorist-card")).toHaveCount(6);
  await page.goto("/encyclopedia"); await page.getByText("Jelajahi semua 12 domain", { exact: true }).click();
  await expect(page.locator(".domain-explorer-grid a")).toHaveCount(12);
  await page.locator(".domain-explorer-grid a").filter({ hasText: "Psikologi Klinis" }).click();
  await expect(page.getByRole("heading", { name: "Materi sedang direncanakan" })).toBeVisible();
});

test("unsaved answers survive failed saves, navigation cancellation, and session expiry", async ({ page, context }) => {
  const userId = await login(context); const attempt = await start(context);
  await page.goto(`/simulasi/${caseSlug}?attempt=${attempt.id}`);
  await page.locator('input[value="clarify"]').check();
  page.once("dialog", d => d.dismiss());
  await page.locator(".back-link").click(); await expect(page).toHaveURL(new RegExp(attempt.id));
  await expect(page.locator('input[value="clarify"]')).toBeChecked();
  await page.route(`**/api/attempts/${attempt.id}`, route => route.abort("failed"));
  await page.getByRole("button", { name: "Simpan draf", exact: true }).click();
  await expect(page.locator(".simulation-player").getByRole("alert")).toContainText("Koneksi terputus");
  await expect(page.getByRole("status")).not.toContainText("Draf tersimpan");
  await expect(page.locator('input[value="clarify"]')).toBeChecked();
  await page.unroute(`**/api/attempts/${attempt.id}`);
  await page.getByRole("button", { name: "Simpan draf", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Draf tersimpan");
  await page.locator('input[value="share"]').check();
  await db.session.updateMany({ where: { userId }, data: { expiresAt: new Date(0) } });
  await page.getByRole("button", { name: "Simpan draf", exact: true }).click();
  await expect(page.locator(".simulation-player").getByRole("alert")).toContainText("Sesi berakhir");
  await expect(page.locator('input[value="share"]')).toBeChecked();
  const saved = await db.simulationAttempt.findUniqueOrThrow({ where: { id: attempt.id } });
  expect(saved.answers).toEqual({ "langkah-awal": "clarify" });
});

test("submitted answer review uses server history rather than an older in-memory edit", async ({ page, context }) => {
  await login(context); const attempt = await start(context);
  await page.goto(`/simulasi/${caseSlug}?attempt=${attempt.id}`);
  await page.locator('input[value="share"]').check();
  page.once("dialog", d => d.accept()); await page.locator(".back-link").click();
  await expect(page).toHaveURL(/\/blok\/etik-hukum$/);
  const answers = Object.fromEntries(questions.map(q => [q.id, q.correct]));
  expect((await context.request.post(`${origin}/api/attempts/${attempt.id}`, { headers, data: { revision: attempt.revision, answers } })).ok()).toBe(true);
  await page.getByRole("navigation", { name: "Navigasi utama", exact: true }).getByRole("link", { name: "Progress Belajar", exact: true }).click();
  await page.locator(".history-row").click();
  await page.locator(".feedback-list summary").first().click();
  await expect(page.locator(".answer-review").first().locator("dd").first()).toContainText("Tunda pembagian");
  await expect(page.locator(".score-display")).toContainText("100");
});

test("browser back restores a partial self-review in memory without claiming server persistence", async ({ page, context }) => {
  const userId = await login(context); await page.goto("/analisis");
  const text = "Fakta belum lengkap; klarifikasi persetujuan sebelum membagikan informasi.";
  await page.locator("textarea").first().fill(text);
  page.once("dialog", d => d.accept());
  await page.getByRole("link", { name: "Buka Tips Analisis Kasus", exact: true }).click();
  await expect(page).toHaveURL(/\/tips$/); await page.goBack();
  await expect(page).toHaveURL(/\/analisis$/); await expect(page.locator("textarea").first()).toHaveValue(text);
  await expect(page.locator(".reflection-progress")).toContainText("belum tersimpan di server");
  expect(await db.rubricAssessment.count({ where: { userId } })).toBe(0);
});

for (const width of [360, 390, 768, 1024, 1440]) {
  test(`light/dark learning journey is accessible without overflow at ${width}px`, async ({ page, context }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 960 }); await page.emulateMedia({ reducedMotion: "reduce" });
    await login(context);
    for (const theme of ["light", "dark"]) {
      await page.goto("/");
      if (theme === "dark") await page.getByRole("button", { name: "Gunakan mode gelap" }).click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await accessible(page);
      for (const path of ["/beranda", "/encyclopedia", "/blok/etik-hukum"]) {
        await page.goto(path); await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible(); await accessible(page);
      }
      if (width === 360 || width === 1440) {
        mkdirSync(".local/screenshots", { recursive: true });
        await page.screenshot({ path: `.local/screenshots/phase2-module-${width}-${theme}.png`, fullPage: true, animations: "disabled" });
        await page.goto("/beranda");
        await expect(page.getByRole("heading", { name: "Selamat Datang di SI JANI" })).toBeVisible();
        await page.screenshot({ path: `.local/screenshots/phase2-gateway-${width}-${theme}.png`, fullPage: true, animations: "disabled" });
      }
    }
    const attempt = await start(context);
    await page.goto(`/simulasi/${caseSlug}?attempt=${attempt.id}`); await accessible(page);
    await page.goto("/analisis"); await accessible(page);
  });
}

test("every implemented public and authenticated route renders without browser errors", async ({ page, context }) => {
  test.setTimeout(120_000); await login(context); const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const path of ["/", "/tujuan", "/beranda", "/encyclopedia", "/encyclopedia/memori-kerja", "/encyclopedia/teori", "/encyclopedia/tokoh", "/encyclopedia/tokoh/bf-skinner", "/knowledge-map", "/learning-path", "/blok", "/blok/etik-hukum", "/blok/etik-hukum/materi", "/simulasi/kerahasiaan-dalam-supervisi", "/analisis", "/tips", "/progress", "/referensi", "/profil", "/dosen"]) {
    const response = await page.goto(path); expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
  expect(errors).toEqual([]);
});
