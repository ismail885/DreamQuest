"use client";

import { useEffect, useState } from "react";
import { Database, Bell, Brain, Key, Save } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface AppSettings {
 maxCharactersPerUser: number;
 autoSaveInterval: number;
 enableVotes: boolean;
 enableRanking: boolean;
 maintenanceMode: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
 maxCharactersPerUser: 5,
 autoSaveInterval: 30,
 enableVotes: true,
 enableRanking: true,
 maintenanceMode: false,
};

export default function AdminSettingsPage() {
 const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
 const [saving, setSaving] = useState(false);
 const [saved, setSaved] = useState(false);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 const loadSettings = async () => {
 try {
 const { data } = await supabase
 .from("parametre_utilisateur")
 .select("*")
 .limit(1)
 .maybeSingle();

 if (data) {
 setSettings({
 maxCharactersPerUser: data.max_personnages ?? DEFAULT_SETTINGS.maxCharactersPerUser,
 autoSaveInterval: data.intervalle_sauvegarde ?? DEFAULT_SETTINGS.autoSaveInterval,
 enableVotes: data.votes_actifs ?? DEFAULT_SETTINGS.enableVotes,
 enableRanking: data.classement_actif ?? DEFAULT_SETTINGS.enableRanking,
 maintenanceMode: data.mode_maintenance ?? DEFAULT_SETTINGS.maintenanceMode,
 });
 }
 } catch {
 setError("Impossible de charger les paramètres.");
 } finally {
 setLoading(false);
 }
 };
 loadSettings();
 }, []);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setSaving(true);
 setError(null);

 try {
 const { error: upsertError } = await supabase
 .from("parametre_utilisateur")
 .upsert({
 id: 1,
 max_personnages: settings.maxCharactersPerUser,
 intervalle_sauvegarde: settings.autoSaveInterval,
 votes_actifs: settings.enableVotes,
 classement_actif: settings.enableRanking,
 mode_maintenance: settings.maintenanceMode,
 });

 if (upsertError) throw upsertError;

 setSaved(true);
 setTimeout(() => setSaved(false), 3000);
 } catch {
 setError("Erreur lors de la sauvegarde.");
 } finally {
 setSaving(false);
 }
 };

 const categories = [
 {
 name: "Jeu",
 icon: Database,
 fields: [
 { key: "maxCharactersPerUser", label: "Personnages max par utilisateur", type: "number" as const },
 { key: "autoSaveInterval", label: "Intervalle de sauvegarde (secondes)", type: "number" as const },
 ],
 },
 {
 name: "Communauté",
 icon: Bell,
 fields: [
 { key: "enableVotes", label: "Activer les votes", type: "checkbox" as const },
 { key: "enableRanking", label: "Activer les classements", type: "checkbox" as const },
 ],
 },
 {
 name: "Maintenance",
 icon: Database,
 fields: [
 { key: "maintenanceMode", label: "Mode maintenance", type: "checkbox" as const },
 ],
 },
 ];

 if (loading) {
 return (
 <div className="flex items-center justify-center min-h-[400px]">
 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold text-white">Paramètres</h1>
 <p className="text-gray-400 mt-2">Configuration de l&apos;application</p>
 </div>
 </div>

 {error && (
 <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
 {error}
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-6">
 {categories.map((category, index) => {
 const Icon = category.icon;
 return (
 <div key={index} className="bg-[#0c1322] border border-gray-800 rounded-xl">
 <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-3">
 <Icon className="w-5 h-5 text-cyan-400" />
 <h2 className="text-lg font-bold text-white">{category.name}</h2>
 </div>
 <div className="p-6 space-y-4">
 {category.fields.map((field) => (
 <div key={field.key} className="flex items-center justify-between">
 <label className="text-gray-400">{field.label}</label>
 {field.type === "checkbox" ? (
 <button
 type="button"
 onClick={() => setSettings({ ...settings, [field.key]: !settings[field.key as keyof AppSettings] })}
 className={`relative w-12 h-6 rounded-full transition-colors ${
 settings[field.key as keyof AppSettings] ? "bg-cyan-500" : "bg-gray-700"
 }`}
 >
 <span
 className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
 settings[field.key as keyof AppSettings] ? "translate-x-6" : "translate-x-0"
 }`}
 />
 </button>
 ) : (
 <input
 type="number"
 value={settings[field.key as keyof AppSettings] as number}
 onChange={(e) => setSettings({ ...settings, [field.key]: parseInt(e.target.value) || 0 })}
 className="w-24 px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-center focus:outline-none focus:border-cyan-500"
 />
 )}
 </div>
 ))}
 </div>
 </div>
 );
 })}

 {/* IA - ready for API integration */}
 <div className="bg-[#0c1322] border border-gray-800 rounded-xl opacity-60">
 <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-3">
 <Brain className="w-5 h-5 text-purple-400" />
 <h2 className="text-lg font-bold text-white">Génération IA</h2>
 <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">Bientôt</span>
 </div>
 <div className="p-6 space-y-4">
 <div className="flex items-center justify-between">
 <label className="text-gray-400">Clé API</label>
 <div className="flex items-center gap-2">
 <Key className="w-4 h-4 text-gray-600" />
 <span className="text-gray-600 text-sm">••••••••••••••••</span>
 </div>
 </div>
 <div className="flex items-center justify-between">
 <label className="text-gray-400">Modèle</label>
 <span className="text-gray-600 text-sm">gpt-4 / claude-3 / gemini-pro</span>
 </div>
 <p className="text-gray-600 text-xs mt-2">
 Configurez une clé API (OpenAI, Google Gemini, Grok, etc.) dans les variables d&apos;environnement pour activer la génération IA.
 </p>
 </div>
 </div>

 {/* Save Button */}
 <div className="flex items-center justify-end gap-4">
 {saved && (
 <span className="text-green-400 text-sm">Paramètres enregistrés</span>
 )}
 <button
 type="submit"
 disabled={saving}
 className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
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
