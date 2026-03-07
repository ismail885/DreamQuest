import { useAuthContext } from '@/context/AuthContext';

/**
 * Raccourci vers le contexte d'authentification personnalisé.
 * Retourne { user, loading } compatibles avec l'ensemble du projet.
 */
export function useAuth() {
  const { user, loading } = useAuthContext();
  return { user, loading };
}
