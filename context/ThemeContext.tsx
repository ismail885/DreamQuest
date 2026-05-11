"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const THEME_COOKIE = "dreamquest_theme";

function getThemeFromCookie(): boolean {
  if (typeof document === "undefined") return true; // SSR default = dark
  const match = document.cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE}=([^;]+)`));
  return match ? match[1] === "dark" : true;
}

function setThemeCookie(dark: boolean) {
  document.cookie = `${THEME_COOKIE}=${dark ? "dark" : "light"}; Path=/; SameSite=Strict; Max-Age=${365 * 24 * 60 * 60}`;
}

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  const applyThemeVars = (dark: boolean) => {
    const root = document.documentElement;
    if (dark) {
      root.style.setProperty("--surface-primary", "#0b0d1e");
      root.style.setProperty("--surface-secondary", "#151829");
      root.style.setProperty("--surface-tertiary", "#1a2235");
      root.style.setProperty("--content-primary", "#ffffff");
      root.style.setProperty("--content-secondary", "#9ca3af");
    } else {
      root.style.setProperty("--surface-primary", "#f1f5f9");
      root.style.setProperty("--surface-secondary", "#e2e8f0");
      root.style.setProperty("--surface-tertiary", "#cbd5e1");
      root.style.setProperty("--content-primary", "#0f172a");
      root.style.setProperty("--content-secondary", "#475569");
    }
  };

  const handleThemeChange = (dark: boolean) => {
    setIsDark(dark);
    setThemeCookie(dark);
    document.documentElement.classList.toggle("dark", dark);
    applyThemeVars(dark);
    // Write to localStorage for cross-tab sync only (the `storage` event fires for localStorage)
    localStorage.setItem("theme", dark ? "dark" : "light");
  };

  useEffect(() => {
    const dark = getThemeFromCookie();
    handleThemeChange(dark);

    // Double rAF to ensure we're past first paint before enabling transitions
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.classList.remove("disable-transition");
      });
    });

    setMounted(true);

    // Cross-tab sync via storage event (fires when another tab writes to localStorage)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "theme" && e.newValue) {
        const newDark = e.newValue === "dark";
        setIsDark(newDark);
        setThemeCookie(newDark);
        document.documentElement.classList.toggle("dark", newDark);
        applyThemeVars(newDark);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    handleThemeChange(next);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
