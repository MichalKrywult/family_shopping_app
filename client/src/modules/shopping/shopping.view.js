import * as shoppingService from './shopping.service.js';
import { showToast } from '../../shared/toast.js';
import { DOM } from '../../shared/dom.js'

async function renderListsDashboard() {
    const lists = await shoppingService.getAllLists();
    DOM.listsDashboard.innerHTML = '';
    
    if (!lists || lists.length === 0) {
        DOM.listsDashboard.innerHTML = '<p class="text-muted font-italic font-sm">No boards found.</p>';
        return;
    }
    
    lists.forEach(list => {
        const button = document.createElement('button');
        button.className = 'list-selector';
        button.id = `list-btn-${list.id}`;
        
        const count = list.items_count !== undefined ? list.items_count : 0;
        button.innerHTML = `📦 ${list.name} <strong class="text-muted font-sm">x${count}</strong>`;
        
        button.addEventListener('click', () => handleSelectList(list.id, list.name));
        DOM.listsDashboard.appendChild(button);
    });
}

async function renderItems(listData) {
    
    if (!listData) listData = await shoppingService.loadListItems();
    
    listData.items.sort((a, b) => {
        if (a.is_done !== b.is_done) {
            return Number(a.is_done) - Number(b.is_done);
        }

        return Number(a.id) - Number(b.id);
    });
            
    DOM.itemsContainer.innerHTML = '';
    if (!listData || !listData.items) return 0;

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
        DOM.itemsContainer.appendChild(div);
    });

    const activeItems = listData.items.filter(item => Number(item.is_done) === 0);
    return activeItems.length;
}

async function updateUI() {
    const listData = await shoppingService.loadListItems();
    if (!listData) return;

    const activeCount = await renderItems(listData);
    DOM.currentListName.innerHTML =
        `${listData.name} <strong class="text-muted font-sm">Items left: ${activeCount}</strong>`;

    const activeListButton = document.getElementById(`list-btn-${listData.id}`);
    if (activeListButton) {
        activeListButton.innerHTML = `📦 ${listData.name} <strong class="text-muted font-sm">x${activeCount}</strong>`;
    }

}

async function handleSelectList(listId, listName) {
    shoppingService.setCurrentListId(listId);
    DOM.blankState.style.display = 'none';
    DOM.currentListCard.style.display = 'block';

    DOM.deleteListBtn.onclick = async () => {
        if (!confirm(`Are you sure you want to delete board "${listName}"?`)) return;
        await shoppingService.deleteList(listId);

        DOM.currentListCard.style.display = 'none';
        DOM.blankState.style.display = 'block';
        shoppingService.setCurrentListId(null);

        await renderListsDashboard();
        showToast(`Board "${listName}" deleted`, 'info');

        if (window.innerWidth <= 768) switchMobileView('sidebar');
    };

    await updateUI();

    if (window.innerWidth <= 768) switchMobileView('main');
}

function animateListReorder(oldPositions) {
    const items = DOM.itemsContainer.querySelectorAll('.item');

    items.forEach(item => {
        const oldPos = oldPositions.get(item.dataset.itemId);
        if (!oldPos) return;

        const newPos = item.getBoundingClientRect();
        const deltaY = oldPos.top - newPos.top;
        if (deltaY === 0) return;

        item.style.transition = 'none';
        item.style.transform = `translateY(${deltaY}px)`;

        requestAnimationFrame(() => {
            const duration = Math.min(
                Math.max(Math.sqrt(Math.abs(deltaY)) * 35, 999),
                1300
            );
            
            item.style.transition = `transform ${duration}ms cubic-bezier(0.2, 0.8, 0.2, 1)`;
            item.style.transform = '';

            setTimeout(() => {
                item.style.transition = '';
                item.style.transform = '';
            }, duration);
        });
    });
}

async function handleCreateList() {
    const name = DOM.listNameInput.value.trim();
    if (!name) return showToast('Enter a board name!', 'error'); 
    
    await shoppingService.createNewList(name);
    DOM.listNameInput.value = '';

    await renderListsDashboard();
    await handleSelectList(shoppingService.currentListId, name);
    
    showToast(`Board "${name}" created successfully!`, 'success');
}

async function handleAddItem() {
    const name = DOM.itemNameInput.value.trim();
    const qty = DOM.itemQtyInput.value;
    if (!name) return showToast('Enter a product name!', 'error');
    
    await shoppingService.addItemToCurrentList(name, parseInt(qty));
    DOM.itemNameInput.value = '';
    DOM.itemQtyInput.value = '1';

    await updateUI();
    showToast(`Added ${name} (x${qty})`, 'success');
}

async function handleToggleItem(itemId) {
    const oldPositions = new Map();

    DOM.itemsContainer
        .querySelectorAll('.item')
        .forEach(item => {
            oldPositions.set(
                item.dataset.itemId,
                item.getBoundingClientRect()
            );
        });

    await shoppingService.toggleItemDone(itemId);

    await updateUI();
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            animateListReorder(oldPositions);
        });
    });
    
}

function handleEditItem(event, itemId, currentName, currentQty) {
    if (event) event.stopPropagation();
    DOM.editItemId.value = itemId;
    DOM.editItemNameInput.value = currentName;
    DOM.editItemQtyInput.value = currentQty;
    DOM.editModal.style.display = 'flex';
}

async function saveEditItem() {
    const itemId = DOM.editItemId.value;
    const newName = DOM.editItemNameInput.value.trim();
    const newQty = DOM.editItemQtyInput.value;

    if (!newName) return showToast("Name cannot be empty!", 'error');
    
    await shoppingService.editItem(itemId, newName, parseInt(newQty));
    DOM.editModal.style.display = 'none';

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
    DOM.createListBtn.addEventListener('click', handleCreateList);
    DOM.addItemBtn.addEventListener('click', handleAddItem);
    DOM.cancelEditBtn.addEventListener('click', () => DOM.editModal.style.display = 'none');
    DOM.saveEditBtn.addEventListener('click', saveEditItem);

    await renderListsDashboard();

    if (shoppingService.currentListId) {
        const currentList = await shoppingService.loadListItems();
        if (currentList) {
            await handleSelectList(currentList.id, currentList.name);
        } else {
            shoppingService.setCurrentListId(null);
        }
    }

}