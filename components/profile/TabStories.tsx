"use client";

import { useRouter } from "next/navigation";
import {
  Clock,
  Play,
  Sword,
  Wand2,
  Shield,
  Wind,
  User,
  BookOpen,
} from "lucide-react";
import type { UserSave } from "@/types/save";

interface TabStoriesProps {
  saves: UserSave[];
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  if (diffMs < 0) return "À l'instant";

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `Il y a ${days} jour${days > 1 ? "s" : ""}`;

  const months = Math.floor(days / 30);
  return `Il y a ${months} mois`;
}

const CLASSE_ICONS: Record<string, React.ReactNode> = {
  Guerrier: <Sword className="w-3.5 h-3.5" />,
  Barbare: <Sword className="w-3.5 h-3.5" />,
  Mage: <Wand2 className="w-3.5 h-3.5" />,
  Prêtre: <Wand2 className="w-3.5 h-3.5" />,
  Druide: <Wand2 className="w-3.5 h-3.5" />,
  Archer: <Wind className="w-3.5 h-3.5" />,
  Assassin: <Wind className="w-3.5 h-3.5" />,
  Voleur: <Wind className="w-3.5 h-3.5" />,
  Paladin: <Shield className="w-3.5 h-3.5" />,
  Nécromancien: <Wand2 className="w-3.5 h-3.5" />,
};

function ClasseBadge({ classe }: { classe?: string }) {
  if (!classe) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
      {CLASSE_ICONS[classe] ?? <User className="w-3.5 h-3.5" />}
      {classe}
    </span>
  );
}

export default function TabStories({ saves }: TabStoriesProps) {
  const router = useRouter();

  // Trier par date de sauvegarde (plus récent en premier)
  const sortedSaves = [...saves].sort(
    (a, b) =>
      new Date(b.date_sauvegarde).getTime() -
      new Date(a.date_sauvegarde).getTime(),
  );

  if (sortedSaves.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Aucune histoire jouée
        </h3>
        <p className="text-gray-400 mb-4">
          Commencez une aventure pour voir votre progression ici.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium rounded-lg transition-colors"
        >
          Découvrir les aventures
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedSaves.map((save) => (
        <div
          key={save.id}
          onClick={() =>
            save.status !== "completed" &&
            router.push(
              `/adventure/${save.id_aventure}?personnage=${save.id_personnage}&save=${save.id}`,
            )
          }
          className={`group backdrop-blur-card bg-slate-900/50 border border-gray-700/30 rounded-xl p-4 transition-all duration-200 ${
            save.status === "completed"
              ? "opacity-75 cursor-default"
              : "hover:border-cyan-500/30 hover:bg-cyan-500/5 cursor-pointer"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Titre + statut */}
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-base font-semibold text-white truncate">
                  {save.aventure_titre}
                </h3>
                <span
                  className={`flex-shrink-0 px-2.5 py-0.5 text-[10px] font-semibold rounded-full border ${
                    save.status === "completed"
                      ? "border-green-500/50 text-green-400 bg-green-500/10"
                      : "border-amber-500/50 text-amber-400 bg-amber-500/10"
                  }`}
                >
                  {save.status === "completed" ? "Terminée" : "En cours"}
                </span>
              </div>

              {/* Infos secondaires */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                {save.personnage_nom && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-gray-600" />
                    <span className="text-gray-400 truncate max-w-[120px]">
                      {save.personnage_nom}
                    </span>
                  </span>
                )}
                <ClasseBadge classe={save.personnage_classe} />
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {getRelativeTime(save.date_sauvegarde)}
                </span>
              </div>

              {/* Barre de progression */}
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      save.status === "completed"
                        ? "bg-gradient-to-r from-cyan-500 to-green-500"
                        : "bg-gradient-to-r from-cyan-500 to-blue-500"
                    }`}
                    style={{ width: `${save.progression}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-400 flex-shrink-0">
                  {save.progression}%
                </span>
              </div>
            </div>

            {/* Bouton reprendre */}
            {save.status !== "completed" && (
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-3.5 h-3.5 text-cyan-400 ml-0.5" />
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}



