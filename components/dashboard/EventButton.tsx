"use client";

import { Zap } from "lucide-react";
import { useEventContext } from "@/context/EventContext";
import { getActiveEvent, getUpcomingEvent } from "@/lib/specialEvents";

export default function EventButton() {
  const { openEventPopup } = useEventContext();
  const event = getActiveEvent() || getUpcomingEvent();

  if (!event) return null;

  return (
    <button
      onClick={openEventPopup}
      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg flex items-center gap-2 transition-all animate-pulse-ring"
      aria-label="Voir l'événement spécial"
    >
      <Zap size={18} />
      <span className="hidden sm:inline">Événement</span>
    </button>
  );
}
