import { test, expect, type APIRequestContext, type BrowserContext } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createHash, randomBytes } from "node:crypto";
import { questions } from "../../prisma/content";
import { rubric } from "../../src/lib/rubric";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const origin = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const headers = { origin };
const caseSlug = "kerahasiaan-dalam-supervisi";
const createdUsers = new Set<string>();
async function track(context: BrowserContext) {
  const cookie = (await context.cookies()).find(c => c.name === "sijani_session");
  if (cookie) {
    const tokenHash = createHash("sha256").update(cookie.value).digest("hex");
    const session = await db.session.findUnique({ where: { tokenHash } });
    if (session) createdUsers.add(session.userId);
  }
}
async function login(context: BrowserContext) {
  const result = await context.request.post(`${origin}/api/demo`, { headers });
  expect(result.ok()).toBe(true); await track(context);
}
async function start(request: APIRequestContext) {
  const result = await request.post(`${origin}/api/attempts`, { headers, data: { caseSlug } });
  expect(result.ok()).toBe(true); return result.json();
}
test.afterEach(async ({ context }) => { await track(context); });
test.afterAll(async () => {
  await db.user.deleteMany({ where: { id: { in: [...createdUsers] }, isDemo: true } });
  await db.$disconnect();
});

test("landing, demo onboarding, article completion, and profile preferences", async ({ page, context }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Kenali ilmunya.");
  await page.getByRole("link", { name: "Mulai Belajar", exact: true }).click();
  await page.getByRole("button", { name: "Masuk ke ruang demo" }).click();
  await expect(page).toHaveURL(/\/identitas$/);
  await track(context);
  await expect(page.getByRole("heading", { name: "Verifikasi NPM" })).toBeVisible();
  await page.getByLabel("Nama samaran").fill("Pelajar Uji");
  await page.getByRole("button", { name: "Lanjutkan ke pilihan belajar" }).click();
  await expect(page).toHaveURL(/\/tujuan$/);
  await page.goto("/encyclopedia/memori-kerja");
  await page.getByRole("button", { name: "Tandai sudah dipelajari" }).click();
  await expect(page.getByRole("button", { name: "Sudah dipelajari" })).toBeDisabled();
  await page.reload();
  await expect(page.getByRole("button", { name: "Sudah dipelajari" })).toBeDisabled();
  await page.goto("/progress");
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "1");
  await expect(page.locator(".reading-list")).toContainText("Memori kerja");
  await page.goto("/profil");
  await expect(page.getByLabel("Nama samaran")).toHaveValue("Pelajar Uji");
  await page.getByLabel("Cara belajar").selectOption("eksplorasi");
  await page.getByRole("button", { name: "Simpan preferensi" }).click();
  await expect(page.getByRole("status")).toHaveText("Preferensi berhasil disimpan.");
  await page.reload();
  await expect(page.getByLabel("Cara belajar")).toHaveValue("eksplorasi");
});

test("encyclopedia search, filters, empty states, map, and source status", async ({ page }) => {
  await page.goto("/encyclopedia");
  await expect(page.locator(".article-card")).toHaveCount(6);
  await page.getByLabel("Cari konsep").fill("memori");
  await page.getByRole("button", { name: "Telusuri" }).click();
  await expect(page.locator(".article-card")).toHaveCount(1);
  await expect(page.locator(".article-card h3")).toHaveText("Memori kerja");
  await page.getByLabel("Cari konsep").fill("");
  await page.getByLabel("Filter domain").selectOption("behaviorisme");
  await page.getByRole("button", { name: "Telusuri" }).click();
  await expect(page.locator(".article-card")).toHaveCount(2);
  await page.getByLabel("Filter domain").selectOption("klinis");
  await page.getByRole("button", { name: "Telusuri" }).click();
  await expect(page.getByRole("heading", { name: "Materi sedang direncanakan" })).toBeVisible();
  await page.goto("/knowledge-map?domain=behaviorisme");
  await page.getByRole("button", { name: "Pilih Pengondisian klasik", exact: true }).click();
  await expect(page.locator(".map-context")).toContainText("Dibandingkan dengan");
  await page.getByLabel("Jelajahi domain").selectOption("kognitif");
  await expect(page).toHaveURL(/domain=kognitif/);
  await page.getByRole("button", { name: "Pilih Model memori kerja", exact: true }).click();
  await expect(page.locator(".map-context")).toContainText("Alan Baddeley");
  await page.goto("/referensi");
  await expect(page.locator(".source-row")).toHaveCount(5);
  await expect(page.getByText("MENUNGGU VERIFIKASI", { exact: true })).toHaveCount(5);
  await page.goto("/blok");
  await expect(page.locator(".planned-block")).toContainText("Belum diluncurkan");
});

