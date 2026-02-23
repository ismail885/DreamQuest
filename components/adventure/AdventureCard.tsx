import Link from "next/link";
import Image from "next/image";

interface AdventureCardProps {
  id: number;
  title: string;
  description: string;
  image: string;
  rating: number;
  genre: string;
  ageRange: string;
  players: number;
  personnageId?: string;
}

export default function AdventureCard({
  id,
  title,
  description,
  image,
  rating,
  genre,
  ageRange,
  players,
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
      {/* Image */}
      <div className="relative h-40 w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1322] to-transparent opacity-60"></div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title and Rating */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white font-semibold text-lg line-clamp-1 group-hover:text-cyan-400 transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-1 text-yellow-400 flex-shrink-0">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium">{rating}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-400/30 rounded-md text-cyan-400 text-xs font-medium">
            {genre}
          </span>
          <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-400/30 rounded-md text-blue-400 text-xs font-medium">
            {ageRange}
          </span>
        </div>

        {/* Players */}
        <div className="flex items-center gap-1.5 text-gray-500 text-sm pt-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          <span>{players} joueurs</span>
        </div>
      </div>
    </Link>
  );
}
