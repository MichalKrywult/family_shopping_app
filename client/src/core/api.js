import { showToast } from '../shared/toast.js'; 
const API_URL = "";

export async function apiRequest(endpoint, method = "GET", body = null) {
    const options = { method };
    if (body) {
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `HTTP error! Status code: ${response.status}`);
        }
        if (response.status === 204) return null;
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        showToast(`Connection error: ${error.message}`, 'error');
        throw error;
    }
}