test("five-format case: save, reload, complete, review, and retake", async ({ page, context }) => {
  await login(context);
  await page.goto(`/simulasi/${caseSlug}`);
  await page.getByRole("button", { name: "Mulai latihan", exact: true }).click();
  await expect(page).toHaveURL(/attempt=/);
  const attemptUrl = page.url();
  await page.getByLabel("Tunda pembagian;", { exact: false }).check();
  await page.getByRole("button", { name: "Simpan draf", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Draf tersimpan");
  await page.goto("/progress");
  await page.locator(".history-row").click();
  await expect(page.getByLabel("Tunda pembagian;", { exact: false })).toBeChecked();
  await page.getByRole("button", { name: "Simpan & lanjut" }).click();
  for (const value of ["consent", "access", "policy"]) await page.locator(`input[value="${value}"]`).check();
  await page.getByRole("button", { name: "Simpan & lanjut" }).click();
  await page.locator("#prinsip-p1").selectOption("privacy");
  await page.locator("#prinsip-p2").selectOption("consent");
  await page.locator("#prinsip-p3").selectOption("competence");
  await page.getByRole("button", { name: "Simpan & lanjut" }).click();
  const raise = page.getByRole("button", { name: "Naikkan Identifikasi tujuan, fakta, dan informasi yang belum diketahui.", exact: true });
  await raise.click(); await raise.click();
  await page.getByRole("button", { name: "Naikkan Konsultasikan dilema dan batas kewenangan dengan penyelia.", exact: true }).click();
  await page.getByRole("button", { name: "Naikkan Pilih alternatif yang proporsional berdasarkan hasil klarifikasi.", exact: true }).click();
  await page.getByRole("button", { name: "Simpan & lanjut" }).click();
  await page.locator("#lanjutan-unique").selectOption("yes");
  await page.locator("#lanjutan-foreign").selectOption("no");
  await page.getByRole("button", { name: "Kirim jawaban" }).click();
  await expect(page.locator(".score-display")).toHaveText("100/ 100");
  await expect(page.locator(".feedback-list > article")).toHaveCount(5);
  await page.locator(".feedback-list summary").first().click();
  await expect(page.locator(".answer-review").first()).toContainText("Tunda pembagian");
  await page.reload();
  await expect(page.locator(".score-display")).toContainText("100");
  await page.getByRole("button", { name: "Latihan ulang" }).click();
  await expect(page).not.toHaveURL(attemptUrl);
  await expect(page.getByLabel("Tunda pembagian;", { exact: false })).not.toBeChecked();
  await page.goto("/progress");
  await expect(page.locator(".history-row")).toHaveCount(2);
  await expect(page.locator(".history-list")).toContainText("100/100");
});

test("server enforces ownership, staff roles, CSRF, validation, and cookie boundaries", async ({ browser, context, page }) => {
  const other = await browser.newContext();
  try {
    expect((await other.request.post(`${origin}/api/attempts`, { headers, data: { caseSlug } })).status()).toBe(401);
    expect((await other.request.post(`${origin}/api/demo`, { headers: { origin: "https://untrusted.example" } })).status()).toBe(403);
    await login(context); await login(other);
    const a = await start(context.request);
    expect(a.questions.every((q: Record<string, unknown>) => !("correct" in q) && !("explanation" in q))).toBe(true);
    expect(a.feedback).toBeNull();
    const cookie = (await context.cookies()).find(c => c.name === "sijani_session")!;
    expect(cookie.httpOnly).toBe(true); expect(cookie.sameSite).toBe("Lax");
    const session = await db.session.findUnique({ where: { tokenHash: createHash("sha256").update(cookie.value).digest("hex") } });
    expect(session).not.toBeNull(); expect(session!.tokenHash).not.toBe(cookie.value);
    expect((await other.request.get(`${origin}/api/attempts/${a.id}`)).status()).toBe(404);
    expect((await other.request.patch(`${origin}/api/attempts/${a.id}`, { headers, data: { answers: {}, revision: 0 } })).status()).toBe(404);
    expect((await context.request.get(`${origin}/api/dosen`)).status()).toBe(403);
    expect((await context.request.patch(`${origin}/api/profile`, { headers, data: { displayName: "E2E Role", preference: "bertahap", onboardingDone: true, role: "DOSEN" } })).status()).toBe(400);
    expect((await context.request.patch(`${origin}/api/attempts/${a.id}`, { headers, data: { answers: { "langkah-awal": "not-an-option" }, revision: 0 } })).status()).toBe(400);
    expect((await context.request.post(`${origin}/api/attempts/${a.id}`, { headers, data: { answers: {}, revision: 0 } })).status()).toBe(400);
    await page.goto("/dosen"); await expect(page.getByRole("heading", { name: "Ruang dosen dilindungi." })).toBeVisible();
    await context.request.post(`${origin}/api/progress`, { headers, data: { articleSlug: "memori-kerja" } });
    await context.request.post(`${origin}/api/progress`, { headers, data: { articleSlug: "memori-kerja" } });
    expect(await db.learningProgress.count({ where: { userId: session!.userId } })).toBe(1);
    const otherPage = await other.newPage(); await otherPage.goto(`${origin}/progress`);
    await expect(otherPage.getByRole("progressbar")).toHaveAttribute("value", "0");
    await context.request.delete(`${origin}/api/session`, { headers });
    expect((await context.request.get(`${origin}/api/attempts/${a.id}`)).status()).toBe(401);
    expect(await db.session.findUnique({ where: { tokenHash: session!.tokenHash } })).toBeNull();
  } finally { await track(other); await other.close(); }
});

test("concurrent draft creation, revision conflicts, and immutable submission", async ({ context }) => {
  await login(context);
  const [a, b] = await Promise.all([start(context.request), start(context.request)]);
  expect(a.id).toBe(b.id);
  const writes = await Promise.all(["clarify", "share"].map(answer => context.request.patch(`${origin}/api/attempts/${a.id}`, { headers, data: { answers: { "langkah-awal": answer }, revision: 0 } })));
  expect(writes.map(r => r.status()).sort()).toEqual([200, 409]);
  const complete = Object.fromEntries(questions.map(q => [q.id, q.correct]));
  const result = await context.request.post(`${origin}/api/attempts/${a.id}`, { headers, data: { answers: complete, revision: 1 } });
  expect(result.ok()).toBe(true); expect((await result.json()).score).toBe(100);
  const repeated = await context.request.post(`${origin}/api/attempts/${a.id}`, { headers, data: { answers: { "langkah-awal": "share" }, revision: 0 } });
  expect((await repeated.json()).score).toBe(100);
  expect((await context.request.patch(`${origin}/api/attempts/${a.id}`, { headers, data: { answers: {}, revision: 2 } })).status()).toBe(409);
});

test("eleven-dimension self-review persists, is transparent, and is isolated", async ({ page, context, browser }) => {
  await login(context); await page.goto("/analisis");
  for (const r of rubric) {
    await page.locator(`#text-${r.id}`).fill(`Contoh sintetis: ${r.example}`);
    await page.locator(`#rating-${r.id}`).selectOption("3");
  }
  await page.getByRole("button", { name: "Simpan self-review" }).click();
  await expect(page.getByRole("status")).toContainText("75/100");
  await expect(page.getByRole("status")).toContainText("bukan evaluasi pengajar atau AI");
  await page.reload();
  await expect(page.locator("#text-facts")).toHaveValue(`Contoh sintetis: ${rubric[0].example}`);
  await expect(page.locator("#rating-facts")).toHaveValue("3");
  const other = await browser.newContext();
  try {
    await login(other); const otherPage = await other.newPage(); await otherPage.goto(`${origin}/analisis`);
    await expect(otherPage.locator("#text-facts")).toHaveValue("");
    await expect(otherPage.locator("#rating-facts")).toHaveValue("");
  } finally { await track(other); await other.close(); }
});

test("authorized synthetic lecturer can review content but receives no learner data", async ({ context, page }) => {
  const token = randomBytes(32).toString("hex");
  const fixture = await db.user.create({ data: { role: "DOSEN", isDemo: true, profile: { create: { displayName: "Pengajar Uji Sintetis" } }, sessions: { create: { tokenHash: createHash("sha256").update(token).digest("hex"), expiresAt: new Date(Date.now() + 60_000) } } } });
  createdUsers.add(fixture.id);
  await context.addCookies([{ name: "sijani_session", value: token, url: origin, httpOnly: true, sameSite: "Lax" }]);
  const result = await context.request.get(`${origin}/api/dosen`);
  expect(result.ok()).toBe(true);
  const data = await result.json();
  expect(Object.keys(data).sort()).toEqual(["articles", "sources"]);
  expect(data.articles).toHaveLength(6);
  await page.goto("/dosen"); await expect(page.getByRole("heading", { name: "Antrean tinjauan akademik" })).toBeVisible();
  await db.session.updateMany({ where: { userId: fixture.id }, data: { expiresAt: new Date(0) } });
  expect((await context.request.get(`${origin}/api/dosen`)).status()).toBe(401);
});

for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1440, height: 1000 }]) {
  test(`responsive navigation and accessibility at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport); await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Lewati ke konten utama" })).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const landing = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(landing.violations).toEqual([]);
    await page.goto("/encyclopedia");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const encyclopedia = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(encyclopedia.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);
    if (viewport.width < 761) {
      await page.getByRole("button", { name: "Buka navigasi" }).click();
      await page.getByRole("navigation", { name: "Navigasi utama" }).getByRole("link", { name: "Blok Pembelajaran" }).click();
      await expect(page).toHaveURL(/\/blok$/);
      await expect(page.getByRole("button", { name: "Buka navigasi" })).toHaveAttribute("aria-expanded", "false");
    }
    const app = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(app.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);
  });
}

test("mobile case controls, keyboard input, and reflection form accessibility", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(context);
  const attempt = await start(context.request);
  await page.goto(`/simulasi/${caseSlug}?attempt=${attempt.id}`);
  await page.getByRole("radio").first().focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("radio").nth(1)).toBeChecked();
  await page.getByRole("button", { name: "Simpan draf", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Draf tersimpan");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const simulation = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(simulation.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);
  await page.goto("/analisis");
  const reflection = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(reflection.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
