"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Home, AlertTriangle } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  currentStep?: number;
  totalSteps?: number;
}

export default function Breadcrumb({ items, currentStep, totalSteps }: BreadcrumbProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Link 
        href="/" 
        className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Accueil</span>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-gray-600" />
          {item.href ? (
            <Link 
              href={item.href}
              className="text-gray-400 hover:text-cyan-400 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-cyan-400 font-medium">{item.label}</span>
          )}
        </div>
      ))}
      
      {currentStep !== undefined && totalSteps !== undefined && (
        <div className="flex items-center gap-2 ml-auto">
          <div className="text-xs text-gray-500">
            Étape {currentStep}/{totalSteps}
          </div>
          <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Hook pour gérer la confirmation de départ
export function useLeaveConfirmation(enabled: boolean) {
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [enabled, isDirty]);

  return { isDirty, setIsDirty };
}

// Modal de confirmation de départ
interface ConfirmLeaveModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

export function ConfirmLeaveModal({
  isOpen,
  onConfirm,
  onCancel,
  title = "Quitter l'aventure ?",
  message = "Votre progression sera sauvegardée automatiquement."
}: ConfirmLeaveModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-[#0f1623] border border-gray-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
          </div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <p className="text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-[#1a2332] border border-gray-600 rounded-lg text-white font-medium hover:bg-[#1a2332]/80 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-white font-medium transition-colors"
          >
            Quitter
          </button>
        </div>
      </div>
    </div>
  );
}