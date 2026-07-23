"use client";

import { Users, BookOpen, UserRound, TrendingUp, Activity } from "lucide-react";
import type { Stats } from "@/hooks/admin/useAdminDashboard";
import { useLanguage } from "@/context/LanguageContext";

interface AdminStatCardsProps {
  stats: Stats;
}

export default function AdminStatCards({ stats }: AdminStatCardsProps) {
  const { t } = useLanguage();
  const cards = [
    { title: t("admin.statCards.totalUsers"), value: stats.totalUsers, icon: Users, color: "text-cyan-400", bgColor: "bg-cyan-500/10", subtitle: `${stats.recentUsers} ${t("admin.statCards.thisWeek")}` },
    { title: t("admin.statCards.totalAdventures"), value: stats.totalAdventures, icon: BookOpen, color: "text-purple-400", bgColor: "bg-purple-500/10", subtitle: `${stats.recentAdventures} ${t("admin.statCards.thisWeek")}` },
    { title: t("admin.statCards.totalCharacters"), value: stats.totalCharacters, icon: UserRound, color: "text-emerald-400", bgColor: "bg-emerald-500/10", subtitle: t("admin.statCards.createdLabel") },
    { title: t("admin.statCards.totalVotes"), value: stats.totalVotes, icon: TrendingUp, color: "text-amber-400", bgColor: "bg-amber-500/10", subtitle: t("admin.statCards.totalLabel") },
    { title: t("admin.statCards.activeToday"), value: stats.activeUsersToday, icon: Activity, color: "text-green-400", bgColor: "bg-green-500/10", subtitle: t("admin.statCards.newToday") },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} className="card-base p-6 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm">{card.title}</p>
                <p className="text-3xl font-bold text-white mt-2">{card.value.toLocaleString()}</p>
                <p className="text-gray-500 text-xs mt-2">{card.subtitle}</p>
              </div>
              <div className={`p-3 rounded-card ${card.bgColor}`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
