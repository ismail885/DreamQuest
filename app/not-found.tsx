import Link from "next/link";

export default function Notfound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Lueur ambiante */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="text-center max-w-md">
        {/* Code 404 stylisé */}
        <div className="mb-6">
          <p className="text-[120px] font-extrabold leading-none bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            404
          </p>
        </div>

        {/* Message immersif */}
        <h1 className="text-2xl font-bold text-white mb-3">
          Région inconnue
        </h1>
        <p className="text-gray-400 leading-relaxed mb-8">
          Cette page semble avoir été dévorée par un dragon numérique. 
          Le royaume que vous cherchez n&apos;existe pas ou a été déplacé.
        </p>

        {/* Bouton de retour */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-lg transition-all duration-200 text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Retourner à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
