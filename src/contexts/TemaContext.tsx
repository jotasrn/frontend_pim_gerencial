import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'light';
  }
  const storedPrefs = window.localStorage.getItem('theme');

  if (storedPrefs === 'light' || storedPrefs === 'dark') {
    return storedPrefs;
  }

  return 'light';
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const rawSetTheme = (newTheme: Theme) => {
    const root = window.document.documentElement;
    const isDark = newTheme === 'dark';

    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(newTheme);
    window.localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
  };

  useEffect(() => {
    rawSetTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    rawSetTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};