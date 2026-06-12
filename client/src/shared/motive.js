export function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const metaThemeColor = document.getElementById('meta-theme-color');

    function updateThemeUI(isDark) {
        if (isDark) {
            themeToggleBtn.textContent = '☀️';
            if (metaThemeColor) metaThemeColor.setAttribute('content', '#0f172a');
        } else {
            themeToggleBtn.textContent = '🌙';
            if (metaThemeColor) metaThemeColor.setAttribute('content', '#28a745');
        }
    }

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-mode');
        updateThemeUI(true);
    } else {
        updateThemeUI(false);
    }

    themeToggleBtn.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeUI(isDark);
    });
}
