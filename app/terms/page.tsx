import Link from "next/link";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import PageBackground from "@/components/shared/PageBackground";
import { FileText, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Conditions d'utilisation - DreamQuest",
  description: "Conditions d'utilisation de DreamQuest - RPG textuel interactif",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-deep">
      <Header />
      <PageBackground />
      <main className="flex-1 container mx-auto px-4 md:px-6 py-12 max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Retour à l&apos;accueil</span>
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <FileText className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-bold text-white">Conditions d&apos;utilisation</h1>
        </div>

        <div className="space-y-8">
          <p className="text-gray-400">Dernière mise à jour : Mai 2026</p>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Objet</h2>
            <p className="text-gray-400 leading-relaxed">Les présentes conditions d&apos;utilisation régissent l&apos;accès et l&apos;utilisation de l&apos;application DreamQuest, un jeu de rôle textuel interactif.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Acceptation des conditions</h2>
            <p className="text-gray-400 leading-relaxed">L&apos;inscription et l&apos;utilisation du service impliquent l&apos;acceptation pleine et entière de ces conditions. Si vous n&apos;acceptez pas ces conditions, vous ne devez pas utiliser le service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Inscription et compte</h2>
            <p className="text-gray-400 leading-relaxed">L&apos;inscription est gratuite et nécessite une adresse e-mail valide. Chaque utilisateur est responsable de la confidentialité de ses identifiants. Un seul compte par personne est autorisé.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Règles de conduite</h2>
            <p className="text-gray-400 leading-relaxed">Les utilisateurs s&apos;engagent à :</p>
            <ul className="text-gray-400 space-y-2 mt-2 ml-4 list-disc">
              <li>Ne pas publier de contenu illicite, diffamatoire ou offensant</li>
              <li>Ne pas tricher ou exploiter des failles du systeme</li>
              <li>Ne pas tenter de perturber le fonctionnement du service</li>
              <li>Respecter les autres joueurs et leurs creations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Propriété intellectuelle</h2>
            <p className="text-gray-400 leading-relaxed">Le code source de DreamQuest est disponible sous licence open source. Les aventures créées par les utilisateurs restent leur propriété, mais sont visibles publiquement sur la plateforme.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Suspension et suppression</h2>
            <p className="text-gray-400 leading-relaxed">DreamQuest se réserve le droit de suspendre ou supprimer un compte en cas de non-respect des présentes conditions, sans préavis.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Limitation de responsabilité</h2>
            <p className="text-gray-400 leading-relaxed">DreamQuest est fourni &quot;tel quel&quot;. Les développeurs ne sauraient être tenus responsables des dommages directs ou indirects résultant de l&apos;utilisation du service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Modification des conditions</h2>
            <p className="text-gray-400 leading-relaxed">DreamQuest se réserve le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des changements significatifs.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
