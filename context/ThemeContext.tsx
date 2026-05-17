"use client";

import { createContext, useContext, ReactNode } from "react";

const ThemeContext = createContext<{ isDark: true }>({ isDark: true });

export function ThemeProvider({ children }: { children: ReactNode }) {
 return (
 <ThemeContext.Provider value={{ isDark: true }}>
 {children}
 </ThemeContext.Provider>
 );
}

export function useTheme() {
 return useContext(ThemeContext);
}

