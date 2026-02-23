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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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

  const login = async (email: string, password: string) => {
    try {
      // Requête optimisée avec uniquement les champs nécessaires
      const { data: userData, error } = await supabase
        .from('utilisateur')
        .select('id, nom_utilisateur, email, mot_de_passe, role')
        .eq('email', email)
        .limit(1)
        .maybeSingle();

      if (error) {
        return { success: false, error: 'Erreur de connexion à la base de données' };
      }

      if (!userData) {
        return { success: false, error: 'Email ou mot de passe incorrect' };
      }

      // Vérification rapide du mot de passe
      if (userData.mot_de_passe !== password) {
        return { success: false, error: 'Email ou mot de passe incorrect' };
      }

      const loggedUser: User = {
        id: userData.id,
        username: userData.nom_utilisateur,
        email: userData.email,
        role: userData.role
      };

      // Sauvegarde synchrone dans localStorage
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser));
      // Cookie lisible par le middleware (non-HttpOnly)
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
        return { success: false, error: 'Cet email est deja utilise' };
      }

      // Creer l'utilisateur
      const { data: newUser, error } = await supabase
        .from('utilisateur')
        .insert({
          nom_utilisateur: username,
          email: email,
          mot_de_passe: password,
          role: 'joueur'
        })
        .select('id, nom_utilisateur, email, role')
        .single();

      if (error) {
        console.error('Erreur Supabase:', error);
        return { success: false, error: 'Erreur lors de la creation du compte' };
      }

      const registeredUser: User = {
        id: newUser.id,
        username: newUser.nom_utilisateur,
        email: newUser.email,
        role: newUser.role
      };

      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(registeredUser));
      document.cookie = `auth_user=1; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
      setUser(registeredUser);

      return { success: true, message: 'Compte cree avec succes' };
    } catch (error) {
      console.error('Erreur register:', error);
      return { success: false, error: 'Erreur d\'inscription' };
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