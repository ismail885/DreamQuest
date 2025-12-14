import Link from "next/link";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-6 overflow-hidden">
        {/* Background effects avec glow bleu/cyan */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-transparent pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center space-y-6 md:space-y-8">
            {/* Badge RPG Textuel Interactif avec étoile */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500/10 border border-cyan-400/30 rounded-full text-cyan-400 text-sm font-medium backdrop-blur-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              RPG Textuel Interactif
            </div>

            {/* Main Title - Vivez Votre Propre Aventure */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              <span className="text-white">Vivez Votre Propre</span>
              <span className="block mt-2 text-cyan-400">
                Aventure
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Créez votre personnage unique, explorez des mondes fantastiques et prenez des décisions qui façonneront votre destin. Chaque choix compte dans DreamQuest.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link
                href="/create-character"
                className="px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-lg transition-all duration-200 w-full sm:w-auto"
              >
                Créer un Personnage
              </Link>
              
              <Link
                href="/adventures"
                className="px-8 py-3.5 bg-transparent border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-semibold rounded-lg transition-all duration-200 w-full sm:w-auto"
              >
                Explorer les Quêtes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - 3 sections d'information */}
      <section className="py-16 md:py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Feature 1 - Personnages Uniques */}
            <div className="p-8 bg-[#1a1f2e]/50 border border-gray-800 rounded-xl hover:border-cyan-500/30 transition-all duration-300">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">
                  Personnages Uniques
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Créez des héros avec 10 classes différentes, chacune avec ses capacités et son histoire.
                </p>
              </div>
            </div>

            {/* Feature 2 - Histoires Immersives */}
            <div className="p-8 bg-[#1a1f2e]/50 border border-gray-800 rounded-xl hover:border-cyan-500/30 transition-all duration-300">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">
                  Histoires Immersives
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Plongez dans des récits à embranchements multiples où chaque décision compte.
                </p>
              </div>
            </div>

            {/* Feature 3 - Classements */}
            <div className="p-8 bg-[#1a1f2e]/50 border border-gray-800 rounded-xl hover:border-cyan-500/30 transition-all duration-300">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">
                  Classements
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Comparez vos exploits avec d&apos;autres aventuriers et grimpez dans les rangs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
