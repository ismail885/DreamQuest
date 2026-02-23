"use client";

import { use } from "react";
import Link from "next/link";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import Loader from "@/components/shared/Loader";
import { useAdventure } from "@/hooks/useAdventure";

interface AdventurePageProps {
  params: Promise<{ id: string }>;
}

export default function AdventureDetailPage({ params }: AdventurePageProps) {
  const { id } = use(params);
  const adventureId = parseInt(id, 10);

  const { adventure, currentBranch, loading, error, isEnd, history, chooseOption, restart } =
    useAdventure(adventureId);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 relative">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl opacity-20 pointer-events-none" />

        <div className="container mx-auto px-6 py-12 relative z-10 max-w-3xl">
          {/* Back link */}
          <Link
            href="/adventure"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-8 group"
          >
            <svg
              className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux aventures
          </Link>

          {loading && (
            <div className="flex justify-center py-32">
              <Loader />
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-20 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-2">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-400 text-lg font-semibold">{error}</p>
              <Link href="/adventure" className="inline-block mt-4 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-medium transition-colors">
                Voir toutes les aventures
              </Link>
            </div>
          )}

          {!loading && !error && adventure && currentBranch && (
            <div className="space-y-8">
              {/* Adventure header */}
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-white">{adventure.titre}</h1>
                {adventure.description && (
                  <p className="text-gray-400">{adventure.description}</p>
                )}
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Étape {history.length}</span>
                </div>
              </div>

              {/* Story text */}
              <div className="bg-[#0f1322] border border-gray-800/50 rounded-xl p-6 md:p-8 shadow-lg">
                <p className="text-gray-200 text-lg leading-relaxed whitespace-pre-wrap">
                  {currentBranch.texte}
                </p>
              </div>

              {/* Choices or End */}
              {isEnd ? (
                <div className="text-center space-y-6 py-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                    <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Aventure terminée !</h2>
                    <p className="text-gray-400">Vous avez atteint la fin de cette histoire en {history.length} étape{history.length > 1 ? "s" : ""}.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                      onClick={restart}
                      className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-semibold transition-colors shadow-lg shadow-cyan-500/20"
                    >
                      Recommencer
                    </button>
                    <Link
                      href="/adventure"
                      className="px-8 py-3 bg-[#0f1322] border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white rounded-lg font-semibold transition-colors"
                    >
                      Autres aventures
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                    Que faites-vous ?
                  </h3>
                  <div className="grid gap-3">
                    {currentBranch.choix1 && currentBranch.choix1_lien && (
                      <button
                        onClick={() => chooseOption(currentBranch.choix1_lien)}
                        className="group w-full text-left px-6 py-4 bg-[#0f1322] border border-gray-800/50 hover:border-cyan-500/50 rounded-xl text-gray-200 hover:text-white transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-0.5"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm group-hover:bg-cyan-500/20 transition-colors">
                            1
                          </span>
                          <span className="leading-relaxed">{currentBranch.choix1}</span>
                        </div>
                      </button>
                    )}
                    {currentBranch.choix2 && currentBranch.choix2_lien && (
                      <button
                        onClick={() => chooseOption(currentBranch.choix2_lien)}
                        className="group w-full text-left px-6 py-4 bg-[#0f1322] border border-gray-800/50 hover:border-purple-500/50 rounded-xl text-gray-200 hover:text-white transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-0.5"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm group-hover:bg-purple-500/20 transition-colors">
                            2
                          </span>
                          <span className="leading-relaxed">{currentBranch.choix2}</span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Progress indicator */}
              {history.length > 1 && (
                <div className="flex items-center gap-1 pt-2">
                  {history.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full flex-1 transition-colors ${
                        i === history.length - 1 ? "bg-cyan-500" : "bg-gray-700"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
