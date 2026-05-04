"use client";

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
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
  storageKey = 'boss-factory-ui',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [fontSize, setFontSize] = useState<number>(16);
  const [mounted, setMounted] = useState(false);

  // 1. Load from local storage on mount (Client-side only)
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem(storageKey + '-theme') as Theme;
    const savedSize = localStorage.getItem(storageKey + '-fontsize');
    
    if (savedTheme) {
      setTheme(savedTheme);
    }
    if (savedSize) {
      setFontSize(Number(savedSize));
    }
  }, [storageKey]);

  // 2. Apply theme to HTML element and Font Size to Root
  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    
    // Remove both classes first
    root.classList.remove('light', 'dark');

    // Determine actual theme
    let actualTheme = theme;
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      actualTheme = systemTheme;
    }

    // Add the correct class
    root.classList.add(actualTheme);
    
    // Set data attribute for extra safety with CSS variables
    root.setAttribute('data-theme', actualTheme);

    // Apply font size
    root.style.fontSize = `${fontSize}px`;

    // Save to storage
    localStorage.setItem(storageKey + '-theme', theme);
    localStorage.setItem(storageKey + '-fontsize', String(fontSize));

  }, [theme, fontSize, mounted, storageKey]);

  // Listen for system changes if 'system' is selected
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      const newSystemTheme = mediaQuery.matches ? 'dark' : 'light';
      root.classList.add(newSystemTheme);
      root.setAttribute('data-theme', newSystemTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

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
