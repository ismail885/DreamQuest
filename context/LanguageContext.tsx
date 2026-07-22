"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import type { Lang } from "@/lib/i18n/types";
import type { TranslationKey } from "@/lib/i18n";
import { t as translate } from "@/lib/i18n";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLanguage(): Lang {
  if (typeof window === "undefined") return "fr";
  const stored = window.localStorage.getItem("dreamquest_langue");
  if (stored === "en" || stored === "fr") return stored;
  return "fr";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLanguage);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      const initial = getInitialLanguage();
      if (initial !== "fr") {
        document.documentElement.lang = initial;
      }
    }
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("dreamquest_langue", newLang);
    }
    document.documentElement.lang = newLang;
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => translate(key, lang),
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
