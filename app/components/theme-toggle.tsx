'use client';

export function ThemeToggle() {
  function toggleTheme() {
    const current = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    localStorage.setItem('service-theme', next);
  }

  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label="Переключить тему">
      <span>Тема</span>
      <span className="theme-toggle-track" aria-hidden="true"><span /></span>
    </button>
  );
}
