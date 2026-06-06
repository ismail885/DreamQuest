import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen } from "lucide-react";

interface StorySectionProps {
  progression: number;
  texte: string;
  branchKey?: string | number;
}

function formatParagraph(paragraph: string, index: number) {
  const trimmed = paragraph.trim();
  if (!trimmed) return null;

  const hasDialogue = /[""][^""]+[""]/.test(trimmed);
  const dialoguePrefix = trimmed.startsWith("—") || trimmed.startsWith("- ");

  // Titres (ex: situés en début de texte avec **titre** ou tout en majuscules court)
  const isTitleLine = /^\*\*[^*]+\*\*$|^---/.test(trimmed) ||
    (trimmed.length < 60 && trimmed === trimmed.toUpperCase() && trimmed.length > 10 && !trimmed.startsWith("http"));

  if (isTitleLine) {
    return (
      <h2 key={index} className="text-cyan-300 font-bold text-lg text-center py-3">
        {trimmed.replace(/\*\*/g, "")}
      </h2>
    );
  }

  if (dialoguePrefix || hasDialogue) {
    return (
      <div key={index} className="flex gap-3 items-start py-1.5">
        <BookOpen className="w-4 h-4 text-cyan-400/60 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-cyan-200/90 italic leading-relaxed text-[15px] md:text-base">
            {trimmed}
          </p>
        </div>
      </div>
    );
  }

  // Narration (contenu principal)
  return (
    <p key={index} className="text-gray-200 leading-relaxed text-[15px] md:text-base md:leading-[1.75] first-letter:text-2xl first-letter:text-cyan-400 first-letter:font-bold first-letter:mr-1 first-letter:float-left">
      {trimmed}
    </p>
  );
}

const StorySection = memo(function StorySection({
  progression,
  texte,
  branchKey,
}: StorySectionProps) {
  const paragraphs = texte
    ? texte.split("\n\n").filter(Boolean)
    : [];

  return (
    <div className="space-y-4">
      {/* Progression discrète */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-gray-800/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progression}%` }}
          />
        </div>
        <span className="text-gray-500 text-xs font-mono whitespace-nowrap">{progression}%</span>
      </div>

      <AnimatePresence mode="wait">
        {texte && (
          <motion.div
            key={branchKey ?? "story"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="backdrop-blur-card bg-deep/40 border border-cyan-500/10 rounded-xl p-5 md:p-8 shadow-xl shadow-black/20"
          >
            <div className="space-y-3 md:space-y-4 max-w-none">
              {paragraphs.length > 1 ? (
                paragraphs.map((p, i) => formatParagraph(p, i))
              ) : (
                <p className="text-gray-200 leading-relaxed text-[15px] md:text-base md:leading-[1.75]">
                  {texte}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default StorySection;
