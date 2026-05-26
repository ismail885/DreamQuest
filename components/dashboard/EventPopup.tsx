"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Zap } from "lucide-react";
import { getActiveEvent, getTimeRemaining } from "@/lib/specialEvents";

interface EventPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EventPopup({ isOpen, onClose }: EventPopupProps) {
  const event = getActiveEvent();

  if (!event) return null;

  const timeRemaining = getTimeRemaining(event.endDate);

  // Couleurs basées sur le thème
  const themeColors: Record<string, { bg: string; border: string; accent: string; glow: string }> = {
    halloween: {
      bg: "from-orange-900 to-red-900",
      border: "border-orange-500",
      accent: "text-orange-400",
      glow: "shadow-orange-500/50",
    },
    spring: {
      bg: "from-green-900 to-emerald-900",
      border: "border-green-500",
      accent: "text-green-400",
      glow: "shadow-green-500/50",
    },
    summer: {
      bg: "from-yellow-900 to-amber-900",
      border: "border-yellow-500",
      accent: "text-yellow-400",
      glow: "shadow-yellow-500/50",
    },
    default: {
      bg: "from-purple-900 to-violet-900",
      border: "border-purple-500",
      accent: "text-purple-400",
      glow: "shadow-purple-500/50",
    },
  };

  const colors = themeColors[event.theme] || themeColors.default;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className={`fixed inset-0 z-50 flex items-center justify-center px-4`}
          >
            <div
              className={`w-full max-w-md bg-gradient-to-br ${colors.bg} ${colors.border} border-2 rounded-2xl shadow-2xl ${colors.glow} shadow-2xl overflow-hidden`}
            >
              {/* Header with animation */}
              <div className="relative p-6 bg-black/30 border-b border-white/10">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <div className="animate-pulse-ring">
                    <Zap className={`${colors.accent}`} size={28} />
                  </div>
                  <h2 className={`text-2xl font-bold ${colors.accent}`}>{event.name}</h2>
                </div>
                <p className="text-gray-300 text-sm">Événement spécial en cours</p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <p className="text-gray-200 leading-relaxed">{event.description}</p>
                </div>

                {/* Time remaining */}
                <div className="bg-black/40 rounded-lg p-4 border border-white/10">
                  <div className="text-xs text-gray-400 mb-2">⏱️ TEMPS RESTANT</div>
                  <div className={`text-2xl font-bold ${colors.accent}`}>
                    {timeRemaining.days}j {timeRemaining.hours}h {timeRemaining.minutes}m
                  </div>
                </div>

                {/* Reward */}
                {event.reward && (
                  <div className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 rounded-lg p-4 border border-cyan-500/30">
                    <div className="text-xs text-cyan-400 font-semibold mb-2">🎁 RÉCOMPENSE</div>
                    <div className="text-cyan-300 font-bold">{event.reward}</div>
                  </div>
                )}

                {/* CTA Button */}
                <button
                  onClick={onClose}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${colors.accent} bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40`}
                >
                  Explorez l'événement
                </button>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-black/20 border-t border-white/10 text-center">
                <p className="text-xs text-gray-400">
                  Participez pour débloquer des récompenses exclusives
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
