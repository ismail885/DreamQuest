"use client";

import Link from "next/link";
import { Medal } from "lucide-react";
import type { ReactNode } from "react";

interface RankingRowProps {
  rank: number;
  href?: string;
  children: ReactNode;
}

export default function RankingRow({ rank, href, children }: RankingRowProps) {
  const medalColor = (() => {
    switch (rank) {
      case 1: return "text-yellow-400";
      case 2: return "text-gray-300";
      case 3: return "text-amber-600";
      default: return "text-gray-500";
    }
  })();

  const medalIcon = (() => {
    switch (rank) {
      case 1: return <Medal className="w-8 h-8 text-yellow-400" />;
      case 2: return <Medal className="w-8 h-8 text-gray-300" />;
      case 3: return <Medal className="w-8 h-8 text-amber-600" />;
      default: return <span className="text-gray-500 font-bold text-lg">#{rank}</span>;
    }
  })();

  const row = (
    <div className="flex items-center gap-4 p-4 bg-[#0c1322] border border-gray-700/50 rounded-xl hover:border-cyan-500/50 transition-all">
      <div className={`font-bold w-12 ${medalColor}`}>{medalIcon}</div>
      {children}
    </div>
  );

  if (href) {
    return <Link href={href}>{row}</Link>;
  }

  return row;
}
