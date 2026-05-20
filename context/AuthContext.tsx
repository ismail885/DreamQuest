"use client";

import React, {
 createContext,
 useContext,
 useState,
 useEffect,
 useCallback,
 ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";

// ============================================
// Types
// ============================================

interface User {
 id: number;
 email: string;
 username: string;
 role: string;
}

interface AuthContextType {
 user: User | null;
 loading: boolean;
 login: (emailOrUsername: string, password: string) => Promise<{ success: boolean; error?: string }>;
 register: (username: string, email: string, password: string) => Promise<{ success: boolean; message?: string; error?: string }>;
 loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
 loginWithApple: () => Promise<{ success: boolean; error?: string }>;
 logout: () => Promise<void>;
 checkAuth: () => Promise<void>;
 updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// Helpers cookies
// ============================================

const setAuthSession = async (userData: User): Promise<void> => {
 try {
 await fetch('/api/auth/session', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 userId: String(userData.id),
 email: userData.email,
 username: userData.username,
 role: userData.role,
 }),
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

// ============================================
// Helper: récupérer les infos utilisateur depuis Supabase
// ============================================

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

// ============================================
// Provider
// ============================================

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
 const [user, setUser] = useState<User | null>(null);
 const [loading, setLoading] = useState(true);

 // Synchronisation utilisateur depuis Supabase Auth
 const syncUser = useCallback(async () => {
 const { data: { session } } = await supabase.auth.getSession();
 if (session?.user) {
 const loggedUser = await fetchUserFromAuthId(session.user.id);
 if (loggedUser) {
 await setAuthSession(loggedUser);
 setUser(loggedUser);
 } else {
 setUser(null);
 }
 } else {
 await clearAuthSession();
 setUser(null);
 }
 setLoading(false);
 }, []);

 // Vérification initiale
 const checkAuth = useCallback(async () => {
 await syncUser();
 }, [syncUser]);

 useEffect(() => {
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
 await setAuthSession(loggedUser);
 setUser(loggedUser);
 } else {
 setUser(null);
 }
 } else {
 await clearAuthSession();
 setUser(null);
 }
 } catch (err) {
 console.error("[Auth] Erreur init:", err);
 if (mounted) setUser(null);
 } finally {
 if (mounted) setLoading(false);
 }
 };
 init();

 const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
 if (event === "INITIAL_SESSION") return; 
 switch (event) {
 case "SIGNED_IN":
 case "TOKEN_REFRESHED":
 if (session?.user) {
 const loggedUser = await fetchUserFromAuthId(session.user.id);
 if (loggedUser) {
 await setAuthSession(loggedUser);
 setUser(loggedUser);
 }
 }
 setLoading(false);
 break;

 case "SIGNED_OUT":
 await clearAuthSession();
 setUser(null);
 setLoading(false);
 break;
 }
 });

 return () => {
 mounted = false;
 subscription.unsubscribe();
 };
 }, []);

 // ==========================================
 // Login
 // ==========================================

 const login = async (emailOrUsername: string, password: string) => {
 try {
 let email = emailOrUsername;
 if (!emailOrUsername.includes("@")) {
 const { data: found } = await supabase
 .from("utilisateur")
 .select("email")
 .eq("nom_utilisateur", emailOrUsername)
 .maybeSingle();
 if (!found) {
 return { success: false, error: "Identifiant ou mot de passe incorrect" };
 }
 email = found.email;
 }

 const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
 if (authError || !authData.user) {
 return { success: false, error: "Identifiant ou mot de passe incorrect" };
 }

 const loggedUser = await fetchUserFromAuthId(authData.user.id);
 if (!loggedUser) {
 return { success: false, error: "Utilisateur introuvable" };
 }

 await setAuthSession(loggedUser);
 setUser(loggedUser);
 return { success: true };
 } catch (error) {
 console.error("[Auth] Erreur login:", error);
 return { success: false, error: "Erreur de connexion" };
 }
 };

 // ==========================================
 // Register
 // ==========================================

 const register = async (username: string, email: string, password: string) => {
 try {
 // Vérifier unicité email
 const { data: existingEmail } = await supabase
 .from("utilisateur")
 .select("id")
 .eq("email", email)
 .maybeSingle();
 if (existingEmail) {
 return { success: false, error: "Cet email est déjà utilisé" };
 }

 // Vérifier unicité pseudo
 const { data: existingUsername } = await supabase
 .from("utilisateur")
 .select("id")
 .eq("nom_utilisateur", username)
 .maybeSingle();
 if (existingUsername) {
 return { success: false, error: "Ce pseudo est déjà utilisé" };
 }

 // Création du compte Supabase Auth
 const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
 if (authError || !authData.user) {
 return { success: false, error: authError?.message || "Erreur lors de la création du compte" };
 }

 // Insertion dans la table utilisateur
 const { error: insertError } = await supabase.from("utilisateur").insert({
 nom_utilisateur: username,
 email,
 mot_de_passe: null,
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

 // ==========================================
 // OAuth
 // ==========================================

 const loginWithGoogle = async () => {
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

 const loginWithApple = async () => {
 return { success: false, error: "Apple Sign-In non disponible sur navigateur" };
 };

 // ==========================================
 // Logout
 // ==========================================

 const logout = async () => {
 try {
 await supabase.auth.signOut();
 await clearAuthSession();
 setUser(null);
 } catch (error) {
 console.error("[Auth] Erreur logout:", error);
 }
 };

 // ==========================================
 // updateUser
 // ==========================================

 const updateUser = (updates: Partial<User>) => {
 setUser((prev) => (prev ? { ...prev, ...updates } : prev));
 };

 // ==========================================
 // Render
 // ==========================================

 return (
 <AuthContext.Provider
 value={{
 user,
 loading,
 login,
 register,
 loginWithGoogle,
 loginWithApple,
 logout,
 checkAuth,
 updateUser,
 }}
 >
 {children}
 </AuthContext.Provider>
 );
}

// ==========================================
// Hook personnalisé (à utiliser de préférence)
// ==========================================

export function useAuthContext() {
 const context = useContext(AuthContext);
 if (context === undefined) {
 throw new Error("useAuthContext doit être utilisé dans un AuthProvider");
 }
 return context;
}

