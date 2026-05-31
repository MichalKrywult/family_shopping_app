import { apiRequest } from '../../core/api.js';

export let currentListId = localStorage.getItem('active_board_id') 
    ? parseInt(localStorage.getItem('active_board_id')) 
    : null;

export function setCurrentListId(id) {
    currentListId = id;
    if (id) {
        localStorage.setItem('active_board_id', id);
    } else {
        localStorage.removeItem('active_board_id');
    }
}

export async function getAllLists() {
    return await apiRequest('/shopping/');
}

export async function createNewList(name) {
    const data = await apiRequest('/shopping/', 'POST', { name: name });
    currentListId = data.id;
    return data;
}

export async function loadListItems() {
    if (!currentListId) return null;
    return await apiRequest(`/shopping/${currentListId}`);
}

export async function addItemToCurrentList(name, quantity) {
    if (!currentListId) return;
    return await apiRequest(`/shopping/${currentListId}/items`, 'POST', { 
        name: name, 
        quantity: quantity 
    });
}

export async function toggleItemDone(itemId) {
    return await apiRequest(`/shopping/items/${itemId}/done`, 'PUT');
}

export async function deleteItem(itemId) {
    return await apiRequest(`/shopping/items/${itemId}`, 'DELETE');
}

export async function editItem(itemId, name, quantity) {
    return await apiRequest(`/shopping/items/${itemId}`, "PUT", { 
        name: name,
        quantity: quantity 
    });
}

export async function deleteList(listId) {
    return await apiRequest(`/shopping/${listId}`, 'DELETE');
}

