import { DOM } from '../../shared/dom.js';
import { initResponsive } from '../../shared/responsive.js';
import { authService } from '../auth/auth.service.js';
import * as spacesService from '../spaces/spaces.service.js';
import * as shoppingService from '../shopping/shopping.service.js';
import { showToast } from '../../shared/toast.js';
import { initThemeToggle } from '../../shared/motive.js';

export const navigationView = {
    async render() {
        const displayName = authService.getCurrentDisplayName();
        const handle = authService.getCurrentHandle();
        const userInitials = displayName.substring(0, 2).toUpperCase();

        const layoutHTML = `
            <div class="bottom-nav" id="bottomNav">
                <button id="navBtnSidebar" class="nav-item active">📋 Boards</button>
                <button id="navBtnMain" class="nav-item">🛒 Active List</button>
            </div>

            <div class="sidebar">
                <div class="space-header-zone">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                        <div id="spaceDropdownWrapper" style="flex: 1;"></div>
                        <button id="navBtnManageSpace" class="btn-secondary font-sm" title="Manage Space Members">⚙️ Space</button>
                    </div>
                </div>

                <div id="shopping-sidebar-slot" style="flex: 1; display: flex; flex-direction: column; overflow-y: auto;"></div>
                
                <div class="sidebar-footer">
                    <div id="triggerAccountModal" class="user-profile-trigger">
                        <div class="avatar" id="sidebarAvatar">${userInitials}</div>
                        <div class="user-meta">
                            <span id="sidebarDisplayName" class="user-display-name">${displayName}</span>
                            <span id="sidebarHandle" class="user-handle">@${handle}</span>
                        </div>
                        <div>
                            <button class="text-muted" style="font-size: 12px; color: #ffffff;">⚙️</button>
                        </div>
                    </div>
                    <button id="navBtnLogout" class="delete-btn w-100">
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            <div class="main-content">
                <div class="container" id="shopping-main-slot"></div>
            </div>

            <div id="spaceManagementModal" class="modal">
                <div class="modal-content-card">
                    <h3>👥 Space Settings</h3>
                    <div id="modalSpaceActions"></div>
                    <hr>
                    <div class="modal-actions">
                        <button id="closeSpaceModalBtn" class="w-100 btn-secondary">Close</button>
                    </div>
                </div>
            </div>

            <div id="accountSettingsModal" class="modal">
                <div class="modal-content-card">
                    <h3>⚙️ Account Settings</h3>
                    
                    <div style="margin-top: 15px; display: flex; flex-direction: column; gap: 12px;">
                        <div>
                            <label class="modal-label">Display Name</label>
                            <input type="text" id="accEditDisplayName" class="input-field" value="${displayName}">
                        </div>
                        <div>
                            <label class="modal-label">Username (@handle)</label>
                            <input type="text" id="accEditHandle" class="input-field" value="${handle}">
                        </div>
                        <button id="btnSaveAccountDetails" class="btn-primary" style="align-self: flex-end;">Save Profile</button>
                    </div>

                    <hr>

                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <h4>Security & Password</h4>
                        <div>
                            <label class="modal-label">Current Password</label>
                            <input type="password" id="accCurrentPassword" class="input-field" placeholder="••••••••">
                        </div>
                        <div>
                            <label class="modal-label">New Password</label>
                            <input type="password" id="accNewPassword" class="input-field" placeholder="Minimum 6 characters">
                        </div>
                        <button id="btnSaveAccountPassword" class="btn-primary" style="align-self: flex-end;">Update Password</button>
                    </div>
                    
                    <hr>
                        <div><button id="theme-toggle" class="theme-toggle-btn" aria-label="Toggle dark mode">🌙</button></div>
                    <hr>

                    <div class="modal-actions">
                        <button id="closeAccountModalBtn" class="w-100 cancel-btn">Close</button>
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
            document.getElementById('navCreateSpaceBtn').onclick = () => this.handleCreateSpace();
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

        document.getElementById('navCreateSpaceBtn').onclick = () => this.handleCreateSpace();
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

    async openManagementModal() {
        const modal = document.getElementById('spaceManagementModal');
        const actionsContainer = document.getElementById('modalSpaceActions');
        if (!modal || !actionsContainer) return;

        const currentSpaceId = spacesService.currentSpaceId;
        actionsContainer.innerHTML = `<p class="text-muted" style="font-size: 13px; text-align: center; padding: 10px;">Loading space data...</p>`;
        modal.style.display = 'flex';

        try {
            const members = await spacesService.fetchSpaceMembers(currentSpaceId);
            let spaces = spacesService.spacesList;
            if (!spaces || spaces.length === 0) {
                spaces = await spacesService.fetchUserSpaces();
            }
            const currentSpace = spaces.find(s => s.id === currentSpaceId);
            const spaceName = currentSpace ? currentSpace.name : 'Current Space';

            const membersListHtml = members.map(member => {
                return `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px; background: rgba(0,0,0,0.02); border-radius: 6px; margin-bottom: 6px; border: 1px solid var(--border);">
                        <div style="display: flex; flex-direction: column; min-width: 0; padding-right: 8px;">
                            <span style="font-size: 13px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${member.display_name}
                            </span>
                            <span style="font-size: 11px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">@${member.username}</span>
                        </div>
                        ${!member.is_owner ? `
                            <button class="kick-member-btn delete-btn" data-user-id="${member.id}" data-username="${member.username}" style="padding: 4px 8px; font-size: 12px; flex-shrink: 0;">
                                Remove
                            </button>
                        ` : '<span style="font-size: 11px; color: var(--muted); font-style: italic; padding-right: 5px; flex-shrink: 0;">Owner</span>'}
                    </div>
                `;
            }).join('');

            actionsContainer.innerHTML = `
                <p>Managing space: <strong id="modalSpaceName">${spaceName}</strong></p>
                <label class="modal-label" style="font-size: 13px; font-weight: 600;">Edit space name:</label>
                <div style="display: flex; gap: 8px; margin-top: 5px; margin-bottom: 15px;">
                    <input type="text" id="modalEditNameInput" class="input-field" placeholder="New name...">
                    <button id="modalEditNameBtn" class="btn-primary">Edit</button>
                </div>
                <div style="margin-top: 15px;">
                    <label class="modal-label" style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 5px;">Current Members:</label>
                    <div id="modalMembersList" style="max-height: 160px; overflow-y: auto; margin-bottom: 15px; padding-right: 2px;">
                        ${membersListHtml || '<p class="text-muted" style="font-size: 12px;">No members found.</p>'}
                    </div>
                    <label class="modal-label" style="font-size: 13px; font-weight: 600;">Add user to this space:</label>
                    <div style="display: flex; gap: 8px; margin-top: 5px;">
                        <input type="text" id="modalInviteInput" class="input-field" placeholder="Username (nick)...">
                        <button id="modalInviteBtn" class="btn-primary">Add</button>
                    </div>
                </div>
                <div style="margin-top: 25px;">
                    <button id="modalDeleteSpaceBtn" class="delete-btn w-100" style="padding: 10px;">🗑️ Leave / Delete Space</button>
                </div>
            `;

            this.bindSpaceModalEvents(currentSpaceId, modal);
        } catch (error) {
            actionsContainer.innerHTML = `<p style="color: var(--danger); font-size: 13px; text-align: center;">Error loading workspace members.</p>`;
        }
    },

    bindSpaceModalEvents(currentSpaceId, modal) {
        document.querySelectorAll('.kick-member-btn').forEach(btn => {
            btn.onclick = async (e) => {
                const button = e.currentTarget;
                const userId = button.getAttribute('data-user-id');
                const targetUsername = button.getAttribute('data-username');
                if (!confirm(`Are you sure you want to remove @${targetUsername} from this space?`)) return;
                try {
                    button.disabled = true;
                    await spacesService.removeMemberFromSpace(currentSpaceId, userId);
                    showToast(`User @${targetUsername} removed.`, "info");
                    this.openManagementModal();
                } catch (err) {
                    button.disabled = false;
                    showToast(err.message || "Failed to remove member", "error");
                }
            };
        });

        document.getElementById('modalInviteBtn').onclick = async (e) => {
            const button = e.currentTarget;
            const username = document.getElementById('modalInviteInput').value.trim();
            if (!username) return showToast("Enter username!", "error");
            try {
                button.disabled = true;
                await spacesService.addMemberToSpace(currentSpaceId, username);
                showToast(`User ${username} added!`, "success");
                this.openManagementModal(); 
            } catch (e) {
                button.disabled = false;
            }
        };

        document.getElementById('modalEditNameBtn').onclick = async (e) => {
            const button = e.currentTarget;
            const new_name = document.getElementById('modalEditNameInput').value.trim();
            if (!new_name) return showToast("Enter new space name!", "error");
            try {
                button.disabled = true;
                await spacesService.editSpaceName(currentSpaceId, new_name);
                showToast(`Space name edited successfully!`, "success");
                document.getElementById('modalEditNameInput').value = '';
                document.getElementById("modalSpaceName").textContent = new_name;
                await this.renderSpacesControl();
                button.disabled = false;
            } catch (e) {
                button.disabled = false;
            }
        };

        document.getElementById('modalDeleteSpaceBtn').onclick = async (e) => {
            const button = e.currentTarget;
            if (!confirm("Delete or leave this space? Structural boards inside will be lost.")) return;
            try {
                button.disabled = true;
                await spacesService.deleteSpace(currentSpaceId);
                shoppingService.setCurrentListId(null);
                modal.style.display = 'none';
                await this.renderSpacesControl();
                const { initShoppingModule } = await import('../shopping/shopping.view.js');
                await initShoppingModule();
                showToast("Space removed", "info");
            } catch (e) {
                button.disabled = false;
            }
        };
    },

    initEvents() {
        initResponsive();
        initThemeToggle();
        
        document.getElementById('navBtnLogout').onclick = () => {
            if (confirm('Are you sure you want to logout?')) {
                authService.logout();
            }
        };

        document.getElementById('navBtnManageSpace').onclick = () => this.openManagementModal();
        document.getElementById('closeSpaceModalBtn').onclick = () => {
            document.getElementById('spaceManagementModal').style.display = 'none';
        };

        document.getElementById('triggerAccountModal').onclick = () => {
            document.getElementById('accountSettingsModal').style.display = 'flex';
        };
        document.getElementById('closeAccountModalBtn').onclick = () => {
            document.getElementById('accountSettingsModal').style.display = 'none';
        };

        document.getElementById('btnSaveAccountDetails').onclick = async (e) => {
        const btn = e.currentTarget;
        const dName = document.getElementById('accEditDisplayName').value.trim();
        const handle = document.getElementById('accEditHandle').value.trim().replace('@', '');

        if (!dName || !handle) return showToast("Fields cannot be empty!", "error");

        try {
                btn.disabled = true;
                
                await authService.updateProfileDetails(dName, handle);
                
                document.getElementById('sidebarDisplayName').textContent = dName;
                document.getElementById('sidebarHandle').textContent = `@${handle}`;
                document.getElementById('sidebarAvatar').textContent = dName.substring(0, 2).toUpperCase();

                showToast("Profile updated successfully!", "success");
            } catch (err) {
                showToast(err.message || "Failed to update profile", "error");
            } finally {
                btn.disabled = false;
            }
        };

        document.getElementById('btnSaveAccountPassword').onclick = async (e) => {
            const btn = e.currentTarget;
            const currentPwdInput = document.getElementById('accCurrentPassword');
            const newPwdInput = document.getElementById('accNewPassword');

            if (!currentPwdInput.value || !newPwdInput.value) {
                return showToast("Enter both current and new password!", "error");
            }
            
            try {
                btn.disabled = true;
                
                await authService.updatePassword(currentPwdInput.value, newPwdInput.value);
                

                currentPwdInput.value = '';
                newPwdInput.value = '';
                
                showToast("Password updated successfully!", "success");
            } catch (err) {
                showToast(err.message || "Failed to update password", "error");
            } finally {
                btn.disabled = false;
            }
        };
    }
};


