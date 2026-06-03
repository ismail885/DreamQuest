"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/components/shared/Header";
import BottomNav from "@/components/shared/BottomNav";
import PageBackground from "@/components/shared/PageBackground";
import Loader from "@/components/shared/Loader";
import { useAuthContext } from "@/context/AuthContext";
import { useProfileData } from "@/hooks/useProfileData";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import SettingsModal from "@/components/profile/SettingsModal";
import EditProfileModal from "@/components/profile/EditProfileModal";
import TabStories from "@/components/profile/TabStories";
import TabAchievements from "@/components/profile/TabAchievements";
import TabCreations from "@/components/profile/TabCreations";
import TabQuests from "@/components/profile/TabQuests";
import TabCharacters from "@/components/profile/TabCharacters";

function getTabFromUrl():
  | "stories"
  | "achievements"
  | "creations"
  | "quests"
  | "characters" {
  if (typeof window === "undefined") return "stories";
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab");
  if (
    tab === "achievements" ||
    tab === "creations" ||
    tab === "quests" ||
    tab === "characters"
  )
    return tab;
  return "stories";
}

export default function ProfilPage() {
  const router = useRouter();
  const { user, loading: authLoading, updateUser, logout } = useAuthContext();
  const [activeTab, setActiveTab] = useState<
    "stories" | "achievements" | "creations" | "quests" | "characters"
  >(getTabFromUrl);

  const {
    loading,
    dataError,
    userProfile,
    userSaves,
    userCreations,
    userCharacters,
    userAchievements,
    dailyQuests,
    stats,
    refresh,
  } = useProfileData({ userId: user?.id ?? null });
  const {
    pullDistance,
    pullState,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = usePullToRefresh(refresh);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const loadSettings = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("parametre_utilisateur")
      .select("notifications, langue")
      .eq("id_utilisateur", user.id)
      .maybeSingle();

    if (data) {
      setNotifications(data.notifications ?? true);
      if (data.langue) setLanguage(data.langue);
    }
  }, [user]);

  const settingsLoadedRef = useRef(false);
  useEffect(() => {
    if (user && !settingsLoadedRef.current) {
      settingsLoadedRef.current = true;
      loadSettings();
    }
  }, [user, loadSettings]);

  const toggleNotifications = () => {
    const newVal = !notifications;
    setNotifications(newVal);
    if (user) {
      supabase
        .from("parametre_utilisateur")
        .upsert(
          { id_utilisateur: user.id, notifications: newVal },
          { onConflict: "id_utilisateur" },
        )
        .then();
    }
  };

  const [language, setLanguage] = useState("fr");
  const [settingsMessage, setSettingsMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  const getUserInitials = () => {
    const username = userProfile?.nom_utilisateur || user?.username || "U";
    const parts = username.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

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
      if (user) {
        await supabase
          .from("parametre_utilisateur")
          .upsert(
            { id_utilisateur: user.id, notifications, langue: language },
            { onConflict: "id_utilisateur" },
          );
      }
      setSettingsMessage({ type: "success", text: "Paramètres sauvegardés !" });

      setTimeout(() => {
        closeSettingsModal();
      }, 1500);
    } catch {
      setSettingsMessage({
        type: "error",
        text: "Erreur lors de la sauvegarde.",
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const { error: updateError } = await supabase
        .from("utilisateur")
        .update({
          nom_utilisateur: editUsername,
          email: editEmail,
        })
        .eq("id", user.id);

      if (updateError) {
        if (
          updateError.code === "23505" ||
          updateError.message?.includes("duplicate") ||
          updateError.message?.includes("unique")
        ) {
          setSaveMessage({
            type: "error",
            text: "Cet email est déjà utilisé par un autre compte.",
          });
        } else {
          setSaveMessage({
            type: "error",
            text: "Erreur lors de la mise à jour du profil.",
          });
        }
        setIsSaving(false);
        return;
      }

      refresh();
      setSaveMessage({
        type: "success",
        text: "Profil mis à jour avec succès !",
      });
      updateUser({ username: editUsername, email: editEmail });

      setTimeout(() => {
        closeEditModal();
      }, 1500);
    } catch {
      setSaveMessage({
        type: "error",
        text: "Erreur lors de la mise à jour du profil.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <Loader fullScreen message="Chargement de votre profil..." />;
  }

  return (
    <div className="min-h-screen text-white flex flex-col bg-deep">
      <PageBackground />

      <Header />

      <main
        className="flex-1 container mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-8 relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {pullState !== "idle" && (
          <div
            className="absolute top-0 left-0 right-0 z-30 flex items-center justify-center overflow-hidden transition-all duration-200"
            style={{ height: pullDistance }}
          >
            {pullState === "refreshing" ? (
              <Loader size="sm" message="" />
            ) : (
              <div
                className={`transition-transform duration-150 ${pullDistance >= 55 ? "rotate-180" : ""}`}
              >
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
            )}
          </div>
        )}
        <div className="max-w-6xl mx-auto">
          {dataError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {dataError}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <ProfileSidebar
              userProfile={userProfile}
              stats={stats}
              getUserInitials={getUserInitials}
              openEditModal={openEditModal}
              openSettingsModal={openSettingsModal}
              logout={logout}
            />

            <div className="flex-1">
              <div className="backdrop-blur-[10px] bg-[rgba(15,23,42,0.6)] border border-[rgba(6,182,212,0.2)] rounded-[10px] overflow-hidden">
                <div className="flex overflow-x-auto flex-nowrap border-b border-[rgba(6,182,212,0.15)] bg-[rgba(6,182,212,0.03)] scrollbar-thin">
                  <button
                    onClick={() => setActiveTab("stories")}
                    className={`flex-shrink-0 py-4 px-6 text-sm font-medium transition-all ${
                      activeTab === "stories"
                        ? "text-primary border-b-2 border-primary"
                        : "text-gray-400 hover:text-white hover:bg-[rgba(6,182,212,0.05)]"
                    }`}
                  >
                    Mes Histoires
                  </button>
                  <button
                    onClick={() => setActiveTab("achievements")}
                    className={`flex-shrink-0 py-4 px-6 text-sm font-medium transition-all ${
                      activeTab === "achievements"
                        ? "text-primary border-b-2 border-primary"
                        : "text-gray-400 hover:text-white hover:bg-[rgba(6,182,212,0.05)]"
                    }`}
                  >
                    Réalisations
                  </button>
                  <button
                    onClick={() => setActiveTab("creations")}
                    className={`flex-shrink-0 py-4 px-6 text-sm font-medium transition-all ${
                      activeTab === "creations"
                        ? "text-primary border-b-2 border-primary"
                        : "text-gray-400 hover:text-white hover:bg-[rgba(6,182,212,0.05)]"
                    }`}
                  >
                    Mes Créations
                  </button>
                  <button
                    onClick={() => setActiveTab("quests")}
                    className={`flex-shrink-0 py-4 px-6 text-sm font-medium transition-all ${
                      activeTab === "quests"
                        ? "text-primary border-b-2 border-primary"
                        : "text-gray-400 hover:text-white hover:bg-[rgba(6,182,212,0.05)]"
                    }`}
                  >
                    Quêtes
                  </button>
                  <button
                    onClick={() => setActiveTab("characters")}
                    className={`flex-shrink-0 py-4 px-6 text-sm font-medium transition-all ${
                      activeTab === "characters"
                        ? "text-primary border-b-2 border-primary"
                        : "text-gray-400 hover:text-white hover:bg-[rgba(6,182,212,0.05)]"
                    }`}
                  >
                    Mes Persos
                  </button>
                </div>

                <div className="p-6">
                  <AnimatePresence mode="wait">
                    {activeTab === "stories" && (
                      <motion.div
                        key="stories"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TabStories saves={userSaves} />
                      </motion.div>
                    )}
                    {activeTab === "achievements" && (
                      <motion.div
                        key="achievements"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TabAchievements achievements={userAchievements} />
                      </motion.div>
                    )}
                    {activeTab === "creations" && (
                      <motion.div
                        key="creations"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TabCreations creations={userCreations} />
                      </motion.div>
                    )}
                    {activeTab === "quests" && (
                      <motion.div
                        key="quests"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TabQuests quests={dailyQuests} loading={loading} />
                      </motion.div>
                    )}
                    {activeTab === "characters" && (
                      <motion.div
                        key="characters"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TabCharacters characters={userCharacters} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={closeSettingsModal}
        notifications={notifications}
        onToggleNotifications={toggleNotifications}
        language={language}
        onLanguageChange={setLanguage}
        isSavingSettings={isSavingSettings}
        settingsMessage={settingsMessage}
        onSave={handleSaveSettings}
      />

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        editUsername={editUsername}
        onEditUsernameChange={setEditUsername}
        editEmail={editEmail}
        onEditEmailChange={setEditEmail}
        onSave={handleSaveProfile}
        isSaving={isSaving}
        saveMessage={saveMessage}
        getUserInitials={getUserInitials}
      />
      <BottomNav />
    </div>
  );
}
