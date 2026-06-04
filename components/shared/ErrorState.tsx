"use client";

import { AlertCircle, RotateCw } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export default function ErrorState({
  message,
  onRetry,
  retryLabel = "Réessayer",
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`text-center py-16 md:py-20 ${className}`}>
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <p className="text-red-400 text-lg">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500/10 border border-cyan-500/30 text-primary rounded-card font-medium hover:bg-cyan-500/20 transition-colors"
        >
          <RotateCw className="w-4 h-4" />
          {retryLabel}
        </button>
      )}
    </div>
  );
}
