"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { AdventureListItem } from "@/types/adventure";

const ITEMS_PER_PAGE = 12;

export type AdventureFilter =
  | "tous"
  | "fantasy"
  | "dark-fantasy"
  | "mythologique"
  | "flibuste"
  | "intrigue"
  | "marches-sauvages"
  | "conte-feerique"
  | "epopee-guerriere"
  | "arcane-reliques";

export const FILTER_OPTIONS: { value: AdventureFilter; label: string }[] = [
  { value: "tous", label: "Tous" },
  { value: "fantasy", label: "Fantasy" },
  { value: "dark-fantasy", label: "Dark Fantasy" },
  { value: "mythologique", label: "Mythologique" },
  { value: "flibuste", label: "Flibuste" },
  { value: "intrigue", label: "Intrigue de Cour" },
  { value: "marches-sauvages", label: "Marches Sauvages" },
  { value: "conte-feerique", label: "Conte Féerique" },
  { value: "epopee-guerriere", label: "Épopée Guerrière" },
  { value: "arcane-reliques", label: "Arcane & Reliques" },
];

/** Filtre utilisateur -> valeurs BDD (avec anciens alias). */
const DB_GENRE_MAP: Record<string, string[] | null> = {
  tous: null,
  fantasy: ["fantasy", "fantaisy"],
  "dark-fantasy": ["dark-fantasy", "horreur", "horror"],
  mythologique: ["mythologique"],
  flibuste: ["flibuste", "pirate"],
  intrigue: ["intrigue", "policier", "mystere"],
  "marches-sauvages": ["marches-sauvages", "western"],
  "conte-feerique": ["conte-feerique", "romance"],
  "epopee-guerriere": ["epopee-guerriere", "cyberpunk"],
  "arcane-reliques": ["arcane-reliques", "science-fiction", "scifi"],
};

/** Étiquette lisible par genre (anciens alias inclus). */
export const GENRE_LABELS: Record<string, string> = {
  fantasy: "Fantasy",
  fantaisy: "Fantasy",
  "dark-fantasy": "Dark Fantasy",
  horreur: "Dark Fantasy",
  horror: "Dark Fantasy",
  mythologique: "Mythologique",
  flibuste: "Flibuste",
  pirate: "Flibuste",
  intrigue: "Intrigue de Cour",
  policier: "Intrigue de Cour",
  mystere: "Intrigue de Cour",
  "marches-sauvages": "Marches Sauvages",
  western: "Marches Sauvages",
  "conte-feerique": "Conte Féerique",
  romance: "Conte Féerique",
  "epopee-guerriere": "Épopée Guerrière",
  cyberpunk: "Épopée Guerrière",
  "arcane-reliques": "Arcane & Reliques",
  "science-fiction": "Arcane & Reliques",
  scifi: "Arcane & Reliques",
};

/** Couleur de badge pour chaque genre */
export const GENRE_COLORS: Record<string, string> = {
  fantasy: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  fantaisy: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "dark-fantasy": "bg-red-500/20 text-red-300 border-red-500/30",
  horreur: "bg-red-500/20 text-red-300 border-red-500/30",
  horror: "bg-red-500/20 text-red-300 border-red-500/30",
  mythologique: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  flibuste: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
  pirate: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
  intrigue: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  policier: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  mystere: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  "marches-sauvages": "bg-amber-700/20 text-amber-400 border-amber-700/30",
  western: "bg-amber-700/20 text-amber-400 border-amber-700/30",
  "conte-feerique": "bg-pink-500/20 text-pink-300 border-pink-500/30",
  romance: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "epopee-guerriere": "bg-green-500/20 text-green-300 border-green-500/30",
  cyberpunk: "bg-green-500/20 text-green-300 border-green-500/30",
  "arcane-reliques": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "science-fiction": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  scifi: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
};

interface UseAdventureListReturn {
  adventures: AdventureListItem[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalCount: number;
  totalPages: number;
  activeFilter: AdventureFilter;
  searchQuery: string;
  setCurrentPage: (page: number) => void;
  setActiveFilter: (filter: AdventureFilter) => void;
  setSearchQuery: (query: string) => void;
}

export function useAdventureList(): UseAdventureListReturn {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [adventures, setAdventures] = useState<AdventureListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<AdventureFilter>("tous");

  // Débounce de 300ms sur la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchRef = useRef(debouncedSearch);
  searchRef.current = debouncedSearch;
  const filterRef = useRef(activeFilter);
  filterRef.current = activeFilter;
  const pageRef = useRef(currentPage);
  pageRef.current = currentPage;
  // Compteur pour ignorer les réponses périmées
  const fetchRef = useRef(0);

  useEffect(() => {
    const fetchId = ++fetchRef.current;

    const fetchAdventures = async () => {
      const page = pageRef.current;
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      setLoading(true);
      setError(null);

      const queryBase = supabase
        .from("aventure")
        .select("id, titre, description, popularite, genre", { count: "exact" });

      // Filtre par genre (avec mapping des alias BDD)
      const dbValues = DB_GENRE_MAP[filterRef.current] ?? null;
      if (dbValues !== null) {
        if (dbValues.length === 1) {
          void queryBase.eq("genre", dbValues[0]);
        } else {
          void queryBase.in("genre", dbValues);
        }
      }

      // Recherche par titre
      const q = searchRef.current.trim();
      if (q) {
        void queryBase.ilike("titre", `%${q}%`);
      }

      queryBase.order("popularite", { ascending: false });

      const { data, error: fetchError, count } = await queryBase.range(from, to);

      // Ignorer les réponses périmées (requête plus récente déjà partie)
      if (fetchId !== fetchRef.current) return;

      if (fetchError) {
        console.error("useAdventureList fetch error:", fetchError);
        setError("Impossible de charger les aventures.");
        setAdventures([]);
        setTotalCount(0);
      } else {
        setAdventures(data ?? []);
        setTotalCount(count ?? 0);
      }
      setLoading(false);
    };

    fetchAdventures();
  }, [currentPage, debouncedSearch, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  return {
    adventures,
    loading,
    error,
    currentPage,
    totalCount,
    totalPages,
    activeFilter,
    searchQuery,
    setCurrentPage,
    setActiveFilter,
    setSearchQuery: (q: string) => {
      setSearchQuery(q);
      setCurrentPage(1);
    },
  };
}
