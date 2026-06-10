import { apiRequest } from '../../core/api.js';
import * as spacesService from '../spaces/spaces.service.js';

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
    const spaceId = spacesService.currentSpaceId;
    if (!spaceId) return [];
    return await apiRequest(`/shopping/?space_id=${spaceId}`);
}

export async function createNewList(name) {
    const spaceId = spacesService.currentSpaceId;
    if (!spaceId) throw new Error("You have to select or create new space first!");
    
    const data = await apiRequest(`/shopping/?space_id=${spaceId}`, 'POST', { name: name });
    setCurrentListId(data.id); // <--- POPRAWIONE: Teraz poprawnie zapisuje w LocalStorage
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