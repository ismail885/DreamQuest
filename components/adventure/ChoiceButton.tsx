"use client";

import { motion } from "framer-motion";
import type { ConsequenceImpact } from "@/hooks/useConsequences";

interface ChoiceButtonProps {
  label: string;
  text: string;
  impact: ConsequenceImpact;
  onClick: () => void;
}

export default function ChoiceButton({
  label,
  text,
  impact,
  onClick,
}: ChoiceButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full text-left px-5 py-4 bg-transparent border rounded-xl transition-all duration-200 text-sm leading-relaxed flex items-center gap-3 min-h-[56px] ${
        impact.hasImpact
          ? impact.isPositive
            ? "hover:border-green-500/60 hover:bg-green-500/5 border-gray-700 text-gray-300 hover:text-green-300"
            : "hover:border-red-500/60 hover:bg-red-500/5 border-gray-700 text-gray-300 hover:text-red-300"
          : "hover:border-cyan-500/60 hover:bg-white/5 border-gray-700 text-gray-300 hover:text-white"
      }`}
    >
      <div
        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
          impact.hasImpact
            ? impact.isPositive
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
            : "bg-gray-700 text-gray-400"
        }`}
      >
        {impact.hasImpact ? (
          impact.isPositive ? (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )
        ) : (
          <span className="text-xs font-bold">{label}</span>
        )}
      </div>
      <span className="flex-1">{text}</span>
      {impact.hasImpact && (
        <span
          className={`text-xs font-medium ${
            impact.isPositive ? "text-green-400" : "text-red-400"
          }`}
        >
          {impact.impactText}
        </span>
      )}
    </motion.button>
  );
}
