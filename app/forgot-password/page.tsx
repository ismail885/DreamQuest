"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/login`,
    });

    if (resetError) {
      setError(resetError.message || "Impossible d'envoyer l'email de reinitialisation.");
      setLoading(false);
      return;
    }

    setMessage("Si cet email existe, un lien de reinitialisation a ete envoye.");
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-surface-primary text-content-primary">
      <section className="w-full max-w-md rounded-2xl border border-gray-800/60 bg-surface-tertiary/70 p-8 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-cyan-400">Mot de passe oublie</h1>
        <p className="mt-2 text-sm text-content-secondary">
          Entrez votre email pour recevoir un lien de reinitialisation.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-content-secondary">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-700 bg-surface-tertiary px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
              placeholder="votre.email@exemple.com"
            />
          </div>

          {message && <p className="rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-300">{message}</p>}
          {error && <p className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 font-semibold text-white transition hover:from-cyan-400 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Envoi en cours..." : "Envoyer le lien"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-content-secondary">
          <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300">
            Retour a la connexion
          </Link>
        </div>
      </section>
    </main>
  );
}
