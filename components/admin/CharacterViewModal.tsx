"use client";

import { X, User } from "lucide-react";
import type { CharacterWithUser } from "@/hooks/admin/useAdminCharacters";
import { useLanguage } from "@/context/LanguageContext";

interface CharacterViewModalProps {
  character: CharacterWithUser | null;
  onClose: () => void;
}

function getClassColor(classe: string) {
  const colors: Record<string, string> = {
    Guerrier: "bg-red-500/20 text-red-400 border-red-500/30",
    Mage: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Assassin: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    Prêtre: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    Paladin: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Archer: "bg-green-500/20 text-green-400 border-green-500/30",
    Druide: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    Nécromancien: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    Voleur: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    Barbare: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  };
  return colors[classe] || "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
}

export default function CharacterViewModal({
  character,
  onClose,
}: CharacterViewModalProps) {
  const { t } = useLanguage();
  if (!character) return null;

  const maxHp = character.points_vie_max || 100;
  const hpPercent = Math.min(
    100,
    (character.points_vie / maxHp) * 100,
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card-base w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-cyan-500/15">
          <h2 className="text-xl font-bold text-white">
            {character.nom_personnage}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div
              className={`px-4 py-2 rounded-full text-sm border ${getClassColor(character.classe)}`}
            >
              {character.classe}
            </div>
            <div className="text-gray-400">
              {t("character.level")}{" "}
              <span className="text-white font-bold">
                {character.niveau}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-900/50 rounded-card">
            <div>
              <label className="text-gray-400 text-xs">{t("character.statsLabels.force")}</label>
              <p className="text-white font-bold">
                {character.stats?.force || 0}
              </p>
            </div>
            <div>
              <label className="text-gray-400 text-xs">{t("character.statsLabels.agility")}</label>
              <p className="text-white font-bold">
                {character.stats?.agility || 0}
              </p>
            </div>
            <div>
              <label className="text-gray-400 text-xs">{t("character.statsLabels.magie")}</label>
              <p className="text-white font-bold">
                {character.stats?.magie || 0}
              </p>
            </div>
            <div>
              <label className="text-gray-400 text-xs">{t("character.statsLabels.endurance")}</label>
              <p className="text-white font-bold">
                {character.stats?.endurance || 0}
              </p>
            </div>
          </div>

          {/* Health */}
          <div>
            <label className="text-gray-400 text-sm">
              {t("character.health")}
            </label>
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white">
                  {character.points_vie} / {maxHp}
                </span>
                <span className="text-gray-400">
                  {Math.round(hpPercent)}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Owner */}
          <div>
            <label className="text-gray-400 text-sm">
              {t("admin.tables.owner")}
            </label>
            <p className="text-white mt-1 flex items-center gap-2">
              <User className="w-4 h-4" />
              {character.nom_utilisateur ||
                `ID: ${character.id_utilisateur}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
