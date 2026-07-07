import { useEffect } from 'react';

type TabType = 'dashboard' | 'twin' | 'fan' | 'vendor' | 'safety' | 'analytics' | 'settings' | 'profile';

interface UseKeyboardShortcutsProps {
  setActiveTab: (tab: TabType) => void;
  onCloseAllPanels?: () => void;
}

export const useKeyboardShortcuts = ({ setActiveTab, onCloseAllPanels }: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering shortcuts when typing inside form elements (inputs, textareas, etc.)
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.getAttribute('contenteditable') === 'true'
      );

      // Ctrl/Cmd + K → Focus search bar
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('[data-search]');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // If typing in input, ignore navigation shortcuts
      if (isInput) return;

      // 1-6 → Quick navigation between operational modules
      switch (e.key) {
        case '1':
          e.preventDefault();
          setActiveTab('dashboard');
          break;
        case '2':
          e.preventDefault();
          setActiveTab('twin');
          break;
        case '3':
          e.preventDefault();
          setActiveTab('fan');
          break;
        case '4':
          e.preventDefault();
          setActiveTab('vendor');
          break;
        case '5':
          e.preventDefault();
          setActiveTab('safety');
          break;
        case '6':
          e.preventDefault();
          setActiveTab('analytics');
          break;
        case '7':
          e.preventDefault();
          setActiveTab('settings');
          break;
        case '8':
          e.preventDefault();
          setActiveTab('profile');
          break;
        case 'Escape':
          e.preventDefault();
          if (onCloseAllPanels) {
            onCloseAllPanels();
          }
          // Remove focus from any active input
          if (activeEl instanceof HTMLElement) {
            activeEl.blur();
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab, onCloseAllPanels]);
};
