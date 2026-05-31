import * as shoppingService from './shopping.service.js';
import { switchMobileView } from '../../shared/responsive.js';

const DOM = {
    listsDashboard: document.getElementById('listsDashboard'),
    itemsContainer: document.getElementById('itemsContainer'),
    blankState: document.getElementById('blankState'),
    currentListCard: document.getElementById('currentListCard'),
    currentListName: document.getElementById('currentListName'),
    deleteListBtn: document.getElementById('deleteListBtn'),
    listNameInput: document.getElementById('listName'),
    createListBtn: document.querySelector('#createListForm button'),
    itemNameInput: document.getElementById('itemName'),
    itemQtyInput: document.getElementById('itemQty'),
    addItemBtn: document.querySelector('.add-item-row button'),
    editModal: document.getElementById('editModal'),
    editItemId: document.getElementById('editItemId'),
    editItemNameInput: document.getElementById('editItemNameInput'),
    editItemQtyInput: document.getElementById('editItemQtyInput'),
    cancelEditBtn: document.querySelector('.modal-actions .cancel-btn'),
    saveEditBtn: document.querySelector('.modal-actions button:not(.cancel-btn)')
};

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
        button.innerText = `📦 ${list.name}`;
        button.addEventListener('click', () => handleSelectList(list.id, list.name));
        DOM.listsDashboard.appendChild(button);
    });
}

async function renderItems() {
    const listData = await shoppingService.loadListItems();
    DOM.itemsContainer.innerHTML = '';
    if (!listData || !listData.items) return;

    listData.items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'item';
        const isChecked = item.is_done ? 'checked' : '';
        div.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 10px;">
                <div class="item-checkbox-wrapper" style="display: flex; align-items: center; gap: 12px; cursor: pointer; flex: 1; min-width: 0;">
                    <input type="checkbox" ${isChecked} style="cursor: pointer; width: 18px; height: 18px; pointer-events: none; flex-shrink: 0;">
                    <span class="${item.is_done ? 'done' : ''}" style="font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
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
}

async function handleSelectList(listId, listName) {
    shoppingService.setCurrentListId(listId);
    DOM.blankState.style.display = 'none';
    DOM.currentListName.innerText = listName;
    DOM.currentListCard.style.display = 'block';
    
    DOM.deleteListBtn.onclick = async () => {
        if (!confirm(`Are you sure you want to delete board "${listName}"?`)) return;
        await shoppingService.deleteList(listId);
        DOM.currentListCard.style.display = 'none';
        DOM.blankState.style.display = 'block';
        shoppingService.setCurrentListId(null);
        await renderListsDashboard();
        if (window.innerWidth <= 768) switchMobileView('sidebar');
    };

    await renderItems();
    if (window.innerWidth <= 768) switchMobileView('main');
}

async function handleCreateList() {
    const name = DOM.listNameInput.value.trim();
    if (!name) return alert('Enter a board name!');
    await shoppingService.createNewList(name);
    DOM.listNameInput.value = '';
    await renderListsDashboard();
    await handleSelectList(shoppingService.currentListId, name);
}

async function handleAddItem() {
    const name = DOM.itemNameInput.value.trim();
    const qty = DOM.itemQtyInput.value;
    if (!name) return alert('Enter a product name!');
    await shoppingService.addItemToCurrentList(name, parseInt(qty));
    DOM.itemNameInput.value = '';
    DOM.itemQtyInput.value = '1';
    await renderItems();
}

async function handleToggleItem(itemId) {
    await shoppingService.toggleItemDone(itemId);
    await renderItems();
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
    if (!newName) return alert("Name cannot be empty!");
    await shoppingService.editItem(itemId, newName, parseInt(newQty));
    DOM.editModal.style.display = 'none';
    await renderItems();
}

async function handleDeleteItem(event, itemId) {
    if (event) event.stopPropagation();
    if (!confirm('Delete this item?')) return;
    await shoppingService.deleteItem(itemId);
    await renderItems();
}

export function initShoppingModule() {
    DOM.createListBtn.addEventListener('click', handleCreateList);
    DOM.addItemBtn.addEventListener('click', handleAddItem);
    DOM.cancelEditBtn.addEventListener('click', () => DOM.editModal.style.display = 'none');
    DOM.saveEditBtn.addEventListener('click', saveEditItem);

    renderListsDashboard();
}