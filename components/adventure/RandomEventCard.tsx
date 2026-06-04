"use client";

import { motion } from "framer-motion";
import { RANDOM_EVENTS } from "@/lib/randomEvents";

interface RandomEventChoice {
  text: string;
  consequence: { xp?: number; pv?: number; stat?: string | null };
}

interface RandomEventCardProps {
  event: (typeof RANDOM_EVENTS)[0];
  onChoice: (
    consequence: RandomEventChoice["consequence"],
    choiceIndex: number,
  ) => void;
}

export default function RandomEventCard({
  event,
  onChoice,
}: RandomEventCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-card bg-slate-900/60 border border-amber-500/30 rounded-card p-5 mb-4"
    >
      <p className="text-amber-400 text-xs font-semibold mb-2">
        {event.type === "combat" ? "COMBAT!" : "ÉVÉNEMENT ALÉATOIRE"}
      </p>
      <p className="text-gray-400 leading-relaxed text-sm">{event.text}</p>
      <div className="flex flex-col gap-2 mt-4">
        {event.choices.map((choice, idx) => (
          <button
            key={idx}
            onClick={() => onChoice(choice.consequence, idx)}
            className={`w-full text-left px-4 py-3 bg-transparent border rounded-card text-sm transition-all ${
              event.type === "combat" && idx === 0
                ? "border-red-500/50 hover:border-red-500 text-gray-400 hover:text-red-300"
                : "border-cyan-500/20 hover:border-amber-500/50 text-gray-400 hover:text-white"
            }`}
          >
            {choice.text}
          </button>
        ))}
      </div>
    </motion.div>
  );
}



