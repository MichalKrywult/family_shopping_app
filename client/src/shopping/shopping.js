import { apiRequest } from '../core/api.js';

export let currentListId = null;

export function setCurrentListId(id) {
    currentListId = id;
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

export async function editItemName(itemId, name) {
    return await apiRequest(`/shopping/items/${itemId}`, "PUT", { name: name });
}

export async function deleteList(listId) {
    return await apiRequest(`/shopping/${listId}`, 'DELETE');
}