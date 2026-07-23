"use client";

import type { Stats } from "@/hooks/admin/useAdminDashboard";
import { useLanguage } from "@/context/LanguageContext";

interface AdminRoleDistributionProps {
  stats: Stats;
}

export default function AdminRoleDistribution({
  stats,
}: AdminRoleDistributionProps) {
  const { t } = useLanguage();
  const roles = [
    { role: t("admin.roles.joueur"), count: stats.joueurCount, color: "bg-cyan-500" },
    { role: t("admin.roles.createur"), count: stats.createurCount, color: "bg-purple-500" },
    { role: t("admin.roles.admin"), count: stats.adminCount, color: "bg-red-500" },
  ];

  return (
    <div className="card-base p-6">
      <h2 className="text-xl font-bold text-white mb-6">
        {t("admin.roleDistribution")}
      </h2>
      <div className="space-y-4">
        {roles.map((item, i) => {
          const percentage =
            stats.totalUsers > 0
              ? (item.count / stats.totalUsers) * 100
              : 0;
          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">{item.role}</span>
                <span className="text-white font-medium">{item.count}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${item.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
