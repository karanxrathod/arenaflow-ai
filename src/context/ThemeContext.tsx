import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isHighContrast: boolean;
  toggleHighContrast: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const getInitialTheme = (): Theme => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('arenaflow_theme') as Theme;
      if (stored) return stored;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'dark'; // We default to dark mode for MetLife operations console, but can switch
  };

  const getInitialHighContrast = (): boolean => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('arenaflow_high_contrast') === 'true';
    }
    return false;
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(getInitialHighContrast);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('arenaflow_theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (isHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    localStorage.setItem('arenaflow_high_contrast', String(isHighContrast));
  }, [isHighContrast]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleHighContrast = () => {
    setIsHighContrast(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isHighContrast, toggleHighContrast }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

