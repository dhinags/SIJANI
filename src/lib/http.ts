import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "./db";
import { isAllowedAppOrigin } from "./app-origin";
export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function checkOrigin(request: Request) {
  if (!isAllowedAppOrigin(request.headers.get("origin"))) throw new HttpError(403, "Permintaan tidak berasal dari aplikasi ini.");
}
export async function parseBody<T extends z.ZodType>(request: Request, schema: T): Promise<z.infer<T>> {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new HttpError(415, "Gunakan format JSON.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Data diperlukan.");
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const { value, done } = await reader.read(); if (done) break;
    size += value.length;
    if (size > 64_000) { await reader.cancel(); throw new HttpError(413, "Data terlalu besar."); }
    chunks.push(value);
  }
  let body: unknown;
  try { body = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new HttpError(400, "Data JSON tidak valid."); }
  const result = schema.safeParse(body);
  if (!result.success) throw new HttpError(400, "Periksa kelengkapan dan format isian.");
  return result.data;
}
export async function api(handler: () => Promise<NextResponse>) {
  try {
    const response = await handler(); response.headers.set("Cache-Control", "private, no-store"); return response;
  } catch (error: unknown) {
    if (error instanceof HttpError) return NextResponse.json({ error: error.message }, { status: error.status, headers: { "Cache-Control": "no-store" } });
    if (error && typeof error === "object" && "code" in error && ["P2034", "P2002"].includes(String(error.code))) return NextResponse.json({ error: "Data berubah atau sudah terdaftar. Muat ulang sebelum mencoba lagi." }, { status: 409, headers: { "Cache-Control": "no-store" } });
    console.error("SIJANI request failed", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ error: "Layanan belum tersedia. Coba lagi; jawaban yang sudah tersimpan tetap aman." }, { status: 503 });
  }
}
export async function rateLimit(scope: string, limit = 120, windowMs = 60_000) {
  const now = Date.now(); const bucket = Math.floor(now / windowMs); const key = `${scope}:${bucket}`;
  const result = await db.rateLimit.upsert({ where: { key }, create: { key, count: 1, resetAt: new Date((bucket + 1) * windowMs) }, update: { count: { increment: 1 } } });
  if (result.count > limit) throw new HttpError(429, "Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.");
  await db.rateLimit.deleteMany({ where: { resetAt: { lt: new Date(now - windowMs) } } });
}
