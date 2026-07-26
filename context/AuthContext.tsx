"use client";

import React, {
 createContext,
 useContext,
 useState,
 useEffect,
 ReactNode,
} from "react";
import { hasSupabaseClientConfig, supabase } from "@/lib/supabaseClient";


interface User {
 id: number;
 email: string;
 username: string;
 role: string;
}

interface AuthContextType {
 user: User | null;
 loading: boolean;
 login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
 register: (username: string, email: string, password: string) => Promise<{ success: boolean; message?: string; error?: string }>;
 loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithDiscord: () => Promise<{ success: boolean; error?: string }>;
 logout: () => Promise<void>;
 updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const setAuthSession = async (): Promise<void> => {
 try {
 const { data: { session } } = await supabase.auth.getSession();
 if (!session?.access_token) return;
 await fetch('/api/auth/session', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ accessToken: session.access_token }),
 });
 } catch (err) {
 console.error("[Auth] Erreur setAuthSession:", err);
 }
};

const clearAuthSession = async (): Promise<void> => {
 try {
 await fetch('/api/auth/session', { method: 'DELETE' });
 } catch (err) {
 console.error("[Auth] Erreur clearAuthSession:", err);
 }
};

const fetchUserFromAuthId = async (authId: string): Promise<User | null> => {
 try {
 const { data: userData } = await supabase
 .from("utilisateur")
 .select("id, nom_utilisateur, email, role")
 .eq("auth_id", authId)
 .maybeSingle();

 if (!userData) return null;

 return {
 id: userData.id,
 username: userData.nom_utilisateur,
 email: userData.email,
 role: userData.role,
 };
 } catch (err) {
 console.error("[Auth] Erreur fetchUserFromAuthId:", err);
 return null;
 }
};

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
 const [user, setUser] = useState<User | null>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 if (!hasSupabaseClientConfig()) {
 setUser(null);
 setLoading(false);
 return;
 }

 let mounted = true;

 // Vérification initiale (indispensable — l'event INITIAL_SESSION ne se déclenche pas toujours)
 const init = async () => {
 try {
 const { data: { session } } = await supabase.auth.getSession();
 if (!mounted) return;
 if (session?.user) {
 const loggedUser = await fetchUserFromAuthId(session.user.id);
 if (!mounted) return;
 if (loggedUser) {
 // Affiche la page immédiatement ; synchro du cookie en arrière-plan
 setUser(loggedUser);
 setLoading(false);
 setAuthSession();
 } else {
 setUser(null);
 setLoading(false);
 }
 } else {
 setUser(null);
 setLoading(false);
 clearAuthSession();
 }
 } catch (err) {
 console.error("[Auth] Erreur init:", err);
 if (mounted) {
 setUser(null);
 setLoading(false);
 }
 }
 };
 init();

 const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
 if (event === "INITIAL_SESSION") return;
 // Différé hors du callback : évite l'interblocage du verrou supabase-auth.
 setTimeout(() => {
 (async () => {
 switch (event) {
 case "SIGNED_IN":
 case "TOKEN_REFRESHED":
 if (session?.user) {
 const loggedUser = await fetchUserFromAuthId(session.user.id);
 if (loggedUser) {
 setUser(loggedUser);
 setAuthSession();
 }
 }
 setLoading(false);
 break;

 case "SIGNED_OUT":
 setUser(null);
 setLoading(false);
 clearAuthSession();
 break;
 }
 })();
 }, 0);
 });

 return () => {
 mounted = false;
 subscription.unsubscribe();
 };
 }, []);

 const login = async (email: string, password: string) => {
 if (!hasSupabaseClientConfig()) {
 return { success: false, error: "Variables Supabase manquantes dans l'environnement" };
 }

 try {
 const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
 if (authError || !authData.user) {
 return { success: false, error: "Identifiant ou mot de passe incorrect" };
 }

 const loggedUser = await fetchUserFromAuthId(authData.user.id);
 if (!loggedUser) {
 return { success: false, error: "Utilisateur introuvable" };
 }

 await setAuthSession();
 setUser(loggedUser);
 return { success: true };
 } catch (error) {
 console.error("[Auth] Erreur login:", error);
 return { success: false, error: "Erreur de connexion" };
 }
 };

 const register = async (username: string, email: string, password: string) => {
 if (!hasSupabaseClientConfig()) {
 return { success: false, error: "Variables Supabase manquantes dans l'environnement" };
 }

 try {
 const { data: existingEmail } = await supabase
 .from("utilisateur")
 .select("id")
 .eq("email", email)
 .maybeSingle();
 if (existingEmail) {
 return { success: false, error: "Cet email est déjà utilisé" };
 }

 const { data: existingUsername } = await supabase
 .from("utilisateur")
 .select("id")
 .eq("nom_utilisateur", username)
 .maybeSingle();
 if (existingUsername) {
 return { success: false, error: "Ce pseudo est déjà utilisé" };
 }

 const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
 if (authError || !authData.user) {
 return { success: false, error: authError?.message || "Erreur lors de la création du compte" };
 }

  const { error: insertError } = await supabase.from("utilisateur").insert({
    nom_utilisateur: username,
    email,
    role: "joueur",
    auth_id: authData.user.id,
  });

 if (insertError) {
 return { success: false, error: "Erreur lors de la création du compte : " + insertError.message };
 }

 return { success: true, message: "Compte créé avec succès" };
 } catch (error) {
 console.error("[Auth] Erreur register:", error);
 return { success: false, error: "Erreur d'inscription" };
 }
 };

 const loginWithGoogle = async () => {
 if (!hasSupabaseClientConfig()) {
 return { success: false, error: "Variables Supabase manquantes dans l'environnement" };
 }

 try {
 const { error } = await supabase.auth.signInWithOAuth({
 provider: "google",
 options: { redirectTo: `${window.location.origin}/auth/callback` },
 });
 if (error) {
 return { success: false, error: "Erreur de connexion avec Google" };
 }
 return { success: true };
 } catch {
 return { success: false, error: "Erreur de connexion avec Google" };
 }
 };

  const loginWithDiscord = async () => {
  if (!hasSupabaseClientConfig()) {
  return { success: false, error: "Variables Supabase manquantes dans l'environnement" };
  }

  try {
  const { error } = await supabase.auth.signInWithOAuth({
  provider: "discord",
  options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) {
  return { success: false, error: "Erreur de connexion avec Discord" };
  }
  return { success: true };
  } catch {
  return { success: false, error: "Erreur de connexion avec Discord" };
  }
  };

 const logout = async () => {
 if (!hasSupabaseClientConfig()) {
 setUser(null);
 return;
 }

 try {
 await supabase.auth.signOut();
 await clearAuthSession();
 setUser(null);
 } catch (error) {
 console.error("[Auth] Erreur logout:", error);
 }
 };

 const updateUser = (updates: Partial<User>) => {
 setUser((prev) => (prev ? { ...prev, ...updates } : prev));
 };

  return (
 <AuthContext.Provider
 value={{
 user,
 loading,
 login,
 register,
  loginWithGoogle,
  loginWithDiscord,
  logout,
 updateUser,
 }}
 >
 {children}
 </AuthContext.Provider>
 );
}

export function useAuthContext() {
 const context = useContext(AuthContext);
 if (context === undefined) {
 throw new Error("useAuthContext doit être utilisé dans un AuthProvider");
 }
 return context;
}
