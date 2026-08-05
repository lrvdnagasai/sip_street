import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // Ctrl + N -> New Bill (Navigate to /billing)
      if (isCtrlOrCmd && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        navigate('/billing');
        return;
      }

      // Ctrl + F -> Focus search input
      if (isCtrlOrCmd && e.key.toLowerCase() === 'f') {
        const searchInput =
          document.querySelector('input[data-shortcut="search"]') ||
          document.querySelector('input[type="search"]') ||
          document.querySelector('input[placeholder*="Search"]') ||
          document.querySelector('input[placeholder*="search"]');

        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
}
