"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import Header from "@/components/shared/Header";
import Loader from "@/components/shared/Loader";
import { ExtendedUserProfile, UserStats, UserSave, UserCreation } from "@/types";

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"stories" | "achievements" | "creations">("stories");
  
  // États pour les données réelles
  const [userProfile, setUserProfile] = useState<ExtendedUserProfile | null>(null);
  const [userSaves, setUserSaves] = useState<UserSave[]>([]);
  const [userCreations, setUserCreations] = useState<UserCreation[]>([]);
  const [stats, setStats] = useState<UserStats>({
    storiesPlayed: 0,
    storiesCreated: 0,
    likes: 0,
    trophies: 0,
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
        // Charger les données du profil
        await loadUserData(session.user);
      }
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const loadUserData = async (currentUser: User) => {
    try {
      // Récupérer le profil utilisateur depuis la table utilisateur
      const { data: profileData } = await supabase
        .from("utilisateur")
        .select("*")
        .eq("id_utilisateur", currentUser.id)
        .single();

      if (profileData) {
        setUserProfile({
          id_utilisateur: profileData.id_utilisateur,
          nom_utilisateur: profileData.nom_utilisateur || currentUser.user_metadata?.username || currentUser.email?.split("@")[0] || "Aventurier",
          email: profileData.email || currentUser.email || "",
          date_creation: profileData.date_creation || currentUser.created_at || "",
          role: profileData.role || "joueur",
          niveau: profileData.niveau || 1,
          experience: profileData.experience || 0,
        });
      } else {
        // Si pas de données en BDD, utiliser les métadonnées Supabase Auth
        setUserProfile({
          id_utilisateur: 0,
          nom_utilisateur: currentUser.user_metadata?.username || currentUser.email?.split("@")[0] || "Aventurier",
          email: currentUser.email || "",
          date_creation: currentUser.created_at || "",
          role: "joueur",
          niveau: 1,
          experience: 0,
        });
      }

      // Récupérer les sauvegardes de l'utilisateur (histoires jouées)
      const { data: savesData } = await supabase
        .from("sauvegarde")
        .select(`
          id_sauvegarde,
          id_utilisateur,
          id_aventure,
          id_personnage,
          id_embranchement_actuel,
          progression,
          date_sauvegarde,
          aventure:id_aventure (
            titre
          )
        `)
        .eq("id_utilisateur", currentUser.id);

      if (savesData && savesData.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedSaves: UserSave[] = savesData.map((save: any) => ({
          id: String(save.id_sauvegarde),
          id_utilisateur: save.id_utilisateur,
          id_aventure: save.id_aventure,
          id_personnage: save.id_personnage,
          id_embranchement_actuel: save.id_embranchement_actuel,
          progression: save.progression || 0,
          date_sauvegarde: save.date_sauvegarde,
          aventure_titre: save.aventure?.titre || "Aventure inconnue",
          status: save.progression >= 100 ? "completed" as const : "in-progress" as const,
        }));
        setUserSaves(formattedSaves);
      }

      // Récupérer les aventures créées par l'utilisateur
      const { data: creationsData } = await supabase
        .from("aventure")
        .select("id_aventure, titre, popularite")
        .eq("auteur_id", currentUser.id);

      if (creationsData && creationsData.length > 0) {
        setUserCreations(creationsData.map((c: { id_aventure: number; titre: string; popularite: number }) => ({
          id: c.id_aventure,
          titre: c.titre,
          popularite: c.popularite || 0,
        })));
      }

      // Récupérer les votes (likes) donnés par l'utilisateur
      const { count: votesCount } = await supabase
        .from("vote")
        .select("id_vote", { count: "exact" })
        .eq("id_utilisateur", currentUser.id);

      // Mettre à jour les statistiques
      setStats({
        storiesPlayed: savesData?.length || 0,
        storiesCreated: creationsData?.length || 0,
        likes: votesCount || 0,
        trophies: 0, // Pas de système de trophées pour l'instant
      });

    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    }
  };

  const getUserInitials = () => {
    const username = userProfile?.nom_utilisateur || user?.user_metadata?.username || user?.email?.split("@")[0] || "U";
    const parts = username.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

  // Calcul du niveau et de l'expérience
  const currentLevel = userProfile?.niveau || 1;
  const currentExperience = userProfile?.experience || 0;
  const maxExperience = currentLevel * 1000; // 1000 XP par niveau
  const experiencePercentage = maxExperience > 0 ? (currentExperience / maxExperience) * 100 : 0;

  const getStatusBadge = (status: string) => {
    if (status === "completed") {
      return (
        <span className="px-3 py-1 text-xs font-medium rounded-full border border-cyan-500/50 text-cyan-400 bg-cyan-500/10">
          Complétée
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-xs font-medium rounded-full border border-cyan-500/50 text-cyan-400 bg-cyan-500/10">
        En cours
      </span>
    );
  };

  if (loading) {
    return <Loader fullScreen message="Chargement de votre profil..." />;
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col">
      <Header />

      {/* Contenu principal */}
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar Profil - Gauche */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-[#0d1526] border border-gray-700/50 rounded-2xl p-6">
                {/* Avatar */}
                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-cyan-500 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg shadow-cyan-500/30">
                    {getUserInitials()}
                  </div>
                  <h2 className="text-xl font-bold text-white">{userProfile?.nom_utilisateur || "Aventurier"}</h2>
                  <p className="text-gray-400 text-sm">Niveau {currentLevel}</p>
                </div>

                {/* Barre d'expérience */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Expérience</span>
                    <span className="text-gray-400">{currentExperience.toLocaleString()} / {maxExperience.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${experiencePercentage}%` }}
                    />
                  </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">{stats.storiesPlayed}</div>
                    <div className="text-xs text-gray-400">Histoires</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">{stats.storiesCreated}</div>
                    <div className="text-xs text-gray-400">Créées</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">{stats.likes}</div>
                    <div className="text-xs text-gray-400">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">{stats.trophies}</div>
                    <div className="text-xs text-gray-400">Trophées</div>
                  </div>
                </div>

                {/* Boutons */}
                <div className="space-y-3">
                  <button className="w-full py-3 px-4 bg-[#1a2235] border border-gray-600/50 rounded-lg text-white font-medium hover:bg-[#1f2940] transition-colors flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Modifier le profil
                  </button>
                  <button className="w-full py-3 px-4 bg-[#1a2235] border border-gray-600/50 rounded-lg text-white font-medium hover:bg-[#1f2940] transition-colors flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Paramètres
                  </button>
                </div>
              </div>
            </div>

            {/* Contenu Principal - Droite */}
            <div className="flex-1">
              <div className="bg-[#0d1526] border border-gray-700/50 rounded-2xl overflow-hidden">
                {/* Onglets */}
                <div className="flex border-b border-gray-700/50">
                  <button
                    onClick={() => setActiveTab("stories")}
                    className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                      activeTab === "stories"
                        ? "bg-[#1a2a40] text-cyan-400 border-b-2 border-cyan-400"
                        : "text-gray-400 hover:text-white hover:bg-[#151f30]"
                    }`}
                  >
                    Mes Histoires
                  </button>
                  <button
                    onClick={() => setActiveTab("achievements")}
                    className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                      activeTab === "achievements"
                        ? "bg-[#1a2a40] text-cyan-400 border-b-2 border-cyan-400"
                        : "text-gray-400 hover:text-white hover:bg-[#151f30]"
                    }`}
                  >
                    Réalisations
                  </button>
                  <button
                    onClick={() => setActiveTab("creations")}
                    className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                      activeTab === "creations"
                        ? "bg-[#1a2a40] text-cyan-400 border-b-2 border-cyan-400"
                        : "text-gray-400 hover:text-white hover:bg-[#151f30]"
                    }`}
                  >
                    Créations
                  </button>
                </div>

                {/* Contenu des onglets */}
                <div className="p-6">
                  {activeTab === "stories" && (
                    <div className="space-y-4">
                      {userSaves.length > 0 ? (
                        userSaves.map((save) => (
                          <div
                            key={save.id}
                            className="bg-[#151f30] border border-gray-700/30 rounded-xl p-5 hover:border-cyan-500/30 transition-all cursor-pointer"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="text-lg font-semibold text-white">{save.aventure_titre}</h3>
                              {getStatusBadge(save.status)}
                            </div>
                            <div className="mb-2">
                              <span className="text-sm text-gray-400">Progression : {save.progression}%</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  save.status === "completed"
                                    ? "bg-gradient-to-r from-cyan-500 to-green-500"
                                    : "bg-gradient-to-r from-cyan-500 to-blue-500"
                                }`}
                                style={{ width: `${save.progression}%` }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-2">Aucune histoire jouée</h3>
                          <p className="text-gray-400 mb-4">Commencez une aventure pour voir votre progression ici.</p>
                          <button 
                            onClick={() => router.push("/dashboard")}
                            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
                          >
                            Découvrir les aventures
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "achievements" && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">Aucune réalisation</h3>
                      <p className="text-gray-400">Vos trophées et badges apparaîtront ici quand vous les débloquerez.</p>
                    </div>
                  )}

                  {activeTab === "creations" && (
                    <div className="space-y-4">
                      {userCreations.length > 0 ? (
                        userCreations.map((creation) => (
                          <div
                            key={creation.id}
                            className="bg-[#151f30] border border-gray-700/30 rounded-xl p-5 hover:border-cyan-500/30 transition-all cursor-pointer"
                          >
                            <div className="flex justify-between items-start">
                              <h3 className="text-lg font-semibold text-white">{creation.titre}</h3>
                              <div className="flex items-center gap-1 text-cyan-400">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                                <span className="text-sm">{creation.popularite}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-2">Aucune création</h3>
                          <p className="text-gray-400 mb-4">Créez votre première aventure pour la voir apparaître ici.</p>
                          <button 
                            onClick={() => router.push("/create")}
                            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
                          >
                            Créer une aventure
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
