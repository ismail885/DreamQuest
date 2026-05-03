export default function Loading() {
  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-content-secondary">Chargement...</p>
      </div>
    </div>
  );
}