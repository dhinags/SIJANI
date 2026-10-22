export async function requestJson<T>(url: string, method: string, body?: unknown): Promise<T> {
  let response: Response;
  try { response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) }); }
  catch { throw new Error("Koneksi terputus. Perubahan belum dikonfirmasi tersimpan. Periksa koneksi, lalu coba simpan lagi."); }
  if (response.status === 401) throw new Error("Sesi berakhir atau belum masuk. Perubahan belum tersimpan. Pertahankan halaman ini atau salin pekerjaan Anda sebelum masuk kembali. Profil demo baru tidak memulihkan sesi lama.");
  let data;
  try { data = await response.json(); }
  catch { throw new Error("Layanan belum mengonfirmasi penyimpanan. Tetap di halaman ini dan coba lagi."); }
  if (!response.ok) throw new Error(data.error ?? "Permintaan belum berhasil. Coba lagi.");
  return data as T;
}
