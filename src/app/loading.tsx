export default function Loading() {
  return <div className="skeleton-page" role="status"><span className="sr-only">Menyiapkan ruang belajar…</span><div aria-hidden><div className="skeleton skeleton-title" /><div className="skeleton skeleton-description" /><div className="skeleton-cards">{[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-card" />)}</div></div></div>;
}
