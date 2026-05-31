if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('public/sw.js')
            .then(reg => console.log('PWA Service Worker registered!'))
            .catch(err => console.error('PWA Error:', err));
    });
}