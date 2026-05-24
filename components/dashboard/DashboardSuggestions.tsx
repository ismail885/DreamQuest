"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

interface DashboardSuggestionsProps {
  suggestions: { id: number; titre: string; description: string | null }[];
  loading: boolean;
}

export default function DashboardSuggestions({
  suggestions,
  loading,
}: DashboardSuggestionsProps) {
  const router = useRouter();

  if (loading || suggestions.length === 0) return null;

  return (
    <div className="mb-8 md:mb-12">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2 sticky top-16 md:top-20 z-20 bg-[#070b15]/80 backdrop-blur-sm -mx-4 md:-mx-6 px-4 md:px-6 py-3 -mt-3 md:-mt-4">
        <Sparkles className="w-5 h-5 text-yellow-400" />
        Pour Vous
      </h2>
      <div className="grid md:grid-cols-3 gap-4 md:gap-6">
        {suggestions.map((adventure) => (
          <div
            key={adventure.id}
            onClick={() => router.push(`/adventure/${adventure.id}`)}
            className="bg-gradient-to-br from-[#0d1526] to-[#131929] border border-yellow-500/20 rounded-xl p-5 hover:border-yellow-500/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </div>
              <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full">
                Recommande
              </span>
            </div>
            <h3 className="text-white font-semibold mb-2 line-clamp-1">
              {adventure.titre}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-2">
              {adventure.description || "Une aventure palpitante vous attend..."}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
