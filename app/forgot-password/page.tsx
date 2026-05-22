"use client";

import { FormEvent, useEffect, useState } from "react";
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

 // Detecter si on arrive depuis le lien de recovery (token dans l'URL)
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

 const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
 redirectTo: `${window.location.origin}/forgot-password`,
 });

 if (resetError) {
 setError(resetError.message || "Impossible d'envoyer l'email de reinitialisation.");
 setLoading(false);
 return;
 }

 setMessage("Si cet email existe, un lien de reinitialisation a ete envoye.");
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

 // Mode reset : formulaire nouveau mot de passe
 if (isResetMode) {
 return (
 <main className="min-h-screen flex items-center justify-center px-4 bg-[#070b15] text-white">
 <div className="absolute inset-0">
 <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl"></div>
 <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl"></div>
 </div>
 <section className="w-full max-w-md relative z-10 rounded-2xl border border-gray-800/60 bg-[#0c1322]/80 p-8 backdrop-blur-sm">
 <div className="flex items-center gap-3 mb-2">
 <Lock className="w-6 h-6 text-cyan-400" />
 <h1 className="text-2xl font-bold text-cyan-400">Nouveau mot de passe</h1>
 </div>
 <p className="mt-2 text-sm text-gray-400">
 Definissez votre nouveau mot de passe.
 </p>

 <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
 <div>
 <label htmlFor="newPassword" className="mb-2 block text-sm text-gray-400">
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
 className="w-full pl-10 pr-10 rounded-lg border border-gray-700 bg-[#121827] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
 placeholder="Minimum 8 caracteres"
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
 tabIndex={-1}
 >
 {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
 </button>
 </div>
 </div>

 <div>
 <label htmlFor="confirmPassword" className="mb-2 block text-sm text-gray-400">
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
 className="w-full pl-10 pr-10 rounded-lg border border-gray-700 bg-[#121827] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
 placeholder="Confirmez votre mot de passe"
 />
 <button
 type="button"
 onClick={() => setShowConfirm(!showConfirm)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
 tabIndex={-1}
 >
 {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
 </button>
 </div>
 </div>

 {message && <p className="rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-300">{message}</p>}
 {error && <p className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

 <button
 type="submit"
 disabled={resetLoading}
 className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 font-semibold text-white transition hover:from-cyan-400 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
 >
 {resetLoading ? "Modification en cours..." : "Modifier le mot de passe"}
 </button>
 </form>

 <div className="mt-5 text-center text-sm text-gray-400">
 <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300">
 Retour a la connexion
 </Link>
 </div>
 </section>
 </main>
 );
 }

 return (
 <main className="min-h-screen flex items-center justify-center px-4 bg-[#070b15] text-white">
 <div className="absolute inset-0">
 <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl"></div>
 <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl"></div>
 </div>
 <section className="w-full max-w-md relative z-10 rounded-2xl border border-gray-800/60 bg-[#0c1322]/80 p-8 backdrop-blur-sm">
 <div className="flex items-center gap-3 mb-2">
 <Mail className="w-6 h-6 text-cyan-400" />
 <h1 className="text-2xl font-bold text-cyan-400">Mot de passe oublie</h1>
 </div>
 <p className="mt-2 text-sm text-gray-400">
 Entrez votre email pour recevoir un lien de reinitialisation.
 </p>

 <form onSubmit={handleSendReset} className="mt-6 space-y-4">
 <div>
 <label htmlFor="email" className="mb-2 block text-sm text-gray-400">
 Email
 </label>
 <div className="relative">
 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
 <input
 id="email"
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 required
 className="w-full pl-10 rounded-lg border border-gray-700 bg-[#121827] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
 placeholder="votre.email@exemple.com"
 />
 </div>
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

 <div className="mt-5 text-center text-sm text-gray-400">
 <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1">
 <ArrowLeft className="w-4 h-4" />
 Retour a la connexion
 </Link>
 </div>
 </section>
 </main>
 );
}
