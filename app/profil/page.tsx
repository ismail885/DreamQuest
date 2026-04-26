"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/shared/Header";
import BottomNav from "@/components/shared/BottomNav";
import Loader from "@/components/shared/Loader";
import { ExtendedUserProfile, UserStats, UserSave, UserCreation, Character } from "@/types";
import { useTheme } from "@/hooks/useTheme";
import { useAuthContext } from "@/context/AuthContext";
import { calculateAchievements, UserAchievements } from "@/lib/achievements";
import { getDailyQuests, DailyQuest, getTotalXPReward } from "@/lib/dailyQuests";
import * as LucideIcons from "lucide-react";

export default function ProfilPage() {
  const router = useRouter();
  const { user, loading: authLoading, updateUser, logout } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"stories" | "achievements" | "creations" | "quests" | "characters">("stories");
  
  const [userProfile, setUserProfile] = useState<ExtendedUserProfile | null>(null);
  const [userSaves, setUserSaves] = useState<UserSave[]>([]);
  const [userCreations, setUserCreations] = useState<UserCreation[]>([]);
  const [userCharacters, setUserCharacters] = useState<Character[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievements | null>(null);
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([]);
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

  const loadSettings = () => {
    if (!user) return;
    const notif = localStorage.getItem(`dq_settings_${user.id}_notifications`);
    const sound = localStorage.getItem(`dq_settings_${user.id}_soundEffects`);
    if (notif) setNotifications(JSON.parse(notif));
    if (sound) setSoundEffects(JSON.parse(sound));
  };

  useEffect(() => { if (user) loadSettings(); }, [user]);

  const toggleNotifications = () => {
    const newVal = !notifications;
    setNotifications(newVal);
    if (user) localStorage.setItem(`dq_settings_${user.id}_notifications`, JSON.stringify(newVal));
  };

  const toggleSoundEffects = () => {
    const newVal = !soundEffects;
    setSoundEffects(newVal);
    if (user) localStorage.setItem(`dq_settings_${user.id}_soundEffects`, JSON.stringify(newVal));
  };

  const { isDark: darkMode, toggleTheme } = useTheme();
  const [language, setLanguage] = useState("fr");
  const [settingsMessage, setSettingsMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const settingsLoadedRef = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    loadUserData(user.id).then(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id, router]);

  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden && user?.id) {
        loadUserData(user.id);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    const handleFocus = () => {
      if (user?.id) {
        loadUserData(user.id);
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Rafraichir les donnees quand on change d'onglet
  useEffect(() => {
    if (activeTab === "achievements" && user?.id) {
      loadUserData(user.id);
    }
    if (activeTab === "characters" && user?.id) {
      loadUserData(user.id);
    }
    if (activeTab === "stories" && user?.id) {
      loadUserData(user.id);
    }
    if (activeTab === "quests" && user?.id) {
      loadUserData(user.id);
    }
  }, [activeTab, user?.id]);

  // Rafraichir quand on revient sur la page (tab/window refocus)
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden && user?.id) {
        loadUserData(user.id);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [user?.id]);

  // Rafraichir les realisations quand on affiche l'onglet
  useEffect(() => {
    if (activeTab === "achievements" && user?.id) {
      loadUserData(user.id);
    }
    if (activeTab === "characters" && user?.id) {
      loadUserData(user.id);
    }
    if (activeTab === "stories" && user?.id) {
      loadUserData(user.id);
    }
    if (activeTab === "quests" && user?.id) {
      loadUserData(user.id);
    }
  }, [activeTab]);

  // Rafraichir les stats quand la page devient visible
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden && user?.id) {
        loadUserData(user.id);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [user?.id]);

  const loadUserData = async (userId: number) => {
    try {
      const questData = getDailyQuests(userId);
      setDailyQuests(questData.quests);

      const { data: profileData } = await supabase
        .from("utilisateur")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileData) {
        setUserProfile({
          id: profileData.id,
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
          id,
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
          id: save.id,
          id_utilisateur: save.id_utilisateur,
          id_aventure: save.id_aventure,
          id_personnage: save.id_personnage,
          id_embranchement_actuel: save.id_embranchement_actuel,
          progression: save.progression ?? 0,
          date_sauvegarde: save.date_sauvegarde,
          aventure_titre: save.aventure?.titre || "Aventure inconnue",
          status: (save.progression ?? 0) >= 100 ? "completed" as const : "in-progress" as const,
        }));
        setUserSaves(formattedSaves);
      } else {
        setUserSaves([]);
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

      const { count: charactersCount } = await supabase
        .from("personnage")
        .select("id_personnage", { count: "exact" })
        .eq("id_utilisateur", userId);

      // Fetch user characters
      const { data: charactersData } = await supabase
        .from("personnage")
        .select("*")
        .eq("id_utilisateur", userId)
        .order("date_creation", { ascending: false });

      if (charactersData) {
        setUserCharacters(charactersData);
      }

      setStats({
        storiesPlayed: savesData?.length || 0,
        storiesCreated: creationsData?.length || 0,
        likes: votesCount || 0,
        trophies: 0,
      });

      // Calculate achievements
      const achievements = calculateAchievements({
        storiesPlayed: savesData?.length || 0,
        charactersCreated: charactersCount || 0,
        votes: votesCount || 0,
        storiesCreated: creationsData?.length || 0,
        totalLikes: creationsData?.reduce((sum, c) => sum + (c.popularite || 0), 0) || 0,
        level: profileData?.niveau || 1,
      });
      setUserAchievements(achievements);

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
      if (!user || settingsLoadedRef.current) return;
      settingsLoadedRef.current = true;

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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
        .eq("id", user.id);

      if (profileError) {
        const { error: insertError } = await supabase
          .from("utilisateur")
          .upsert({
            id: user.id,
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
        <span className="px-3 py-1 text-xs font-medium rounded-full border border-green-500/50 text-green-400 bg-green-500/10">
          Complétée
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-xs font-medium rounded-full border border-orange-500/50 text-orange-400 bg-orange-500/10">
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

      <main className="flex-1 container mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-[#0d1526] border border-gray-700/50 rounded-xl lg:rounded-2xl p-4 md:p-6">
                <div className="flex flex-col items-center mb-4 md:mb-6">
                  <div className="w-16 md:w-24 h-16 md:h-24 rounded-full bg-cyan-500 flex items-center justify-center text-white text-2xl md:text-3xl font-bold mb-3 md:mb-4 shadow-lg shadow-cyan-500/30">
                    {getUserInitials()}
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-white">{userProfile?.nom_utilisateur || "Aventurier"}</h2>
                  <p className="text-gray-400 text-sm">Niveau {currentLevel} • Rang +{Math.floor(currentLevel * 3 + stats.likes / 100)}</p>
                  <a href={`/profil/${userProfile?.nom_utilisateur}`} className="text-cyan-400 text-sm hover:underline mt-2">
                    Voir profil public
                  </a>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Expérience</span>
                    <span className="text-red-400 font-semibold">{currentExperience.toLocaleString()} / {maxExperience.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 to-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${experiencePercentage}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-2 bg-gray-800/30 rounded-lg">
                    <div className="text-2xl font-bold text-cyan-400">{stats.storiesPlayed}</div>
                    <div className="text-xs text-gray-400">Histoires</div>
                  </div>
                  <div className="text-center p-2 bg-gray-800/30 rounded-lg">
                    <div className="text-2xl font-bold text-cyan-400">{stats.storiesCreated}</div>
                    <div className="text-xs text-gray-400">Créées</div>
                  </div>
                  <div className="text-center p-2 bg-gray-800/30 rounded-lg">
                    <div className="text-2xl font-bold text-cyan-400">{stats.likes}</div>
                    <div className="text-xs text-gray-400">Likes</div>
                  </div>
                  <div className="text-center p-2 bg-gray-800/30 rounded-lg">
                    <div className="text-2xl font-bold text-cyan-400">{stats.trophies}</div>
                    <div className="text-xs text-gray-400">Trophées</div>
                  </div>
                </div>

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

            <div className="flex-1">
              <div className="bg-[#0d1526] border border-gray-700/50 rounded-2xl overflow-hidden">
                <div className="flex border-b border-gray-700/50 bg-[#0a0e1a]">
                  <button
                    onClick={() => setActiveTab("stories")}
                    className={`flex-1 py-4 px-6 text-sm font-medium transition-all ${
                      activeTab === "stories"
                        ? "bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-400"
                        : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/20"
                    }`}
                  >
                    Mes Histoires
                  </button>
                  <button
                    onClick={() => setActiveTab("achievements")}
                    className={`flex-1 py-4 px-6 text-sm font-medium transition-all ${
                      activeTab === "achievements"
                        ? "bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-400"
                        : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/20"
                    }`}
                  >
                    Réalisations
                  </button>
                  <button
                    onClick={() => setActiveTab("quests")}
                    className={`flex-1 py-4 px-6 text-sm font-medium transition-all ${
                      activeTab === "quests"
                        ? "bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-400"
                        : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/20"
                    }`}
                  >
                    Quêtes
                  </button>
                  <button
                    onClick={() => setActiveTab("characters")}
                    className={`flex-1 py-4 px-6 text-sm font-medium transition-all ${
                      activeTab === "characters"
                        ? "bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-400"
                        : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/20"
                    }`}
                  >
                    Mes Persos
                  </button>
                </div>

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
                    <div className="space-y-4">
                      {userAchievements ? (
                        <>
                          <div className="text-center mb-6">
                            <div className="text-3xl font-bold text-cyan-400">{userAchievements.totalUnlocked}</div>
                            <div className="text-gray-400 text-sm">réalisations débloquées</div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {userAchievements.achievements.map((achievement) => {
                              const iconName = achievement.icon;
                              const iconClass = `w-6 h-6 ${achievement.unlocked ? "text-cyan-400" : "text-gray-500"}`;
                              return (
                                <div
                                  key={achievement.id}
                                  className={`p-4 rounded-xl border ${
                                    achievement.unlocked
                                      ? "bg-cyan-500/10 border-cyan-500/30"
                                      : "bg-gray-800/30 border-gray-700/30 opacity-50"
                                  }`}
                                >
                                  <div className="mb-2">
                                    {iconName === 'BookOpen' && <LucideIcons.BookOpen className={iconClass} />}
                                    {iconName === 'Medal' && <LucideIcons.Medal className={iconClass} />}
                                    {iconName === 'Award' && <LucideIcons.Award className={iconClass} />}
                                    {iconName === 'UserPlus' && <LucideIcons.UserPlus className={iconClass} />}
                                    {iconName === 'Users' && <LucideIcons.Users className={iconClass} />}
                                    {iconName === 'ThumbsUp' && <LucideIcons.ThumbsUp className={iconClass} />}
                                    {iconName === 'MessageSquare' && <LucideIcons.MessageSquare className={iconClass} />}
                                    {iconName === 'Edit3' && <LucideIcons.Edit3 className={iconClass} />}
                                    {iconName === 'Star' && <LucideIcons.Star className={iconClass} />}
                                    {iconName === 'TrendingUp' && <LucideIcons.TrendingUp className={iconClass} />}
                                    {iconName === 'Zap' && <LucideIcons.Zap className={iconClass} />}
                                    {iconName === 'Moon' && <LucideIcons.Moon className={iconClass} />}
                                    {iconName === 'Compass' && <LucideIcons.Compass className={iconClass} />}
                                    {!['BookOpen', 'Medal', 'Award', 'UserPlus', 'Users', 'ThumbsUp', 'MessageSquare', 'Edit3', 'Star', 'TrendingUp', 'Zap', 'Moon', 'Compass'].includes(iconName) && <LucideIcons.HelpCircle className={iconClass} />}
                                  </div>
                                  <h4 className={`font-semibold ${achievement.unlocked ? "text-white" : "text-gray-500"}`}>
                                    {achievement.title}
                                  </h4>
                                  <p className={`text-xs ${achievement.unlocked ? "text-gray-400" : "text-gray-600"}`}>
                                    {achievement.description}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : (
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

                  {activeTab === "quests" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">Quêtes du jour</h3>
                        <span className="text-cyan-400 font-bold">+{getTotalXPReward({ quests: dailyQuests, lastReset: "" })} XP</span>
                      </div>
                      {dailyQuests.length > 0 ? (
                        dailyQuests.map((quest) => {
                          const percent = Math.round((quest.progress / quest.target) * 100);
                          return (
                            <div
                              key={quest.id}
                              className={`p-4 rounded-xl border ${
                                quest.completed
                                  ? "bg-green-500/10 border-green-500/30"
                                  : "bg-[#151f30] border-gray-700/30"
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  {quest.completed && (
                                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                  <h4 className={`font-semibold ${quest.completed ? "text-green-400" : "text-white"}`}>
                                    {quest.title}
                                  </h4>
                                </div>
                                <span className="text-yellow-400 text-sm">+{quest.xpReward} XP</span>
                              </div>
                              <p className="text-gray-400 text-sm mb-2">{quest.description}</p>
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Progression</span>
                                <span>{quest.progress} / {quest.target}</span>
                              </div>
                              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    quest.completed
                                      ? "bg-green-500"
                                      : "bg-gradient-to-r from-cyan-500 to-blue-500"
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-gray-400">Chargement des quêtes...</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "characters" && (
                    <div className="space-y-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() => router.push("/create-character")}
                          className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Nouveau Personnage
                        </button>
                      </div>
                      {userCharacters.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {userCharacters.map((char) => (
                            <div
                              key={char.id}
                              className="bg-[#151f30] border border-gray-700/30 rounded-xl p-5 hover:border-cyan-500/30 transition-all"
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xl font-bold flex-shrink-0">
                                  {char.nom_personnage?.charAt(0).toUpperCase() || "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-lg font-semibold text-white truncate">{char.nom_personnage}</h3>
                                  <p className="text-gray-400 text-sm">{char.classe}</p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                    <span>Niveau {char.niveau || 1}</span>
                                    <span>{char.points_vie || 100} PV</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-4">
                                <button
                                  onClick={() => router.push(`/adventure?personnage=${char.id}`)}
                                  className="flex-1 py-2 px-3 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors text-sm font-medium"
                                >
                                  Jouer
                                </button>
                                <button
                                  onClick={() => router.push(`/profil/personnage/${char.id}`)}
                                  className="flex-1 py-2 px-3 bg-[#1a2235] border border-gray-600/30 text-gray-300 rounded-lg hover:bg-[#1f2940] transition-colors text-sm font-medium"
                                >
                                  Détails
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-2">Aucun personnage</h3>
                          <p className="text-gray-400 mb-4">Creez votre premier personnage pour commencer l&apos;aventure.</p>
                          <button
                            onClick={() => router.push("/create-character")}
                            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
                          >
                            Créer un personnage
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

      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeSettingsModal}
          />
          
          <div className="relative bg-[#0d1526] border border-gray-700/50 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl shadow-cyan-500/10 animate-in fade-in zoom-in duration-200">
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

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#1a2235] rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="text-white">Notifications</span>
                </div>
                <button
                  onClick={toggleNotifications}
                  className={`relative w-12 h-6 rounded-full transition-colors ${notifications ? 'bg-cyan-500' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#1a2235] rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  <span className="text-white">Effets sonores</span>
                </div>
                <button
                  onClick={toggleSoundEffects}
                  className={`relative w-12 h-6 rounded-full transition-colors ${soundEffects ? 'bg-cyan-500' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${soundEffects ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

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

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeEditModal}
          />
          
          <div className="relative bg-[#0d1526] border border-gray-700/50 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl shadow-cyan-500/10 animate-in fade-in zoom-in duration-200">
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

            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-cyan-500/30">
                {editUsername ? editUsername.substring(0, 2).toUpperCase() : getUserInitials()}
              </div>
            </div>

            <div className="space-y-4">
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
      <BottomNav />
    </div>
  );
}
