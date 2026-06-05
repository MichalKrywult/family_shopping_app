import { apiRequest } from '../../core/api.js';

export let currentSpaceId = localStorage.getItem('active_space_id')
    ? parseInt(localStorage.getItem('active_space_id'))
    : null;

export let spacesList = [];

export function setCurrentSpaceId(id) {
    currentSpaceId = id;
    if (id) {
        localStorage.setItem('active_space_id', id);
    } else {
        localStorage.removeItem('active_space_id');
    }
}

export async function fetchUserSpaces() {
    spacesList = await apiRequest('/spaces/');
    
    if (spacesList.length > 0) {
        const spaceExists = spacesList.some(s => s.id === currentSpaceId);
        if (!currentSpaceId || !spaceExists) {
            setCurrentSpaceId(spacesList[0].id);
        }
    } else {
        setCurrentSpaceId(null);
    }
    return spacesList;
}

export async function createSpace(name) {
    const newSpace = await apiRequest('/spaces/', 'POST', { name });
    setCurrentSpaceId(newSpace.id);
    return newSpace;
}

export async function deleteSpace(spaceId) {
    await apiRequest(`/spaces/${spaceId}`, 'DELETE');
    if (currentSpaceId === spaceId) {
        setCurrentSpaceId(null);
    }
    await fetchUserSpaces();
}

export async function addMemberToSpace(spaceId, username) {
    return await apiRequest(`/spaces/${spaceId}/members`, 'POST', { username });
}