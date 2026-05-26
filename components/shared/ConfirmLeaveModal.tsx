"use client";

import { AlertTriangle } from "lucide-react";

interface ConfirmLeaveModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

export default function ConfirmLeaveModal({
  isOpen,
  onConfirm,
  onCancel,
  title = "Quitter l'aventure ?",
  message = "Votre progression sera sauvegardée automatiquement.",
}: ConfirmLeaveModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-[#0c1322] border border-gray-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
          </div>
          <h3 className="text-xl font-bold text-white ">{title}</h3>
        </div>
        <p className="text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-[#141d2e] border border-gray-600 rounded-lg text-white font-medium hover:bg-[#141d2e]/80 transition-colors"
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
