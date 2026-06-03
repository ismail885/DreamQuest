"use client";

import { Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
  deleteConfirm: number | null;
  onClose: () => void;
  onDelete: (id: number) => void;
  itemLabel?: string;
}

export default function DeleteConfirmModal({
  deleteConfirm,
  onClose,
  onDelete,
  itemLabel = "cet utilisateur",
}: DeleteConfirmModalProps) {
  if (!deleteConfirm) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-gray-800 rounded-xl w-full max-w-sm">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Confirmer la suppression
          </h3>
          <p className="text-gray-400">
            Êtes-vous sûr de vouloir supprimer {itemLabel} ? Cette action
            est irréversible.
          </p>
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-700 text-gray-400 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => onDelete(deleteConfirm)}
            className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
