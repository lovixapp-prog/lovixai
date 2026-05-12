import { useEffect } from 'react';

type Theme = 'dark' | 'light';

const STORAGE_KEY = 'lovix_theme';

function applyTheme() {
  const html = document.documentElement;
  html.classList.add('light');
  html.classList.remove('dark');
  try {
    localStorage.setItem(STORAGE_KEY, 'light');
  } catch {
    /* ignore storage failures */
  }
}

export function useTheme() {
  useEffect(() => {
    applyTheme();
  }, []);

  return { theme: 'light' as Theme, toggleTheme: applyTheme, isDark: false };
}
