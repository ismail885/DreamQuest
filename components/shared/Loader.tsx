"use client";

import Image from "next/image";

interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  fullScreen?: boolean;
  message?: string;
}

export default function Loader({ 
  size = "md", 
  fullScreen = false,
  message = "Chargement..."
}: LoaderProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
    xl: "w-40 h-40"
  };

  const logoSizeClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-20 h-20",
    xl: "w-24 h-24"
  };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Conteneur du loader avec animation */}
      <div className="relative">
        {/* Cercle extérieur animé */}
        <div className={`${sizeClasses[size]} relative`}>
          {/* Premier anneau - rotation rapide */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 border-r-cyan-400 animate-spin-fast"></div>
          
          {/* Deuxième anneau - rotation lente inversée */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-b-blue-500 border-l-blue-500 animate-spin-slow-reverse"></div>
          
          {/* Troisième anneau - pulse */}
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-pulse-ring"></div>
          
          {/* Effet de glow */}
          <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-xl animate-pulse"></div>
        </div>

        {/* Logo au centre */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${logoSizeClasses[size]} relative rounded-full bg-[#0b0d1e] p-2 flex items-center justify-center shadow-2xl border-2 border-cyan-500/20`}>
            <Image
              src="/Logo_DreamQuest.png"
              alt="DreamQuest Logo"
              width={100}
              height={100}
              className="object-contain animate-float"
              priority
            />
          </div>
        </div>
      </div>

      {/* Message de chargement */}
      {message && (
        <div className="text-center space-y-2">
          <p className="text-white font-semibold text-lg animate-pulse">
            {message}
          </p>
          <div className="flex items-center justify-center gap-1">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
          </div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0d1e]/95 backdrop-blur-sm">
        {/* Effets de fond */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>
        
        <div className="relative z-10">
          {loaderContent}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {loaderContent}
    </div>
  );
}
