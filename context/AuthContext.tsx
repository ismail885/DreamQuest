"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';

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

const USER_STORAGE_KEY = 'dreamquest_user';

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: userData, error: dbError } = await supabase
          .from('utilisateur')
          .select('id, nom_utilisateur, email, role')
          .eq('auth_id', session.user.id)
          .maybeSingle();

        if (userData) {
          const loggedUser: User = {
            id: userData.id,
            username: userData.nom_utilisateur,
            email: userData.email,
            role: userData.role,
          };
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser));
          document.cookie = `auth_user=1; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
          document.cookie = `auth_role=${loggedUser.role}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
          setUser(loggedUser);
        } else {
          if (dbError) console.warn('checkAuth DB error:', dbError.message);
          const stored = localStorage.getItem(USER_STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            // Nettoyer l'ID au cas ou il serait mal formate
            if (parsed.id && String(parsed.id).includes(':')) {
              parsed.id = parseInt(String(parsed.id).split(':')[0], 10);
              localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(parsed));
            }
            setUser(parsed);
          } else {
            setUser(null);
          }
        }
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
        document.cookie = 'auth_user=; path=/; max-age=0; SameSite=Strict';
        document.cookie = 'auth_role=; path=/; max-age=0; SameSite=Strict';
        setUser(null);
      }
    } catch (error) {
      console.error('Erreur verification auth:', error);
      // En cas d'erreur réseau, garder l'utilisateur du localStorage
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
      else setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Lire la session immédiatement pour éviter le flash loading=false/user=null
    checkAuth();

    // 2. Écouter les changements de session suivants (login, logout, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: userData } = await supabase
          .from('utilisateur')
          .select('id, nom_utilisateur, email, role')
          .eq('auth_id', session.user.id)
          .maybeSingle();

        if (userData) {
          const loggedUser: User = {
            id: userData.id,
            username: userData.nom_utilisateur,
            email: userData.email,
            role: userData.role,
          };
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser));
          document.cookie = `auth_user=1; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
          document.cookie = `auth_role=${loggedUser.role}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
          setUser(loggedUser);
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem(USER_STORAGE_KEY);
        document.cookie = 'auth_user=; path=/; max-age=0; SameSite=Strict';
        document.cookie = 'auth_role=; path=/; max-age=0; SameSite=Strict';
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    try {
      // Résoudre l'email si l'utilisateur a entré un pseudo
      let email = emailOrUsername;
      if (!emailOrUsername.includes('@')) {
        const { data: found } = await supabase
          .from('utilisateur')
          .select('email')
          .eq('nom_utilisateur', emailOrUsername)
          .maybeSingle();
        if (!found) return { success: false, error: 'Identifiant ou mot de passe incorrect' };
        email = found.email;
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError || !authData.user) {
        return { success: false, error: 'Identifiant ou mot de passe incorrect' };
      }

      const { data: userData, error } = await supabase
        .from('utilisateur')
        .select('id, nom_utilisateur, email, role')
        .eq('auth_id', authData.user.id)
        .maybeSingle();

      if (error || !userData) {
        return { success: false, error: 'Utilisateur introuvable' };
      }

      const loggedUser: User = {
        id: userData.id,
        username: userData.nom_utilisateur,
        email: userData.email,
        role: userData.role,
      };

      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser));
      document.cookie = `auth_user=1; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
      document.cookie = `auth_role=${loggedUser.role}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
      setUser(loggedUser);

      return { success: true };
    } catch (error) {
      console.error('Erreur login:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const { data: existingUser } = await supabase
        .from('utilisateur')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        return { success: false, error: 'Cet email est déjà utilisé' };
      }

      const { data: existingUsername } = await supabase
        .from('utilisateur')
        .select('id')
        .eq('nom_utilisateur', username)
        .maybeSingle();

      if (existingUsername) {
        return { success: false, error: 'Ce pseudo est déjà utilisé' };
      }

      // Créer le compte dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

      if (authError || !authData.user) {
        console.error('Erreur Supabase Auth register:', authError?.message);
        return { success: false, error: authError?.message || 'Erreur lors de la création du compte' };
      }

      // Insérer dans la table utilisateur avec auth_id
      const { error } = await supabase
        .from('utilisateur')
        .insert({ nom_utilisateur: username, email, mot_de_passe: '', role: 'joueur', auth_id: authData.user.id });

      if (error) {
        console.error('Erreur Supabase register:', error.message);
        return { success: false, error: 'Erreur lors de la création du compte : ' + error.message };
      }

      document.cookie = `auth_user=1; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
      document.cookie = `auth_role=joueur; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;

      return { success: true, message: 'Compte créé avec succès' };
    } catch (error) {
      console.error('Erreur register:', error);
      return { success: false, error: "Erreur d'inscription" };
    }
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Erreur de connexion avec Google' };
    }
  };

  const loginWithApple = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Erreur Apple OAuth:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur login Apple:', error);
      return { success: false, error: 'Erreur de connexion avec Apple' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem(USER_STORAGE_KEY);
      document.cookie = 'auth_user=; path=/; max-age=0; SameSite=Strict';
      document.cookie = 'auth_role=; path=/; max-age=0; SameSite=Strict';
      setUser(null);
    } catch (error) {
      console.error('Erreur logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, loginWithApple, logout, checkAuth, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext doit etre utilise dans un AuthProvider');
  }
  return context;
}