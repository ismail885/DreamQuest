"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

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

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const dark = saved !== null ? saved === "dark" : true;
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.classList.toggle("light", !dark);
    applyThemeVars(dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.classList.toggle("light", !next);
    applyThemeVars(next);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function applyThemeVars(dark: boolean) {
  const root = document.documentElement;
  if (dark) {
    // Dark mode
    root.style.setProperty("--surface-primary", "#0b0d1e");
    root.style.setProperty("--surface-secondary", "#151829");
    root.style.setProperty("--surface-tertiary", "#1a2235");
    root.style.setProperty("--content-primary", "#ffffff");
    root.style.setProperty("--content-secondary", "#9ca3af");
  } else {
    // Light mode
    root.style.setProperty("--surface-primary", "#f1f5f9");
    root.style.setProperty("--surface-secondary", "#e2e8f0");
    root.style.setProperty("--surface-tertiary", "#cbd5e1");
    root.style.setProperty("--content-primary", "#0f172a");
    root.style.setProperty("--content-secondary", "#475569");
  }
}

export function useTheme() {
  return useContext(ThemeContext);
}
