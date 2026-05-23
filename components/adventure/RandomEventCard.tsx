"use client";

import { motion } from "framer-motion";
import { RANDOM_EVENTS } from "@/lib/randomGenerator";

interface RandomEventChoice {
  text: string;
  consequence: { xp: number; pv: number; stat: string | null };
}

interface RandomEventCardProps {
  event: (typeof RANDOM_EVENTS)[0];
  onChoice: (consequence: RandomEventChoice["consequence"]) => void;
}

export default function RandomEventCard({
  event,
  onChoice,
}: RandomEventCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0c1322]/80 border border-amber-500/30 rounded-xl p-5 mb-4"
    >
      <p className="text-amber-400 text-xs font-semibold mb-2">
        ÉVÉNEMENT ALÉATOIRE
      </p>
      <p className="text-gray-400 leading-relaxed text-sm">{event.text}</p>
      <div className="flex flex-col gap-2 mt-4">
        {event.choices.map((choice, idx) => (
          <button
            key={idx}
            onClick={() => onChoice(choice.consequence)}
            className="w-full text-left px-4 py-3 bg-[#0c1322] border border-gray-700 hover:border-amber-500/50 rounded-lg text-gray-400 hover:text-white text-sm transition-all"
          >
            {choice.text}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
