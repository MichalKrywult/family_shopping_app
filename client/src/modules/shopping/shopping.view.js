import * as shoppingService from './shopping.service.js';
import * as spacesService from '../spaces/spaces.service.js';
import { showToast } from '../../shared/toast.js';
import { DOM } from '../../shared/dom.js';

async function refreshShoppingUI() {
    const hasSpace = spacesService.currentSpaceId !== null;
    const createListForm = document.getElementById('createListForm');
    
    if (!hasSpace) {
        if (createListForm) createListForm.style.display = 'none';
        DOM.listsDashboard.innerHTML = '';
        const blankState = document.getElementById('blankState');
        if (blankState) {
            blankState.innerHTML = `
                <h2>No Active Space</h2>
                <p>You don't belong to any shopping space yet. Create or select one in the sidebar above!</p>
            `;
        }
        return;
    }

    if (createListForm) createListForm.style.display = 'block';
    const blankState = document.getElementById('blankState');
    if (blankState) {
        blankState.innerHTML = `
            <h2>Welcome to Shopping Boards!</h2>
            <p>Select a board from the sidebar or create a new one to start shopping.</p>
        `;
    }

    await renderListsDashboard();

    const currentListCard = document.getElementById('currentListCard');
    if (shoppingService.currentListId) {
        const currentList = await shoppingService.loadListItems();
        if (currentList) {
            await handleSelectList(currentList.id, currentList.name);
        } else {
            shoppingService.setCurrentListId(null);
            if (currentListCard) currentListCard.style.display = 'none';
            if (blankState) blankState.style.display = 'block';
        }
    } else {
        if (currentListCard) currentListCard.style.display = 'none';
        if (blankState) blankState.style.display = 'block';
    }
}

async function renderListsDashboard() {
    const lists = await shoppingService.getAllLists();
    const dashboard = document.getElementById('listsDashboard');
    if (!dashboard) return;
    
    dashboard.innerHTML = '';
    
    if (!lists || lists.length === 0) {
        dashboard.innerHTML = '<p class="text-muted font-italic font-sm">No boards found in this space.</p>';
        return;
    }
    
    lists.forEach(list => {
        const button = document.createElement('button');
        button.className = 'list-selector';
        button.id = `list-btn-${list.id}`;
        
        const count = list.items_count !== undefined ? list.items_count : 0;
        button.innerHTML = `📦 ${list.name} <strong class="text-muted font-sm">x${count}</strong>`;
        
        button.addEventListener('click', () => handleSelectList(list.id, list.name));
        dashboard.appendChild(button);
    });
}

