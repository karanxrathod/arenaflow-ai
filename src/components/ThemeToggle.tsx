import { useTheme } from '../context/ThemeContext.js';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 bg-slate-950 border border-slate-850 rounded-xl hover:text-white hover:border-slate-700/80 transition-all cursor-pointer text-slate-400"
      aria-label="Toggle Theme"
      aria-pressed={theme === 'dark'}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-slate-400" />
      )}
    </button>
  );
}
