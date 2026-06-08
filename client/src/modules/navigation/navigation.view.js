import { DOM } from '../../shared/dom.js';
import { initResponsive } from '../../shared/responsive.js';
import { authService } from '../auth/auth.service.js';
import * as spacesService from '../spaces/spaces.service.js';
import * as shoppingService from '../shopping/shopping.service.js';
import { showToast } from '../../shared/toast.js';

export const navigationView = {
    async render() {
        const username = authService.getCurrentUsername();
        const userInitials = username.substring(0, 2).toUpperCase();

        const layoutHTML = `
            <div class="bottom-nav" id="bottomNav">
                <button id="navBtnSidebar" class="nav-item active">📋 Boards</button>
                <button id="navBtnMain" class="nav-item">🛒 Active List</button>
            </div>

            <div class="sidebar">
                <div class="space-header-zone" style="padding-bottom: 15px; border-bottom: 1px solid var(--border); margin-bottom: 15px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                        <div id="spaceDropdownWrapper" style="flex: 1;"></div>
                        <button id="navBtnManageSpace" class="btn-secondary font-sm" style="padding: 5px 8px; font-size: 12px;" title="Manage Space Members">⚙️ Group</button>
                    </div>
                </div>

                <div id="shopping-sidebar-slot" style="flex: 1; display: flex; flex-direction: column; overflow-y: auto;"></div>
                
                <div class="sidebar-footer" style="margin-top: auto; padding-top: 15px; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                    <div class="user-info" style="display: flex; align-items: center; gap: 8px; min-width: 0;">
                        <div class="avatar" style="width: 32px; height: 32px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; font-size: 13px;">
                            ${userInitials}
                        </div>
                        <span style="font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text);">
                            ${username}
                        </span>
                    </div>
                    <div class="footer-actions" style="display: flex; gap: 4px; flex-shrink: 0;">
                        <button id="navBtnAccountSettings" class="btn-secondary" style="padding: 6px 8px; font-size: 13px;" title="Account Settings">⚙️</button>
                        <button id="navBtnLogout" class="delete-btn" style="padding: 6px 8px; font-size: 13px;" title="Logout">🚪</button>
                    </div>
                </div>
            </div>

            <div class="main-content">
                <div class="container" id="shopping-main-slot"></div>
            </div>

            <div id="spaceManagementModal" class="modal" style="display: none;">
                <div class="modal-content-card">
                    <h3>👥 Group Settings</h3>
                    <div id="modalSpaceActions"></div>
                    <hr style="border:0; border-top:1px solid var(--border); margin: 15px 0;">
                    <div class="modal-actions">
                        <button id="closeSpaceModalBtn" class="w-100">Close</button>
                    </div>
                </div>
            </div>

            <div id="accountSettingsModal" class="modal" style="display: none;">
                <div class="modal-content-card">
                    <h3>⚙️ Account Settings</h3>
                    <p class="text-muted font-sm">Logged in as: <strong>${username}</strong></p>
                    
                    <div style="margin-top: 15px; padding: 15px; background: rgba(0,0,0,0.02); border-radius: 6px; border: 1px dashed var(--border);">
                        <p style="margin: 0; font-size: 13px; text-align: center;" class="text-muted">
                            ⚙️ Account editing module is prepared for future extension (password change, user tags, profile picture).
                        </p>
                    </div>
                    
                    <hr style="border:0; border-top:1px solid var(--border); margin: 20px 0;">
                    <div class="modal-actions">
                        <button id="closeAccountModalBtn" class="w-100">Close</button>
                    </div>
                </div>
            </div>
        `;

        const appLayout = document.getElementById('app-layout');
        if (appLayout) {
            appLayout.innerHTML = layoutHTML;
        }

        this.initEvents();
        await this.renderSpacesControl();
    },

    async renderSpacesControl() {
        const container = document.getElementById('spaceDropdownWrapper');
        if (!container) return;

        const spaces = await spacesService.fetchUserSpaces();

        if (spaces.length === 0) {
            container.innerHTML = `<button id="navCreateSpaceBtn" class="btn-success w-100" style="padding: 6px; font-size: 13px;">+ Create Space</button>`;
            document.getElementById('navCreateSpaceBtn').addEventListener('click', () => this.handleCreateSpace());
            this.toggleManageButton(false);
            return;
        }

        this.toggleManageButton(true);

        let optionsHtml = spaces.map(space => 
            `<option value="${space.id}" ${space.id === spacesService.currentSpaceId ? 'selected' : ''}>🏠 ${space.name}</option>`
        ).join('');

        container.innerHTML = `
            <div style="display: flex; gap: 4px; width: 100%;">
                <select id="spaceSelect" class="input-field" style="cursor: pointer; font-weight: bold; padding: 4px; font-size: 13px; flex: 1;">
                    ${optionsHtml}
                </select>
                <button id="navCreateSpaceBtn" title="Create new space" style="padding: 0 8px; font-size: 13px;">+</button>
            </div>
        `;

        document.getElementById('spaceSelect').addEventListener('change', async (e) => {
            spacesService.setCurrentSpaceId(parseInt(e.target.value));
            shoppingService.setCurrentListId(null);
            
            const { initShoppingModule } = await import('../shopping/shopping.view.js');
            await initShoppingModule();
        });

        document.getElementById('navCreateSpaceBtn').addEventListener('click', () => this.handleCreateSpace());
    },

    toggleManageButton(show) {
        const btn = document.getElementById('navBtnManageSpace');
        if (btn) btn.style.display = show ? 'block' : 'none';
    },

    async handleCreateSpace() {
        const name = prompt("Enter new space name:");
        if (!name || !name.trim()) return;
        await spacesService.createSpace(name.trim());
        shoppingService.setCurrentListId(null);
        await this.renderSpacesControl();
        
        const { initShoppingModule } = await import('../shopping/shopping.view.js');
        await initShoppingModule();
        showToast(`Space "${name}" created!`, "success");
    },

    openManagementModal() {
        const modal = document.getElementById('spaceManagementModal');
        const actionsContainer = document.getElementById('modalSpaceActions');
        if (!modal || !actionsContainer) return;

        const currentSpace = spacesService.spacesList.find(s => s.id === spacesService.currentSpaceId);
        const spaceName = currentSpace ? currentSpace.name : 'Current Space';

        actionsContainer.innerHTML = `
            <p>Managing space: <strong>${spaceName}</strong></p>
            <div style="margin-top: 15px;">
                <label class="modal-label" style="font-size: 13px; font-weight: 600;">Add user to this space:</label>
                <div style="display: flex; gap: 8px; margin-top: 5px;">
                    <input type="text" id="modalInviteInput" class="input-field" placeholder="Username (nick)...">
                    <button id="modalInviteBtn" class="btn-primary">Add</button>
                </div>
            </div>
            <div style="margin-top: 30px;">
                <button id="modalDeleteSpaceBtn" class="delete-btn w-100" style="padding: 10px;">🗑️ Leave / Delete Space</button>
            </div>
        `;

        modal.style.display = 'flex';

        document.getElementById('modalInviteBtn').addEventListener('click', async () => {
            const username = document.getElementById('modalInviteInput').value.trim();
            if (!username) return showToast("Enter username!", "error");
            try {
                await spacesService.addMemberToSpace(spacesService.currentSpaceId, username);
                showToast(`User ${username} added!`, "success");
                document.getElementById('modalInviteInput').value = '';
            } catch (e) {}
        });

        document.getElementById('modalDeleteSpaceBtn').addEventListener('click', async () => {
            if (!confirm("Delete or leave this space? Structural boards inside will be lost.")) return;
            await spacesService.deleteSpace(spacesService.currentSpaceId);
            shoppingService.setCurrentListId(null);
            modal.style.display = 'none';
            
            await this.renderSpacesControl();
            const { initShoppingModule } = await import('../shopping/shopping.view.js');
            await initShoppingModule();
            showToast("Space removed", "info");
        });
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

        const manageBtn = document.getElementById('navBtnManageSpace');
        if (manageBtn) {
            manageBtn.addEventListener('click', () => this.openManagementModal());
        }

        const closeModalBtn = document.getElementById('closeSpaceModalBtn');
        if (closeSpaceModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                document.getElementById('spaceManagementModal').style.display = 'none';
            });
        }
        const accountBtn = document.getElementById('navBtnAccountSettings');
        if (accountBtn) {
            accountBtn.addEventListener('click', () => {
                document.getElementById('accountSettingsModal').style.display = 'flex';
            });
        }
        const closeAccountModalBtn = document.getElementById('closeAccountModalBtn');
        if (closeAccountModalBtn) {
            closeAccountModalBtn.addEventListener('click', () => {
                document.getElementById('accountSettingsModal').style.display = 'none';
            });
        }
    }
};