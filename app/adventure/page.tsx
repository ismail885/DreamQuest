"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import BottomNav from "@/components/shared/BottomNav";
import PageBackground from "@/components/shared/PageBackground";
import PageTransition from "@/components/shared/PageTransition";
import { User } from "lucide-react";

export default function AdventurePage() {
  return (
    <Suspense>
      <AdventurePageContent />
    </Suspense>
  );
}

function AdventurePageContent() {
  const searchParams = useSearchParams();
  const personnageId = searchParams.get("personnage");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 relative pb-24 md:pb-0">
        <PageBackground />

        <PageTransition className="container mx-auto px-4 md:px-6 py-8 md:py-12 relative z-10">
          <div className="text-center space-y-3 md:space-y-4 mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
              Explorez les Aventures
            </h1>
            <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto ">
              Choisissez votre prochaine aventure parmi nos histoires épiques
            </p>
          </div>

          {personnageId && (
            <div className="max-w-4xl mx-auto mb-6 md:mb-8">
              <div className="flex items-center gap-3 px-4 md:px-5 py-3 md:py-3.5 bg-[rgba(6,182,212,0.1)] border border-[rgba(6,182,212,0.3)] rounded-[10px]">
                <div className="w-8 h-8 rounded-full bg-[rgba(6,182,212,0.2)] flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <p className="text-[#5eead4] text-sm">
                  Personnage sélectionné — choisissez une aventure pour
                  commencer !
                </p>
              </div>
            </div>
          )}
        </PageTransition>
      </main>

      <BottomNav />
      <Footer />
    </div>
  );
}
