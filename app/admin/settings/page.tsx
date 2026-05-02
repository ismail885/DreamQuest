"use client";

import { useState } from "react";
import { Settings, Palette, Database, Shield, Bell, Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "DreamQuest",
    siteDescription: "Application web de RPG textuel interactif",
    allowRegistration: true,
    requireEmailVerification: false,
    maxCharactersPerUser: 5,
    autoSaveInterval: 30,
    enableVotes: true,
    enableRanking: true,
    maintenanceMode: false,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Simulate saving - in production, this would call an API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const categories = [
    {
      name: "Général",
      icon: Settings,
      fields: [
        { key: "siteName", label: "Nom du site", type: "text" },
        { key: "siteDescription", label: "Description", type: "text" },
      ]
    },
    {
      name: "Inscription",
      icon: Shield,
      fields: [
        { key: "allowRegistration", label: "Autoriser les inscriptions", type: "checkbox" },
        { key: "requireEmailVerification", label: "Vérification email requise", type: "checkbox" },
      ]
    },
    {
      name: "Jeu",
      icon: Database,
      fields: [
        { key: "maxCharactersPerUser", label: "Personnages max par utilisateur", type: "number" },
        { key: "autoSaveInterval", label: "Intervalle de sauvegarde (secondes)", type: "number" },
      ]
    },
    {
      name: "Communauté",
      icon: Bell,
      fields: [
        { key: "enableVotes", label: "Activer les votes", type: "checkbox" },
        { key: "enableRanking", label: "Activer les classements", type: "checkbox" },
      ]
    },
    {
      name: "Maintenance",
      icon: Palette,
      fields: [
        { key: "maintenanceMode", label: "Mode maintenance", type: "checkbox" },
      ]
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-content-primary">Paramètres</h1>
          <p className="text-gray-400 mt-2">Configurez les options de votre application</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {categories.map((category, index) => {
          const Icon = category.icon;
          return (
            <div key={index} className="bg-[#1a1f2e] border border-gray-800 rounded-xl">
              <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-3">
                <Icon className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-content-primary">{category.name}</h2>
              </div>
              <div className="p-6 space-y-4">
                {category.fields.map((field) => (
                  <div key={field.key} className="flex items-center justify-between">
                    <label className="text-gray-400">{field.label}</label>
                    {field.type === "checkbox" ? (
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, [field.key]: !settings[field.key as keyof typeof settings] })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings[field.key as keyof typeof settings] ? "bg-cyan-500" : "bg-gray-700"
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            settings[field.key as keyof typeof settings] ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                    ) : field.type === "number" ? (
                      <input
                        type="number"
                        value={settings[field.key as keyof typeof settings] as number}
                        onChange={(e) => setSettings({ ...settings, [field.key]: parseInt(e.target.value) || 0 })}
                        className="w-24 px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-content-primary text-center focus:outline-none focus:border-cyan-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={settings[field.key as keyof typeof settings] as string}
                        onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                        className="w-64 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-content-primary focus:outline-none focus:border-cyan-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Save Button */}
        <div className="flex items-center justify-end gap-4">
          {saved && (
            <span className="text-green-400 text-sm">Paramètres enregistrés</span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-content-primary font-medium rounded-lg transition-colors"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Enregistrer</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}