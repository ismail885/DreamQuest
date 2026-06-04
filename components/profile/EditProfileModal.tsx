"use client";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  editUsername: string;
  onEditUsernameChange: (value: string) => void;
  editEmail: string;
  onEditEmailChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
  saveMessage: { type: "success" | "error"; text: string } | null;
  getUserInitials: () => string;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  editUsername,
  onEditUsernameChange,
  editEmail,
  onEditEmailChange,
  onSave,
  isSaving,
  saveMessage,
  getUserInitials,
}: EditProfileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative backdrop-blur-card bg-slate-900/60 border border-cyan-500/20 rounded-t-2xl md:rounded-card p-6 w-full max-w-md mx-4 shadow-2xl max-h-[85vh] overflow-y-auto md:max-h-none">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            Modifier le profil
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cyan-500/10 rounded-card transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-cyan-500/30">
            {editUsername
              ? editUsername.substring(0, 2).toUpperCase()
              : getUserInitials()}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Nom d&apos;utilisateur
            </label>
            <input
              type="text"
              value={editUsername}
              onChange={(e) => onEditUsernameChange(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border border-cyan-500/20 rounded-card text-white placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="Votre nom d'utilisateur"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Email
            </label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => onEditEmailChange(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border border-cyan-500/20 rounded-card text-white placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="Votre email"
            />
          </div>

          {saveMessage && (
            <div
              className={`p-3 rounded-card text-sm ${
                saveMessage.type === "success"
                  ? "bg-[#238636]/10 border border-[#238636]/40 text-[#238636]"
                  : "bg-[#F85149]/10 border border-[#F85149]/40 text-[#F85149]"
              }`}
            >
              {saveMessage.text}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-transparent border border-cyan-500/20 rounded-card text-white font-medium hover:bg-cyan-500/5 transition-all"
          >
            Annuler
          </button>
          <button
            onClick={onSave}
            disabled={isSaving || !editUsername.trim()}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-primary to-blue-500 hover:opacity-90 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed rounded-card text-white font-medium transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Sauvegarde...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Sauvegarder
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}





