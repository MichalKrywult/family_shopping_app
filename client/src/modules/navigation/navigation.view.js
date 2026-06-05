import { DOM } from '../../shared/dom.js';
import { initResponsive } from '../../shared/responsive.js';
import { authService } from '../auth/auth.service.js';

export const navigationView = {
    render() {
        const layoutHTML = `
            <div class="bottom-nav" id="bottomNav">
                <button id="navBtnSidebar" class="nav-item active">📋 Boards</button>
                <button id="navBtnMain" class="nav-item">🛒 Active List</button>
            </div>

            <div class="sidebar">
                <h3>📋 Boards</h3>
                
                <div id="shopping-sidebar-slot"></div>
                
                <div class="sidebar-footer" style="margin-top: auto;">
                    <button id="navBtnLogout" class="delete-btn w-100" style="margin-top: 20px;">🚪 Logout</button>
                </div>
            </div>

            <div class="main-content">
                <div class="container" id="shopping-main-slot">
                    </div>
            </div>
        `;

        const appLayout = document.getElementById('app-layout');
        if (appLayout) {
            appLayout.innerHTML = layoutHTML;
        }

        this.initEvents();
    },

    initEvents() {
        initResponsive();

        const logoutBtn = document.getElementById('navBtnLogout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to logout?')) {
                    authService.logout();
                }
            });
        }
    }
};