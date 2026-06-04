import { showToast } from '../shared/toast.js'; 
const API_URL = "";

export async function apiRequest(endpoint, method = "GET", body = null, isFormData = false) {
    const options = { method, headers: {} };

    const token = localStorage.getItem("shopping_app_token");
    if (token) {
        options.headers["Authorization"] = `Bearer ${token}`;
    }

    if (body) {
        if (isFormData) {
            options.headers["Content-Type"] = "application/x-www-form-urlencoded";
            options.body = new URLSearchParams(body);
        } else {
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(body);
        }
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);

        let errorData = {};
        if (!response.ok) {
            errorData = await response.json().catch(() => ({}));
        }

        const isUnauthorized = response.status === 401 || 
                             (errorData.detail && errorData.detail === "Not authenticated");

        if (isUnauthorized && endpoint !== "/auth/token") {
            localStorage.removeItem("shopping_app_token");
            
            if (!window.location.pathname.endsWith("login.html")) {
                window.location.href = "./login.html";
            }
            throw new Error("Session expired or invalid.");
        }

        if (!response.ok) {
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