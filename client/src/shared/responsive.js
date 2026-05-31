import { DOM } from './dom.js';

export function switchMobileView(view) {
    if (!DOM.sidebar || !DOM.mainContent) return;

    if (view === 'sidebar') {
        DOM.sidebar.classList.add('active-mobile');
        DOM.mainContent.classList.remove('active-mobile');
        if (DOM.btnSidebar && DOM.btnMain) {
            DOM.btnSidebar.classList.add('active');
            DOM.btnMain.classList.remove('active');
        }
    } else {
        DOM.sidebar.classList.remove('active-mobile');
        DOM.mainContent.classList.add('active-mobile');
        if (DOM.btnSidebar && DOM.btnMain) {
            DOM.btnSidebar.classList.remove('active');
            DOM.btnMain.classList.add('active');
        }
    }

    localStorage.setItem('mobile_view', view);
}

export function initResponsive() {
    if (DOM.btnSidebar && DOM.btnMain) {
        DOM.btnSidebar.addEventListener('click', () => switchMobileView('sidebar'));
        DOM.btnMain.addEventListener('click', () => switchMobileView('main'));
    }

    if (window.innerWidth <= 768) {
        const savedView = localStorage.getItem('mobile_view') || 'sidebar';
        switchMobileView(savedView);
    }
}