import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Detecta o tema do sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(mediaQuery.matches ? 'dark' : 'light');

    const handler = (e) => setTheme(e.matches ? 'dark' : 'light');
    mediaQuery.addListener(handler);
    
    return () => mediaQuery.removeListener(handler);
  }, []);

  return theme;
};