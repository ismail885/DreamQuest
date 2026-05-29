"use client";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: boolean;
  onToggleNotifications: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  isSavingSettings: boolean;
  settingsMessage: { type: "success" | "error"; text: string } | null;
  onSave: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  notifications,
  onToggleNotifications,
  language,
  onLanguageChange,
  isSavingSettings,
  settingsMessage,
  onSave,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative backdrop-blur-[10px] bg-[rgba(15,23,42,0.6)] border border-[rgba(6,182,212,0.2)] rounded-t-2xl md:rounded-[10px] p-6 w-full max-w-md mx-4 shadow-2xl max-h-[85vh] overflow-y-auto md:max-h-none">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <svg
              className="w-5 h-5 text-[#06b6d4]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Paramètres
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[rgba(6,182,212,0.1)] rounded-[10px] transition-colors"
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

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-transparent border border-[rgba(6,182,212,0.2)] rounded-[10px]">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-[#06b6d4]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="text-white">Notifications</span>
            </div>
            <button
              onClick={onToggleNotifications}
              className={`relative w-12 h-6 rounded-full transition-colors ${notifications ? "bg-[#06b6d4]" : "bg-gray-600"}`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications ? "translate-x-7" : "translate-x-1"}`}
              />
            </button>
          </div>

          <div className="p-4 bg-transparent border border-[rgba(6,182,212,0.2)] rounded-[10px]">
            <div className="flex items-center gap-3 mb-3">
              <svg
                className="w-5 h-5 text-[#06b6d4]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
              <span className="text-white">Langue</span>
            </div>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="w-full px-4 py-2 bg-transparent border border-[rgba(6,182,212,0.2)] rounded-[10px] text-white focus:outline-none focus:border-[#06b6d4] transition-all"
            >
              <option value="fr">Français</option>
            </select>
          </div>

          {settingsMessage && (
            <div
              className={`p-3 rounded-[10px] text-sm ${
                settingsMessage.type === "success"
                  ? "bg-[#238636]/10 border border-[#238636]/40 text-[#238636]"
                  : "bg-[#F85149]/10 border border-[#F85149]/40 text-[#F85149]"
              }`}
            >
              {settingsMessage.text}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-transparent border border-[rgba(6,182,212,0.2)] rounded-[10px] text-white font-medium hover:bg-[rgba(6,182,212,0.05)] transition-all"
          >
            Annuler
          </button>
          <button
            onClick={onSave}
            disabled={isSavingSettings}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] hover:opacity-90 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed rounded-[10px] text-white font-medium transition-all flex items-center justify-center gap-2"
          >
            {isSavingSettings ? (
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
