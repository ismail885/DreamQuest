import Link from "next/link";
import Header from "@/components/shared/Header";
import { Cookie, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Politique des cookies - DreamQuest",
  description: "Politique des cookies de DreamQuest - RPG textuel interactif",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070b15]">
      <Header />
      <main className="flex-1 container mx-auto px-4 md:px-6 py-12 max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Retour à l&apos;accueil</span>
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Cookie className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-bold text-white">Politique des cookies</h1>
        </div>

        <div className="space-y-8">
          <p className="text-gray-400">Dernière mise à jour : Mai 2026</p>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
            <p className="text-gray-400 leading-relaxed">Un cookie est un petit fichier texte déposé sur votre navigateur lors de la visite d&apos;un site web. Il permet de stocker des informations relatives à votre navigation.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Cookies utilises par DreamQuest</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm text-gray-400">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 pr-4 text-white">Nom</th>
                    <th className="text-left py-2 pr-4 text-white">Type</th>
                    <th className="text-left py-2 pr-4 text-white">Duree</th>
                    <th className="text-left py-2 text-white">Finalité</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800">
                    <td className="py-2 pr-4 font-mono text-cyan-400">auth_token</td>
                    <td className="py-2 pr-4">Necessaire</td>
                    <td className="py-2 pr-4">1 heure</td>
                    <td className="py-2">Authentification et session</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Cookies tiers</h2>
            <p className="text-gray-400 leading-relaxed">DreamQuest n&apos;utilise aucun cookie tiers (Google Analytics, Facebook, publicité, etc.). Seul le cookie d&apos;authentification est déposé.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Gestion des cookies</h2>
            <p className="text-gray-400 leading-relaxed">Vous pouvez configurer votre navigateur pour accepter ou refuser les cookies. Notez que le refus du cookie d&apos;authentification vous empêchera de vous connecter.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Sécurité</h2>
            <p className="text-gray-400 leading-relaxed">Le cookie auth_token est marqué comme HttpOnly (non accessible via JavaScript) et Secure (transmis uniquement en HTTPS en production) pour garantir la sécurité de votre session.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
