import Link from "./safe-link";
export function ActionError({ message }: { message: string }) {
  if (!message) return null;
  return <div className="form-error" role="alert"><p>{message}</p>{message.startsWith("Sesi berakhir") && <Link href="/masuk" className="text-link">Buka halaman masuk</Link>}</div>;
}
