import { motion } from "framer-motion";
import Image from "next/image";

interface StorySectionProps {
  progression: number;
  image: string;
  adventureTitle: string;
  texte: string;
}

export default function StorySection({
  progression,
  image,
  adventureTitle,
  texte,
}: StorySectionProps) {
  return (
    <>
      {/* Progression bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">
            Progression de l&apos;histoire
          </span>
          <span className="text-gray-400 text-sm">{progression}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700"
            style={{ width: `${progression}%` }}
          />
        </div>
      </div>

      {/* Image */}
      <div className="relative w-full h-96 rounded-xl overflow-hidden">
        <Image
          src={image}
          alt={adventureTitle}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b15]/50 to-transparent" />
      </div>

      {/* Story text */}
      {texte && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[#070b15] border border-gray-800/60 rounded-xl p-6"
        >
          <p className="text-gray-300 leading-relaxed text-base">{texte}</p>
        </motion.div>
      )}
    </>
  );
}
