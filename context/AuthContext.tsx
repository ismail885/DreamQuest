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
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Erreur verification auth:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    try {
      const isEmail = emailOrUsername.includes('@');
      const query = supabase
        .from('utilisateur')
        .select('id, nom_utilisateur, email, mot_de_passe, role')
        .limit(1);

      const { data: userData, error } = await (
        isEmail
          ? query.eq('email', emailOrUsername)
          : query.eq('nom_utilisateur', emailOrUsername)
      ).maybeSingle();

      console.log('DEBUG userData:', userData, 'error:', error);
      if (error || !userData) {
        return { success: false, error: 'Identifiant ou mot de passe incorrect' };
      }

      console.log('DEBUG mdp DB:', userData.mot_de_passe, '| mdp saisi:', password, '| égal:', userData.mot_de_passe === password);
      if (userData.mot_de_passe !== password) {
        return { success: false, error: 'Identifiant ou mot de passe incorrect' };
      }

      const loggedUser: User = {
        id: userData.id,
        username: userData.nom_utilisateur,
        email: userData.email,
        role: userData.role,
      };

      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser));
      document.cookie = `auth_user=1; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
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

      const { data: newUser, error } = await supabase
        .from('utilisateur')
        .insert({ nom_utilisateur: username, email, mot_de_passe: password, role: 'joueur' })
        .select('id, nom_utilisateur, email, role')
        .single();

      if (error) {
        console.error('Erreur Supabase register:', error.message);
        return { success: false, error: 'Erreur lors de la création du compte' };
      }

      const registeredUser: User = {
        id: newUser.id,
        username: newUser.nom_utilisateur,
        email: newUser.email,
        role: newUser.role,
      };

      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(registeredUser));
      document.cookie = `auth_user=1; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
      setUser(registeredUser);

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

  const logout = async () => {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      document.cookie = 'auth_user=; path=/; max-age=0; SameSite=Strict';
      setUser(null);
    } catch (error) {
      console.error('Erreur logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth, updateUser }}>
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