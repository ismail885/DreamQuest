"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'dreamquest_user';

export function AuthProvider({ children }: { children: ReactNode }) {
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
      const { data: userData, error } = await supabase
        .from('utilisateur')
        .select('id, nom_utilisateur, email, mot_de_passe, role')
        .eq('email', email)
        .single();

      if (error || !userData) {
        return { success: false, error: 'Email ou mot de passe incorrect' };
      }

      if (userData.mot_de_passe !== password) {
        return { success: false, error: 'Email ou mot de passe incorrect' };
      }

      const loggedUser: User = {
        id: userData.id,
        username: userData.nom_utilisateur,
        email: userData.email,
        role: userData.role
      };

      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser));
      setUser(loggedUser);

      return { success: true };
    } catch (error) {
      console.error('Erreur login:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      // Verifier si l'email existe deja
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
      setUser(registeredUser);

      return { success: true, message: 'Compte cree avec succes' };
    } catch (error) {
      console.error('Erreur register:', error);
      return { success: false, error: 'Erreur d\'inscription' };
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error('Erreur logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
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