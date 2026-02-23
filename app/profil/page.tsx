"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/shared/Header";
import Loader from "@/components/shared/Loader";
import { ExtendedUserProfile, UserStats, UserSave, UserCreation } from "@/types";
import { useTheme } from "@/hooks/useTheme";
import { useAuthContext } from "@/context/AuthContext";

export default function ProfilPage() {
  const router = useRouter();
  const { user, loading: authLoading, updateUser, logout } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"stories" | "achievements" | "creations">("stories");
  
  const [userProfile, setUserProfile] = useState<ExtendedUserProfile | null>(null);
  const [userSaves, setUserSaves] = useState<UserSave[]>([]);
  const [userCreations, setUserCreations] = useState<UserCreation[]>([]);
  const [stats, setStats] = useState<UserStats>({
    storiesPlayed: 0,
    storiesCreated: 0,
    likes: 0,
    trophies: 0,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const { isDark: darkMode, toggleTheme } = useTheme();
  const [language, setLanguage] = useState("fr");
  const [settingsMessage, setSettingsMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    loadUserData(user.id).then(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id, router]);

  const loadUserData = async (userId: number) => {
    try {
      const { data: profileData } = await supabase
        .from("utilisateur")
        .select("*")
        .eq("id_utilisateur", userId)
        .single();

      if (profileData) {
        setUserProfile({
          id: profileData.id_utilisateur,
          nom_utilisateur: profileData.nom_utilisateur || user?.username || "Aventurier",
          email: profileData.email || user?.email || "",
          date_creation: profileData.date_creation || "",
          role: profileData.role || "joueur",
          niveau: profileData.niveau || 1,
          experience: profileData.experience || 0,
        });
      } else {
        setUserProfile({
          id: userId,
          nom_utilisateur: user?.username || "Aventurier",
          email: user?.email || "",
          date_creation: "",
          role: "joueur",
          niveau: 1,
          experience: 0,
        });
      }

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
        .eq("id_utilisateur", userId);

      if (savesData && savesData.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedSaves: UserSave[] = savesData.map((save: any) => ({
          id: save.id_sauvegarde,
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

      const { data: creationsData } = await supabase
        .from("aventure")
        .select("id_aventure, titre, popularite")
        .eq("auteur_id", userId);

      if (creationsData && creationsData.length > 0) {
        setUserCreations(creationsData.map((c: { id_aventure: number; titre: string; popularite: number }) => ({
          id: c.id_aventure,
          titre: c.titre,
          popularite: c.popularite || 0,
        })));
      }

      const { count: votesCount } = await supabase
        .from("vote")
        .select("id_vote", { count: "exact" })
        .eq("id_utilisateur", userId);

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
    const username = userProfile?.nom_utilisateur || user?.username || "U";
    const parts = username.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

  const currentLevel = userProfile?.niveau || 1;
  const currentExperience = userProfile?.experience || 0;
  const maxExperience = currentLevel * 1000; // 1000 XP par niveau
  const experiencePercentage = maxExperience > 0 ? (currentExperience / maxExperience) * 100 : 0;

  const openEditModal = () => {
    setEditUsername(userProfile?.nom_utilisateur || "");
    setEditEmail(userProfile?.email || "");
    setSaveMessage(null);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSaveMessage(null);
  };

  const openSettingsModal = () => {
    setSettingsMessage(null);
    setIsSettingsModalOpen(true);
  };

  const closeSettingsModal = () => {
    setIsSettingsModalOpen(false);
    setSettingsMessage(null);
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    
    setIsSavingSettings(true);
    setSettingsMessage(null);

    try {
      await supabase
        .from("parametre_utilisateur")
        .upsert({
          id_utilisateur: user.id,
          notifications,
          effets_sonores: soundEffects,
          mode_sombre: darkMode,
          langue: language,
          date_modification: new Date().toISOString(),
        }, {
          onConflict: "id_utilisateur"
        });

      // Le thème est déjà persisté en localStorage par le ThemeContext
      setSettingsMessage({ type: "success", text: "Paramètres sauvegardés !" });
      
      setTimeout(() => {
        closeSettingsModal();
      }, 1500);
    } catch {
      setSettingsMessage({ type: "error", text: "Erreur lors de la sauvegarde." });
    } finally {
      setIsSavingSettings(false);
    }
  };

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from("parametre_utilisateur")
          .select("*")
          .eq("id_utilisateur", user.id)
          .single();

        if (data) {
          setNotifications(data.notifications ?? true);
          setSoundEffects(data.effets_sonores ?? true);
          const savedDark = data.mode_sombre ?? true;
          if (savedDark !== darkMode) toggleTheme();
          setLanguage(data.langue ?? "fr");
        }
      } catch {
        // Table non encore créée, on utilise les valeurs par défaut
      }
    };

    loadSettings();
  }, [user, darkMode, toggleTheme]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const { error: profileError } = await supabase
        .from("utilisateur")
        .update({
          nom_utilisateur: editUsername,
          email: editEmail,
        })
        .eq("id_utilisateur", user.id);

      if (profileError) {
        const { error: insertError } = await supabase
          .from("utilisateur")
          .upsert({
            id_utilisateur: user.id,
            nom_utilisateur: editUsername,
            email: editEmail,
          });

        if (insertError) throw insertError;
      }

      setUserProfile(prev => prev ? {
        ...prev,
        nom_utilisateur: editUsername,
        email: editEmail,
      } : null);

      setSaveMessage({ type: "success", text: "Profil mis à jour avec succès !" });
      updateUser({ username: editUsername, email: editEmail });
      
      setTimeout(() => {
        closeEditModal();
      }, 1500);

    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      setSaveMessage({ type: "error", text: "Erreur lors de la mise à jour du profil." });
    } finally {
      setIsSaving(false);
    }
  };

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
                  <button 
                    onClick={openEditModal}
                    className="w-full py-3 px-4 bg-[#1a2235] border border-gray-600/50 rounded-lg text-white font-medium hover:bg-[#1f2940] transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Modifier le profil
                  </button>
                  <button 
                    onClick={openSettingsModal}
                    className="w-full py-3 px-4 bg-[#1a2235] border border-gray-600/50 rounded-lg text-white font-medium hover:bg-[#1f2940] transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Paramètres
                  </button>
                  <button
                    onClick={async () => { await logout(); router.push("/"); }}
                    className="w-full py-3 px-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 font-medium hover:bg-red-500/20 hover:border-red-500/50 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Se déconnecter
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

      {/* Modal des paramètres */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeSettingsModal}
          />
          
          {/* Contenu de la modal */}
          <div className="relative bg-[#0d1526] border border-gray-700/50 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl shadow-cyan-500/10 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Paramètres
              </h3>
              <button
                onClick={closeSettingsModal}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Options */}
            <div className="space-y-4">
              {/* Notifications */}
              <div className="flex items-center justify-between p-4 bg-[#1a2235] rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="text-white">Notifications</span>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${notifications ? 'bg-cyan-500' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Effets sonores */}
              <div className="flex items-center justify-between p-4 bg-[#1a2235] rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  <span className="text-white">Effets sonores</span>
                </div>
                <button
                  onClick={() => setSoundEffects(!soundEffects)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${soundEffects ? 'bg-cyan-500' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${soundEffects ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Mode sombre */}
              <div className="flex items-center justify-between p-4 bg-[#1a2235] rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span className="text-white">Mode sombre</span>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-cyan-500' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Langue */}
              <div className="p-4 bg-[#1a2235] rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <span className="text-white">Langue</span>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0d1526] border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>

              {/* Message de feedback */}
              {settingsMessage && (
                <div className={`p-3 rounded-lg text-sm ${
                  settingsMessage.type === "success" 
                    ? "bg-green-500/20 border border-green-500/50 text-green-400"
                    : "bg-red-500/20 border border-red-500/50 text-red-400"
                }`}>
                  {settingsMessage.text}
                </div>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeSettingsModal}
                className="flex-1 py-3 px-4 bg-[#1a2235] border border-gray-600/50 rounded-lg text-gray-300 font-medium hover:bg-[#1f2940] hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="flex-1 py-3 px-4 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isSavingSettings ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Sauvegarder
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification du profil */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeEditModal}
          />
          
          {/* Contenu de la modal */}
          <div className="relative bg-[#0d1526] border border-gray-700/50 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl shadow-cyan-500/10 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Modifier le profil
              </h3>
              <button
                onClick={closeEditModal}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Avatar preview */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-cyan-500/30">
                {editUsername ? editUsername.substring(0, 2).toUpperCase() : getUserInitials()}
              </div>
            </div>

            {/* Formulaire */}
            <div className="space-y-4">
              {/* Nom d'utilisateur */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom d&apos;utilisateur
                </label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a2235] border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  placeholder="Votre nom d'utilisateur"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a2235] border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  placeholder="Votre email"
                />
              </div>

              {/* Message de feedback */}
              {saveMessage && (
                <div className={`p-3 rounded-lg text-sm ${
                  saveMessage.type === "success" 
                    ? "bg-green-500/20 border border-green-500/50 text-green-400"
                    : "bg-red-500/20 border border-red-500/50 text-red-400"
                }`}>
                  {saveMessage.text}
                </div>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeEditModal}
                className="flex-1 py-3 px-4 bg-[#1a2235] border border-gray-600/50 rounded-lg text-gray-300 font-medium hover:bg-[#1f2940] hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving || !editUsername.trim()}
                className="flex-1 py-3 px-4 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Sauvegarder
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
