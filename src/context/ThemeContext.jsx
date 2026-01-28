import { createContext, useContext, useEffect, useState } from 'react';

const initialState = {
  theme: 'dark',
  setTheme: () => null,
};

const ThemeProviderContext = createContext(initialState);

export function ThemeProvider({ children, ...props }) {
  // Forçar tema escuro: o app deve rodar apenas em modo escuro.
  const theme = 'dark';

  useEffect(() => {
    const root = window.document.documentElement;

    const applyDark = () => {
      // remove any light class and ensure dark is present
      root.classList.remove('light');
      root.classList.add('dark');
      try { localStorage.setItem('vite-ui-theme', 'dark'); } catch (e) {}
    };

    // Aplica imediatamente (independente do modo do sistema)
    applyDark();

    // Detecta mudanças no modo do sistema e, se o sistema ficar em dark,
    // garante que a aplicação permaneça em modo claro (branco).
    const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      // sempre aplicar tema claro, mesmo se sistema estiver em dark
      applyLight();
    };

    if (mq) {
      // addEventListener preferred, fallback to addListener for older browsers
      if (typeof mq.addEventListener === 'function') mq.addEventListener('change', handler);
      else if (typeof mq.addListener === 'function') mq.addListener(handler);
    }

    return () => {
      if (mq) {
        if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', handler);
        else if (typeof mq.removeListener === 'function') mq.removeListener(handler);
      }
    };
  }, []);

  const value = { theme, setTheme: () => null };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};