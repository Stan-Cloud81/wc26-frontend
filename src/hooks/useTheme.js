import { useEffect, useState } from 'react';

function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('wc26_theme');
    return saved || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('wc26_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
}

export default useTheme;
