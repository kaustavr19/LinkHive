import { useEffect, useState } from 'react';

export type ThemeChoice = 'light' | 'dark';
const STORAGE_KEY = 'linkhive-theme';

// ─────────────────────────────────────────────────────────────────────────────
// PRECEDENCE RULE (explicit, by request):
//   A stored manual choice ALWAYS wins and stops following the system. We only
//   fall back to prefers-color-scheme when NO manual choice has been stored.
//   So once the user has spoken, later OS theme changes are ignored.
// ─────────────────────────────────────────────────────────────────────────────

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function readStored(): ThemeChoice | null {
  const v = localStorage.getItem(STORAGE_KEY);
  return v === 'light' || v === 'dark' ? v : null;
}

function resolveInitial(): ThemeChoice {
  const stored = readStored();
  if (stored) return stored; // manual choice wins
  return systemPrefersDark() ? 'dark' : 'light';
}

function apply(theme: ThemeChoice): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeChoice>(resolveInitial);

  useEffect(() => {
    apply(theme);
  }, [theme]);

  // Only follow the system while the user has made no manual choice.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (!readStored()) setTheme(mq.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, next); // manual choice now wins forever
      return next;
    });
  };

  return { theme, toggle };
}
