"use client";

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  fontSize: 16,
  setFontSize: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [fontSize, setFontSize] = useState<number>(16);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved settings
    const savedTheme = localStorage.getItem('boss-factory-theme') as Theme;
    const savedSize = localStorage.getItem('boss-factory-fontsize');
    
    if (savedTheme) setTheme(savedTheme);
    if (savedSize) setFontSize(Number(savedSize));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Apply Theme
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    // Apply Font Size
    root.style.fontSize = `${fontSize}px`;

    // Save
    localStorage.setItem('boss-factory-theme', theme);
    localStorage.setItem('boss-factory-fontsize', String(fontSize));

  }, [theme, fontSize, mounted]);

  const value = {
    theme,
    setTheme,
    fontSize,
    setFontSize,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
