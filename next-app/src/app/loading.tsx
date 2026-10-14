export default function Loading() {
  return (
    <main className="loading-page" aria-live="polite" aria-busy="true">
      <div className="loading-shell">
        <span className="loading-mark" />
        <div className="loading-line loading-line-wide" />
        <div className="loading-line" />
        <p>Chargement de la page…</p>
      </div>
    </main>
  );
}
