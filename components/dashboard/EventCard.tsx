"use client";

import { motion } from "framer-motion";
import { getActiveEvent, getUpcomingEvent, getTimeRemaining } from "@/lib/specialEvents";

interface EventCardProps {
  showUpcoming?: boolean;
}

export default function EventCard({ showUpcoming = false }: EventCardProps) {
  const activeEvent = getActiveEvent();
  const upcomingEvent = showUpcoming ? getUpcomingEvent() : null;
  const event = activeEvent || upcomingEvent;

  if (!event) return null;

  const isActive = activeEvent !== null;
  const timeRemaining = getTimeRemaining(event);

  // Couleurs basées sur le thème de l'événement
  const themeColors: Record<string, { bg: string; border: string; badge: string; text: string }> = {
    halloween: {
      bg: "bg-orange-900/20",
      border: "border-orange-600/40",
      badge: "bg-orange-600",
      text: "text-orange-400",
    },
    spring: {
      bg: "bg-green-900/20",
      border: "border-green-600/40",
      badge: "bg-green-600",
      text: "text-green-400",
    },
    summer: {
      bg: "bg-yellow-900/20",
      border: "border-yellow-600/40",
      badge: "bg-yellow-600",
      text: "text-yellow-400",
    },
    default: {
      bg: "bg-purple-900/20",
      border: "border-purple-600/40",
      badge: "bg-purple-600",
      text: "text-purple-400",
    },
  };

  const colors = themeColors[event.theme] || themeColors.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${colors.bg} border ${colors.border} rounded-xl p-6 mb-6 relative overflow-hidden`}
    >
      {/* Background animation */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse-slow" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Badge + Title */}
        <div className="flex items-center gap-3 mb-3">
          <span className={`${colors.badge} text-white text-xs font-bold px-3 py-1 rounded-full`}>
            {isActive ? "🔴 EN COURS" : "⏳ À VENIR"}
          </span>
          <h3 className={`text-lg font-bold ${colors.text}`}>{event.name}</h3>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-4">{event.description}</p>

        {/* Time remaining */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-400">⏱️ Temps restant :</span>
          <span className={`text-sm font-semibold ${colors.text}`}>
            {timeRemaining.days}j {timeRemaining.hours}h {timeRemaining.minutes}m
          </span>
        </div>

        {/* Reward */}
        {event.reward && (
          <div className="bg-gray-900/50 rounded px-3 py-2 text-xs">
            <span className="text-gray-400">Récompense : </span>
            <span className="text-cyan-400 font-semibold">{event.reward}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
