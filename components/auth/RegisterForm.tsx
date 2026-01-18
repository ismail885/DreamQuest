"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import Loader from "@/components/shared/Loader";

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuthContext();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    const result = await register(formData.username, formData.email, formData.password);

    if (result.success) {
      setSuccess(result.message || "Inscription réussie ! Veuillez vérifier votre email.");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      setError(result.error || "Erreur lors de l'inscription");
      setIsLoading(false);
    }
  };

  if (isLoading && !success) {
    return <Loader fullScreen message="Création de votre compte..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background avec effets de glow bleu/cyan */}
      <div className="absolute inset-0 bg-[#0a0e1a]">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card principale */}
        <div className="bg-[#0f1623]/80 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-8 shadow-2xl">
          
          {/* Logo et titre */}
          <div className="text-center space-y-3 mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/Logo_DreamQuest.png"
                alt="DreamQuest Logo"
                width={60}
                height={60}
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-cyan-400">DreamQuest</h1>
            <p className="text-gray-400 text-sm">Créer votre compte jeune aventurier</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Nom d'aventurier */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-400">
                Nom d&apos;aventurier
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="w-full pl-10 pr-4 py-3 bg-[#1a1f2e] border border-gray-700 focus:border-cyan-500 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all text-sm"
                  placeholder="Entrez votre nom..."
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-400">
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
                  className="w-full pl-10 pr-4 py-3 bg-[#1a1f2e] border border-gray-700 focus:border-cyan-500 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all text-sm"
                  placeholder="votre.email@exemple.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-400">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full pl-10 pr-4 py-3 bg-[#1a1f2e] border border-gray-700 focus:border-cyan-500 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all text-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Message de succès */}
            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg">
                <p className="text-green-400 text-sm text-center">{success}</p>
              </div>
            )}

            {/* Bouton S'inscrire */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 text-sm shadow-lg shadow-cyan-500/20 mt-6"
            >
              {isLoading ? "Inscription en cours..." : "S'inscrire"}
            </button>

            {/* Lien connexion */}
            <div className="text-center text-sm text-gray-400 pt-2">
              Déjà un compte ?{" "}
              <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                Se connecter
              </Link>
            </div>
          </form>

          {/* Politique de confidentialité */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              En continuant, vous acceptez nos conditions d&apos;utilisation et notre politique de confidentialité
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
