"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function RegisterForm() {
 const router = useRouter();
 const { register } = useAuthContext();
 const [formData, setFormData] = useState({
 username: "",
 email: "",
 password: "",
 confirmPassword: "",
 });
 const [showPassword, setShowPassword] = useState(false);
 const [showConfirm, setShowConfirm] = useState(false);
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState("");

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 setFormData({ ...formData, [e.target.name]: e.target.value });
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsLoading(true);
 setError("");

 if (formData.username.length < 3) {
 setError("Le nom d'aventurier doit contenir au moins 3 caracteres");
 setIsLoading(false);
 return;
 }

 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 if (!emailRegex.test(formData.email)) {
 setError("Veuillez entrer une adresse email valide");
 setIsLoading(false);
 return;
 }

 if (formData.password !== formData.confirmPassword) {
 setError("Les mots de passe ne correspondent pas");
 setIsLoading(false);
 return;
 }

 if (formData.password.length < 8) {
 setError("Le mot de passe doit contenir au moins 8 caracteres");
 setIsLoading(false);
 return;
 }

 try {
 const result = await register(formData.username, formData.email, formData.password);

 if (result.success) {
 toast.success("Inscription réussie ! Connectez-vous.");
 setTimeout(() => router.push("/auth/login"), 1500);
 } else {
 setError(result.error || "Erreur lors de l'inscription");
 setIsLoading(false);
 }
 } catch {
 setError("Une erreur est survenue");
 setIsLoading(false);
 }
 };

 return (
 <div className="min-h-screen flex items-center justify-center p-4 relative bg-[#070b15] ">
 {/* Lueur ambiante bleu-violet */}
 <div className="absolute inset-0 overflow-hidden">
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl"></div>
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl"></div>
 </div>

 <div className="w-full max-w-sm relative z-10">
 {/* Carte modale */}
 <div className="bg-[#131e35] rounded-2xl border border-gray-800/50 p-8 shadow-2xl">
 
 {/* Logo + Titre */}
 <div className="text-center mb-8">
 <div className="flex justify-center mb-4">
 <Image src="/Logo_DreamQuest.png" alt="DreamQuest" width={56} height={56} className="object-contain" priority />
 </div>
 <h1 className="text-2xl font-bold text-[#3b9ede]">DreamQuest</h1>
 <p className="text-gray-400 text-sm mt-1">Créer votre compte jeune aventurier</p>
 </div>

 {/* Erreur */}
 {error && (
 <div className="mb-5 p-3 bg-red-500/10 border border-red-500/40 rounded-lg">
 <p className="text-red-400 text-sm text-center">{error}</p>
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-4">
 {/* Nom d'aventurier */}
 <div>
 <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1.5">
Nom d&apos;aventurier
 </label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
 </svg>
 </div>
 <input
 type="text"
 id="username"
 name="username"
 className="w-full pl-10 pr-4 py-3 bg-[#121827] border border-gray-700 focus:border-cyan-500 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all text-sm"
 placeholder="Entrez votre nom..."
 value={formData.username}
 onChange={handleChange}
 required
 />
 </div>
 </div>

 {/* Email */}
 <div>
 <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1.5">
 Email
 </label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
 </svg>
 </div>
 <input
 type="email"
 id="email"
 name="email"
 className="w-full pl-10 pr-4 py-3 bg-[#121827] border border-gray-700 focus:border-cyan-500 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all text-sm"
 placeholder="votre.email@exemple.com"
 value={formData.email}
 onChange={handleChange}
 required
 />
 </div>
 </div>

 {/* Mot de passe */}
 <div>
 <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1.5">
 Mot de passe
 </label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
 </svg>
 </div>
 <input
 type={showPassword ? "text" : "password"}
 id="password"
 name="password"
 className="w-full pl-10 pr-12 py-3 bg-[#121827] border border-gray-700 focus:border-cyan-500 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all text-sm"
 placeholder="••••••••"
 value={formData.password}
 onChange={handleChange}
 required
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
 tabIndex={-1}
 aria-label={showPassword ? "Masquer" : "Afficher"}
 >
 {showPassword ? (
 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
 </svg>
 ) : (
 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
 </svg>
 )}
 </button>
 </div>
 </div>

 {/* Confirmer mot de passe */}
 <div>
 <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-1.5">
 Confirmer le mot de passe
 </label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
 </svg>
 </div>
 <input
 type={showConfirm ? "text" : "password"}
 id="confirmPassword"
 name="confirmPassword"
 className="w-full pl-10 pr-12 py-3 bg-[#121827] border border-gray-700 focus:border-cyan-500 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all text-sm"
 placeholder="Confirmez votre mot de passe"
 value={formData.confirmPassword}
 onChange={handleChange}
 required
 />
 <button
 type="button"
 onClick={() => setShowConfirm(!showConfirm)}
 className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
 tabIndex={-1}
 aria-label={showConfirm ? "Masquer" : "Afficher"}
 >
 {showConfirm ? (
 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
 </svg>
 ) : (
 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
 </svg>
 )}
 </button>
 </div>
 </div>

 {/* Bouton Inscription */}
 <button
 type="submit"
 disabled={isLoading}
 className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-2 mt-6"
 >
 {isLoading && (
 <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
 </svg>
 )}
 {isLoading ? "Inscription en cours..." : "S'inscrire"}
 </button>

 {/* Lien connexion */}
 <p className="text-center text-sm text-gray-400 mt-4">
 Deja un compte ?{" "}
 <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
 Se connecter
 </Link>
 </p>
 </form>
 </div>

 {/* Footer légal */}
 <p className="mt-6 text-xs text-gray-600 text-center leading-relaxed max-w-xs mx-auto">
 En continuant, vous acceptez nos conditions d&apos;utilisation et notre politique de confidentialité
 </p>
 </div>
 </div>
 );
}

