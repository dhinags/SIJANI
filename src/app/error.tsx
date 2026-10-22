"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) { return <section className="error-state"><h1>Ruang belajar belum dapat dimuat.</h1><p>Periksa koneksi dan kesiapan layanan, lalu coba lagi. Progres yang sudah tersimpan tetap berada di profil Anda.</p><Button onClick={reset}>Coba lagi</Button></section>; }
