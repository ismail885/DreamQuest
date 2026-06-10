"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { AdventureListItem } from "@/types/adventure";

const ITEMS_PER_PAGE = 12;

export type AdventureFilter =
  | "tous"
  | "fantasy"
  | "scifi"
  | "horreur"
  | "romance"
  | "mystere"
  | "aventure"
  | "pirate"
  | "cyberpunk"
  | "mythologique"
  | "western";

export const FILTER_OPTIONS: { value: AdventureFilter; label: string }[] = [
  { value: "tous", label: "Tous" },
  { value: "fantasy", label: "Fantasy" },
  { value: "scifi", label: "Sci-Fi" },
  { value: "horreur", label: "Horreur" },
  { value: "romance", label: "Romance" },
  { value: "mystere", label: "Mystère" },
  { value: "aventure", label: "Aventure" },
  { value: "pirate", label: "Pirate" },
  { value: "cyberpunk", label: "Cyberpunk" },
  { value: "mythologique", label: "Mythologique" },
  { value: "western", label: "Western" },
];

/** Mappe un filtre utilisateur vers les valeurs possibles en BDD
 *  (l'éditeur manuel stocke `name.toLowerCase()` alors que le générateur
 *   automatique stocke `genreBDD` — ex: "fantasy" vs "fantaisy") */
const DB_GENRE_MAP: Record<string, string[] | null> = {
  tous: null,
  fantasy: ["fantasy", "fantaisy"],
  scifi: ["science-fiction", "scifi"],
  horreur: ["horreur", "horror"],
  romance: ["romance"],
  mystere: ["mystere", "policier"],
  aventure: ["aventure"],
  pirate: ["pirate"],
  cyberpunk: ["cyberpunk"],
  mythologique: ["mythologique"],
  western: ["western"],
};

/** Étiquette lisible pour un genre (utilisée dans AdventureCard) */
export const GENRE_LABELS: Record<string, string> = {
  fantasy: "Fantasy",
  fantaisy: "Fantasy",
  "science-fiction": "Sci-Fi",
  scifi: "Sci-Fi",
  horreur: "Horreur",
  horror: "Horreur",
  romance: "Romance",
  mystere: "Mystère",
  policier: "Policier",
  aventure: "Aventure",
  pirate: "Pirate",
  cyberpunk: "Cyberpunk",
  mythologique: "Mythologique",
  western: "Western",
};

/** Couleur de badge pour chaque genre */
export const GENRE_COLORS: Record<string, string> = {
  fantasy: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  fantaisy: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "science-fiction": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  scifi: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  horreur: "bg-red-500/20 text-red-300 border-red-500/30",
  horror: "bg-red-500/20 text-red-300 border-red-500/30",
  romance: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  mystere: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  policier: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  aventure: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  pirate: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
  cyberpunk: "bg-green-500/20 text-green-300 border-green-500/30",
  mythologique: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  western: "bg-amber-700/20 text-amber-400 border-amber-700/30",
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
