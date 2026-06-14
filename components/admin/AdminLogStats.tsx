"use client";

interface LogStats {
  total: number;
  inscriptions: number;
  aventures: number;
  votes: number;
  personnages: number;
}

interface AdminLogStatsProps {
  stats: LogStats;
}

export default function AdminLogStats({ stats }: AdminLogStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div className="card-base p-4">
        <p className="text-gray-400 text-sm">Total</p>
        <p className="text-2xl font-bold text-white">{stats.total}</p>
      </div>
      <div className="card-base p-4">
        <p className="text-gray-400 text-sm">Inscriptions</p>
        <p className="text-2xl font-bold text-cyan-400">{stats.inscriptions}</p>
      </div>
      <div className="card-base p-4">
        <p className="text-gray-400 text-sm">Aventures</p>
        <p className="text-2xl font-bold text-purple-400">{stats.aventures}</p>
      </div>
      <div className="card-base p-4">
        <p className="text-gray-400 text-sm">Votes</p>
        <p className="text-2xl font-bold text-amber-400">{stats.votes}</p>
      </div>
      <div className="card-base p-4">
        <p className="text-gray-400 text-sm">Personnages</p>
        <p className="text-2xl font-bold text-emerald-400">{stats.personnages}</p>
      </div>
    </div>
  );
}
