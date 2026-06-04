import { DOM } from '../../shared/dom.js';
import { initResponsive, switchMobileView } from '../../shared/responsive.js';
import { authService } from '../auth/auth.service.js';

export const navigationView = {
    render() {
        // 1. Dodajemy przycisk wylogowania na dole sidebaru (jeśli go tam jeszcze nie ma)
        // Zakładam, że w Twoim HTML wewnątrz .sidebar jest miejsce na opcje użytkownika.
        // Jeśli nie, dodajemy go dynamicznie:
        const logoutContainer = document.createElement('div');
        logoutContainer.className = 'sidebar-footer';
        logoutContainer.style.marginTop = 'auto'; // Pchnie przycisk na sam dół sidebaru
        logoutContainer.innerHTML = `
            <button id="navBtnLogout" class="delete-btn" style="width: 100%; margin-top: 20px;">🚪 Wyloguj</button>
        `;
        
        if (DOM.sidebar) {
            // Zabezpieczenie przed podwójnym dodaniem przy przeładowaniach
            if (!document.getElementById('navBtnLogout')) {
                DOM.sidebar.appendChild(logoutContainer);
            }
        }

        this.initEvents();
    },

    initEvents() {
        // Inicjalizujemy Twoją istniejącą logikę z responsive.js
        initResponsive();

        // Podpinamy nową logikę wylogowania
        const logoutBtn = document.getElementById('navBtnLogout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Czy chcesz się wylogować?')) {
                    authService.logout();
                }
            });
        }
    }
};