"use client";

import { FormEvent, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Mail, Lock, ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const type = params.get("type");
      const accessToken = params.get("access_token");
      if (type === "recovery" && accessToken) {
        setIsResetMode(true);
      }
    }
  }, []);

  const handleSendReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Veuillez entrer une adresse email valide");
      setLoading(false);
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/forgot-password`,
      },
    );

    if (resetError) {
      setError(
        resetError.message ||
          "Impossible d'envoyer l'email de reinitialisation.",
      );
      setLoading(false);
      return;
    }

    setMessage(
      "Si cet email existe, un lien de reinitialisation a ete envoye.",
    );
    setLoading(false);
  };

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResetLoading(true);
    setError(null);

    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caracteres");
      setResetLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setResetLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message || "Erreur lors de la reinitialisation.");
        setResetLoading(false);
        return;
      }

      setMessage("Mot de passe modifié avec succès !");
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setResetLoading(false);
    }
  };

  const PageLayout = ({ children }: { children: ReactNode }) => (
    <main className="min-h-screen flex items-center justify-center p-4 relative bg-[#070b15]">
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(148deg,#0c0e1a 0%,#0f1729 25%,#1a1f3a 50%,#0f1729 75%,#0c0e1a 100%)",
          }}
        />
        <div
          className="absolute w-96 h-96 rounded-full blur-[40px]"
          style={{
            background: "rgba(6,182,212,0.10)",
            left: "25%",
            top: 0,
            opacity: 0.83,
          }}
        />
        <div
          className="absolute w-96 h-96 rounded-full blur-[40px]"
          style={{
            background: "rgba(59,130,246,0.10)",
            right: "25%",
            top: "696px",
            opacity: 0.51,
          }}
        />
        <div
          className="absolute w-96 h-96 rounded-full blur-[40px]"
          style={{
            background: "rgba(99,102,241,0.10)",
            left: "51.54%",
            top: "505px",
            opacity: 0.93,
          }}
        />
      </div>
      <div className="w-full max-w-sm relative z-10">
        <div className="backdrop-blur-[10px] bg-[rgba(15,23,42,0.6)] rounded-[10px] border border-[rgba(6,182,212,0.2)] p-8">
          {children}
        </div>
      </div>
    </main>
  );

  if (isResetMode) {
    return (
      <PageLayout>
        <div className="flex items-center gap-3 mb-2">
          <Lock className="w-6 h-6 text-[#06b6d4]" />
          <h1 className="text-2xl font-bold text-[#06b6d4]">
            Nouveau mot de passe
          </h1>
        </div>
        <p className="mt-2 text-sm text-gray-400">
          Définissez votre nouveau mot de passe.
        </p>

        <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="newPassword"
              className="mb-2 block text-sm text-gray-400"
            >
              Nouveau mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full pl-10 pr-10 bg-transparent border border-[rgba(6,182,212,0.2)] focus:border-[#06b6d4] rounded-[10px] px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#06b6d4] transition-all"
                placeholder="Minimum 8 caractères"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Masquer" : "Afficher"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm text-gray-400"
            >
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full pl-10 pr-10 bg-transparent border border-[rgba(6,182,212,0.2)] focus:border-[#06b6d4] rounded-[10px] px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#06b6d4] transition-all"
                placeholder="Confirmez votre mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                tabIndex={-1}
                aria-label={showConfirm ? "Masquer" : "Afficher"}
              >
                {showConfirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {message && (
            <div className="p-3 border border-[#238636]/50 bg-[#238636]/10 rounded-[10px]">
              <p className="text-sm text-[#238636]">{message}</p>
            </div>
          )}
          {error && (
            <div className="p-3 border border-[#F85149]/40 bg-[#F85149]/10 rounded-[10px]">
              <p className="text-sm text-[#F85149]">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={resetLoading}
            className="w-full py-3 bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] hover:opacity-90 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-[10px] transition-all duration-200 text-sm flex items-center justify-center gap-2"
          >
            {resetLoading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {resetLoading
              ? "Modification en cours..."
              : "Modifier le mot de passe"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-gray-400">
          <Link
            href="/auth/login"
            className="text-[#06b6d4] hover:text-[#3b82f6] transition-colors"
          >
            Retour à la connexion
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#3b82f6] flex items-center justify-center">
            <Lock className="w-7 h-7 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[#06b6d4]">
          Mot de passe oublié
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Entrez votre email pour recevoir un lien de réinitialisation.
        </p>
      </div>

      <form onSubmit={handleSendReset} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-400 mb-1.5"
          >
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="w-5 h-5 text-gray-500" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 bg-transparent border border-[rgba(6,182,212,0.2)] focus:border-[#06b6d4] rounded-[10px] px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#06b6d4] transition-all"
              placeholder="votre.email@exemple.com"
            />
          </div>
        </div>

        {message && (
          <div className="p-3 border border-[#238636]/40 bg-[#238636]/10 rounded-[10px]">
            <p className="text-sm text-[#238636]">{message}</p>
          </div>
        )}
        {error && (
          <div className="p-3 border border-[#F85149]/40 bg-[#F85149]/10 rounded-[10px]">
            <p className="text-sm text-[#F85149]">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] hover:opacity-90 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-[10px] transition-all duration-200 text-sm flex items-center justify-center gap-2"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {loading ? "Envoi en cours..." : "Envoyer le lien"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-400">
        <Link
          href="/auth/login"
          className="text-[#06b6d4] hover:text-[#3b82f6] transition-colors inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la connexion
        </Link>
      </div>
    </PageLayout>
  );
}
