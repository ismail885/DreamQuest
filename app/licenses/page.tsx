import Link from "next/link";
import Header from "@/components/shared/Header";
import { BookOpen, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Licences - DreamQuest",
  description: "Licences open source utilisees par DreamQuest",
};

export default function LicensesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070b15]">
      <Header />
      <main className="flex-1 container mx-auto px-4 md:px-6 py-12 max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Retour a l&apos;accueil</span>
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-bold text-white">Licences</h1>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Licence du projet</h2>
            <p className="text-gray-400 leading-relaxed">DreamQuest est un projet open source. Le code source est disponible sur GitHub et peut etre consulte, modifie et distribue conformement aux termes de la licence applicabile.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Bibliotheques utilisees</h2>
            <p className="text-gray-400 mb-3">DreamQuest utilise les bibliotheques open source suivantes :</p>
            <div className="space-y-4">
              {[
                { name: "Next.js", license: "MIT", url: "https://github.com/vercel/next.js" },
                { name: "React", license: "MIT", url: "https://github.com/facebook/react" },
                { name: "Supabase JS", license: "MIT", url: "https://github.com/supabase/supabase-js" },
                { name: "Lucide React", license: "ISC", url: "https://github.com/lucide-icons/lucide" },
                { name: "Framer Motion", license: "MIT", url: "https://github.com/framer/motion" },
                { name: "bcryptjs", license: "MIT", url: "https://github.com/dcodeIO/bcrypt.js" },
                { name: "jose", license: "MIT", url: "https://github.com/panva/jose" },
                { name: "Zod", license: "MIT", url: "https://github.com/colinhacks/zod" },
              ].map((lib) => (
                <div key={lib.name} className="flex items-center justify-between p-3 rounded-lg border border-gray-800 bg-gray-900/50">
                  <a href={lib.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline font-medium">
                    {lib.name}
                  </a>
                  <span className="text-sm text-gray-500">{lib.license}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Mentions de licence</h2>
            <p className="text-gray-400 leading-relaxed">
              Toutes les bibliotheques mentionnees ci-dessus sont distribuees sous leurs licences respectives.
              Les licences completes sont disponibles dans les repertoires de chaque projet sur GitHub.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contenu utilisateur</h2>
            <p className="text-gray-400 leading-relaxed">
              Les aventures et personnages crees par les utilisateurs restent leur propriete intellectuelle.
              En les publiant sur DreamQuest, les utilisateurs accordent une licence d&apos;utilisation non exclusive
              permettant leur affichage et leur partage au sein de la plateforme.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
