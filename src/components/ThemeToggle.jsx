import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext'; // Importa o hook

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { name: 'light', icon: Sun },
    { name: 'dark', icon: Moon },
    { name: 'system', icon: Monitor },
  ];

  return (
    <div className="fixed top-5 right-5 z-50">
      <div className="flex items-center p-1 bg-gray-200 dark:bg-gray-800 rounded-full border border-gray-300 dark:border-gray-700 shadow-md">
        {themes.map((t) => {
          const Icon = t.icon;
          const isActive = theme === t.name;
          return (
            <button
              key={t.name}
              // Correção: Removido o 'as ...'
              onClick={() => setTheme(t.name)}
              className={`
                p-2 rounded-full transition-all duration-300
                ${isActive
                  ? 'bg-white dark:bg-gray-900 text-[#57B952] shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }
              `}
              aria-label={`Mudar para tema ${t.name}`}
            >
              <Icon size={18} />
            </button>
          );
        })}
      </div>
    </div>
  );
}