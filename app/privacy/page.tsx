import Link from "next/link";
import Header from "@/components/shared/Header";
import { Shield, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Politique de confidentialité - DreamQuest",
  description: "Politique de confidentialité de DreamQuest - RPG textuel interactif",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070b15]">
      <Header />
      <main className="flex-1 container mx-auto px-4 md:px-6 py-12 max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Retour à l&apos;accueil</span>
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-bold text-white">Politique de confidentialité</h1>
        </div>

        <div className="space-y-8">
          <p className="text-gray-400">Dernière mise à jour : Mai 2026</p>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Données collectées</h2>
            <p className="text-gray-400 leading-relaxed">DreamQuest collecte les données suivantes lors de votre inscription :</p>
            <ul className="text-gray-400 space-y-2 mt-2 ml-4 list-disc">
              <li>Adresse e-mail</li>
              <li>Nom d&apos;utilisateur (pseudo)</li>
              <li>Données de jeu (personnages, aventures, sauvegardes, votes)</li>
              <li>Identifiant de session (cookie JWT)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Utilisation des données</h2>
            <p className="text-gray-400 leading-relaxed">Vos données sont utilisées exclusivement pour :</p>
            <ul className="text-gray-400 space-y-2 mt-2 ml-4 list-disc">
              <li>Gérer votre compte et votre authentification</li>
              <li>Sauvegarder votre progression dans les aventures</li>
              <li>Afficher les classements et statistiques</li>
              <li>Améliorer l&apos;expérience utilisateur</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Hébergement des données</h2>
            <p className="text-gray-400 leading-relaxed">Les données sont hébergées par Supabase (PostgreSQL), infrastructure conforme au RGPD. Aucune donnée n&apos;est vendue ou partagée avec des tiers.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Vos droits</h2>
            <p className="text-gray-400 leading-relaxed">Conformement au RGPD, vous disposez des droits suivants :</p>
            <ul className="text-gray-400 space-y-2 mt-2 ml-4 list-disc">
              <li><strong className="text-white">Acces</strong> : consulter vos donnees personnelles</li>
              <li><strong className="text-white">Rectification</strong> : modifier vos informations</li>
              <li><strong className="text-white">Suppression</strong> : demander la suppression de votre compte</li>
              <li><strong className="text-white">Portabilite</strong> : exporter vos donnees</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Cookies</h2>
            <p className="text-gray-400 leading-relaxed">DreamQuest utilise un cookie d&apos;authentification (auth_token) necessaire au fonctionnement du site. Ce cookie est HttpOnly, Secure en production, et expire apres 1 heure.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Contact</h2>
            <p className="text-gray-400 leading-relaxed">
              Pour toute question relative à la confidentialité, contactez-nous via GitHub :{' '}
              <a href="https://github.com/ismail885/DreamQuest" className="text-cyan-400 hover:underline">
                github.com/ismail885/DreamQuest
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
