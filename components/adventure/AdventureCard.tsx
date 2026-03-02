import Link from "next/link";

interface AdventureCardProps {
  id: number;
  titre: string;
  description: string | null;
  popularite: number;
  personnageId?: string;
}

export default function AdventureCard({
  id,
  titre,
  description,
  popularite,
  personnageId,
}: AdventureCardProps) {
  const href = personnageId
    ? `/adventure/${id}?personnage=${personnageId}`
    : `/adventure/${id}`;

  return (
    <Link
      href={href}
      className="group relative bg-[#0f1322] rounded-xl overflow-hidden border border-gray-800/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1"
    >
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white font-semibold text-lg line-clamp-1 group-hover:text-cyan-400 transition-colors">
            {titre}
          </h3>
          <div className="flex items-center gap-1 text-yellow-400 flex-shrink-0">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium">{popularite}</span>
          </div>
        </div>

        <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
          {description ?? "Aucune description disponible."}
        </p>
      </div>
    </Link>
  );
}