async function renderItems(listData) {
    if (!listData) listData = await shoppingService.loadListItems();
    const container = document.getElementById('itemsContainer');
    if (!container || !listData || !listData.items) return 0;
    
    listData.items.sort((a, b) => {
        if (a.is_done !== b.is_done) return Number(a.is_done) - Number(b.is_done);
        return Number(a.id) - Number(b.id);
    });
            
    container.innerHTML = '';

    listData.items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'item';
        div.dataset.itemId = item.id;
        
        const isDone = Number(item.is_done) === 1;
        const isChecked = isDone ? 'checked' : '';
        
        div.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 10px;">
                <div class="item-checkbox-wrapper" style="display: flex; align-items: center; gap: 12px; cursor: pointer; flex: 1; min-width: 0;">
                    <input type="checkbox" ${isChecked} style="cursor: pointer; width: 18px; height: 18px; pointer-events: none; flex-shrink: 0;">
                    <span class="${isDone ? 'done' : ''}" style="font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${item.name} <strong class="text-muted font-sm">x${item.quantity}</strong>
                    </span>
                </div>
                <div style="display: flex; gap: 8px; flex-shrink: 0;">
                    <button class="action-edit-btn edit-btn">✏️</button>
                    <button class="action-delete-btn delete-btn">X</button>
                </div>
            </div>
        `;
        div.querySelector('.item-checkbox-wrapper').addEventListener('click', () => handleToggleItem(item.id));
        div.querySelector('.action-edit-btn').addEventListener('click', (e) => handleEditItem(e, item.id, item.name, item.quantity));
        div.querySelector('.action-delete-btn').addEventListener('click', (e) => handleDeleteItem(e, item.id));
        container.appendChild(div);
    });

    return listData.items.filter(item => Number(item.is_done) === 0).length;
}

async function updateUI() {
    const listData = await shoppingService.loadListItems();
    if (!listData) return;

    const activeCount = await renderItems(listData);
    const currentListName = document.getElementById('currentListName');
    if (currentListName) {
        currentListName.innerHTML = `${listData.name} <strong class="text-muted font-sm">Items left: ${activeCount}</strong>`;
    }

    const activeListButton = document.getElementById(`list-btn-${listData.id}`);
    if (activeListButton) {
        activeListButton.innerHTML = `📦 ${listData.name} <strong class="text-muted font-sm">x${activeCount}</strong>`;
    }
}

async function handleSelectList(listId, listName) {
    shoppingService.setCurrentListId(listId);
    
    const blankState = document.getElementById('blankState');
    const currentListCard = document.getElementById('currentListCard');
    const deleteListBtn = document.getElementById('deleteListBtn');

    if (blankState) blankState.style.display = 'none';
    if (currentListCard) currentListCard.style.display = 'block';

    if (deleteListBtn) {
        deleteListBtn.onclick = async () => {
            if (!confirm(`Are you sure you want to delete board "${listName}"?`)) return;
            await shoppingService.deleteList(listId);

            if (currentListCard) currentListCard.style.display = 'none';
            if (blankState) blankState.style.display = 'block';
            shoppingService.setCurrentListId(null);

            await renderListsDashboard();
            showToast(`Board "${listName}" deleted`, 'info');
        };
    }

    await updateUI();
}

async function handleCreateList() {
    const input = document.getElementById('listName');
    const name = input ? input.value.trim() : '';
    if (!name) return showToast('Enter a board name!', 'error'); 
    
    await shoppingService.createNewList(name);
    if (input) input.value = '';

    await renderListsDashboard();
    await handleSelectList(shoppingService.currentListId, name);
    showToast(`Board "${name}" created successfully!`, 'success');
}

async function handleAddItem() {
    const nameInput = document.getElementById('itemName');
    const qtyInput = document.getElementById('itemQty');
    
    const name = nameInput ? nameInput.value.trim() : '';
    const qty = qtyInput ? qtyInput.value : '1';
    if (!name) return showToast('Enter a product name!', 'error');
    
    await shoppingService.addItemToCurrentList(name, parseInt(qty));
    if (nameInput) nameInput.value = '';
    if (qtyInput) qtyInput.value = '1';

    await updateUI();
    showToast(`Added ${name} (x${qty})`, 'success');
}

async function handleToggleItem(itemId) {
    const container = document.getElementById('itemsContainer');
    const oldPositions = new Map();
    if (container) {
        container.querySelectorAll('.item').forEach(item => {
            oldPositions.set(item.dataset.itemId, item.getBoundingClientRect());
        });
    }

    await shoppingService.toggleItemDone(itemId);
    await updateUI();
    
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const items = container ? container.querySelectorAll('.item') : [];
            items.forEach(item => {
                const oldPos = oldPositions.get(item.dataset.itemId);
                if (!oldPos) return;
                const newPos = item.getBoundingClientRect();
                const deltaY = oldPos.top - newPos.top;
                if (deltaY === 0) return;
                item.style.transition = 'none';
                item.style.transform = `translateY(${deltaY}px)`;
                requestAnimationFrame(() => {
                    item.style.transition = `transform 400ms cubic-bezier(0.2, 0.8, 0.2, 1)`;
                    item.style.transform = '';
                });
            });
        });
    });
}

function handleEditItem(event, itemId, currentName, currentQty) {
    if (event) event.stopPropagation();
    document.getElementById('editItemId').value = itemId;
    document.getElementById('editItemNameInput').value = currentName;
    document.getElementById('editItemQtyInput').value = currentQty;
    document.getElementById('editModal').style.display = 'flex';
}

async function saveEditItem() {
    const itemId = document.getElementById('editItemId').value;
    const newName = document.getElementById('editItemNameInput').value.trim();
    const newQty = document.getElementById('editItemQtyInput').value;

    if (!newName) return showToast("Name cannot be empty!", 'error');
    
    await shoppingService.editItem(itemId, newName, parseInt(newQty));
    document.getElementById('editModal').style.display = 'none';

    await updateUI();
    showToast('Item updated successfully', 'success');
}

async function handleDeleteItem(event, itemId) {
    if (event) event.stopPropagation();
    if (!confirm('Delete this item?')) return;

    await shoppingService.deleteItem(itemId);
    await updateUI();
}

export async function initShoppingModule() {
    const sidebarSlot = document.getElementById('shopping-sidebar-slot');
    const mainSlot = document.getElementById('shopping-main-slot');

    if (sidebarSlot) {
        sidebarSlot.innerHTML = `
            <div id="listsDashboard"></div>
            <div id="createListForm" style="margin-top: 20px;">
                <input type="text" id="listName" class="input-field mb-8" placeholder="New board name...">
                <button id="createListBtn" class="w-100">+ Create List</button>
            </div>
        `;
    }

    if (mainSlot) {
        mainSlot.innerHTML = `
            <div id="blankState" class="card text-center text-muted"></div>
            <div class="card" id="currentListCard" style="display: none;">
                <div class="list-header-row">
                    <h2 id="currentListName" class="m-0">My List</h2>
                    <button id="deleteListBtn" class="delete-btn">Delete Board</button>
                </div>
                <div class="add-item-row">
                    <input type="text" id="itemName" class="input-field flex-3" placeholder="Type...">
                    <input type="number" id="itemQty" class="input-field flex-1" value="1" min="1">
                    <button id="addItemBtn" class="flex-1">Add</button>
                </div>
                <div id="itemsContainer"></div>
            </div>
            <div id="editModal" class="modal">
                <div class="modal-content-card">
                    <h3>✏️ Edit Item</h3>
                    <input type="hidden" id="editItemId">
                    <div class="mb-15">
                        <label class="modal-label">Product Name</label>
                        <input type="text" id="editItemNameInput" class="input-field w-100">
                    </div>
                    <div class="mb-20">
                        <label class="modal-label">Quantity</label>
                        <input type="number" id="editItemQtyInput" class="input-field w-100" min="1">
                    </div>
                    <div class="modal-actions">
                        <button id="cancelEditBtn" class="delete-btn cancel-btn">Cancel</button>
                        <button id="saveEditBtn">Save Changes</button>
                    </div>
                </div>
            </div>
        `;
    }

    document.getElementById('createListBtn').addEventListener('click', handleCreateList);
    document.getElementById('addItemBtn').addEventListener('click', handleAddItem);
    document.getElementById('cancelEditBtn').addEventListener('click', () => document.getElementById('editModal').style.display = 'none');
    document.getElementById('saveEditBtn').addEventListener('click', saveEditItem);

    await refreshShoppingUI();
}