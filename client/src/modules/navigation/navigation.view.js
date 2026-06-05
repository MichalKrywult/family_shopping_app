import { DOM } from '../../shared/dom.js';
import { initResponsive } from '../../shared/responsive.js';
import { authService } from '../auth/auth.service.js';
import * as spacesService from '../spaces/spaces.service.js';
import * as shoppingService from '../shopping/shopping.service.js';
import { showToast } from '../../shared/toast.js';

export const navigationView = {
    async render() {
        const layoutHTML = `
            <div class="bottom-nav" id="bottomNav">
                <button id="navBtnSidebar" class="nav-item active">📋 Boards</button>
                <button id="navBtnMain" class="nav-item">🛒 Active List</button>
            </div>

            <div class="sidebar" style="display: flex; flex-direction: column; height: 100%;">
                <div class="global-spaces-wrapper" style="padding-bottom: 15px; border-bottom: 1px solid #ddd; margin-bottom: 15px;">
                    <h3 style="margin-top: 0;">🏠 Spaces</h3>
                    <div id="spacesSelectorContainer"></div>
                </div>

                <div class="module-content-wrapper" style="flex: 1; overflow-y: auto;">
                    <h3>📋 Boards</h3>
                    <div id="shopping-sidebar-slot"></div>
                </div>
                
                <div class="sidebar-footer" style="margin-top: auto; padding-top: 15px; border-top: 1px solid #ddd;">
                    <button id="navBtnLogout" class="delete-btn w-100">🚪 Logout</button>
                </div>
            </div>

            <div class="main-content">
                <div class="container" id="shopping-main-slot"></div>
            </div>
        `;

        const appLayout = document.getElementById('app-layout');
        if (appLayout) {
            appLayout.innerHTML = layoutHTML;
        }

        this.initEvents();
        await this.renderSpaces();
    },

    async renderSpaces() {
        const container = document.getElementById('spacesSelectorContainer');
        if (!container) return;

        const spaces = await spacesService.fetchUserSpaces();

        if (spaces.length === 0) {
            container.innerHTML = `
                <p class="text-muted font-italic font-sm mb-8">You are not in any space.</p>
                <button id="sidebarCreateSpaceBtn" class="w-100 btn-secondary">+ Create Space</button>
            `;
            document.getElementById('sidebarCreateSpaceBtn').addEventListener('click', () => this.handleCreateSpace());
            return;
        }

        let optionsHtml = spaces.map(space => 
            `<option value="${space.id}" ${space.id === spacesService.currentSpaceId ? 'selected' : ''}>🏠 ${space.name}</option>`
        ).join('');

        container.innerHTML = `
            <div style="display: flex; gap: 8px; margin-bottom: 10px;">
                <select id="spaceSelect" class="input-field" style="flex: 1; cursor: pointer;">
                    ${optionsHtml}
                </select>
                <button id="sidebarCreateSpaceBtn" title="Create new space" style="padding: 0 12px;">+</button>
                <button id="sidebarDeleteSpaceBtn" title="Leave/Delete space" class="delete-btn" style="padding: 0 12px;">🗑️</button>
            </div>
            <div style="display: flex; gap: 8px;">
                <input type="text" id="inviteUsernameInput" class="input-field font-sm" placeholder="Invite user..." style="flex: 1; height: 32px;">
                <button id="inviteUserBtn" class="font-sm" style="padding: 0 10px; height: 32px;">Invite</button>
            </div>
        `;

        document.getElementById('spaceSelect').addEventListener('change', async (e) => {
            spacesService.setCurrentSpaceId(parseInt(e.target.value));
            shoppingService.setCurrentListId(null);
            
            const { initShoppingModule } = await import('../shopping/shopping.view.js');
            await initShoppingModule();
        });

        document.getElementById('sidebarCreateSpaceBtn').addEventListener('click', () => this.handleCreateSpace());
        
        document.getElementById('sidebarDeleteSpaceBtn').addEventListener('click', async () => {
            if (!confirm("Are you sure you want to leave or delete this space?")) return;
            await spacesService.deleteSpace(spacesService.currentSpaceId);
            shoppingService.setCurrentListId(null);
            await this.renderSpaces();
            
            const { initShoppingModule } = await import('../shopping/shopping.view.js');
            await initShoppingModule();
            showToast("Space updated", "info");
        });

        document.getElementById('inviteUserBtn').addEventListener('click', async () => {
            const username = document.getElementById('inviteUsernameInput').value.trim();
            if (!username) return showToast("Enter username!", "error");
            try {
                await spacesService.addMemberToSpace(spacesService.currentSpaceId, username);
                showToast(`User ${username} added to space!`, "success");
                document.getElementById('inviteUsernameInput').value = '';
            } catch (e) {
            }
        });
    },

    async handleCreateSpace() {
        const name = prompt("Enter new space name:");
        if (!name || !name.trim()) return;
        await spacesService.createSpace(name.trim());
        shoppingService.setCurrentListId(null);
        await this.renderSpaces();
        
        const { initShoppingModule } = await import('../shopping/shopping.view.js');
        await initShoppingModule();
        showToast(`Space "${name}" created!`, "success");
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