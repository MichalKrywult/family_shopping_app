import { apiRequest } from '../../core/api.js';

export const authService = {
    /**
     * @param {string} username 
     * @param {string} password 
     * @param {string|null} email 
     */
    async register(username, password, email = null) {
        const body = { username, password };
        if (email) {
            body.email = email;
        }
        return await apiRequest('/auth/register', 'POST', body);
    },

    /**
     * @param {string} username 
     * @param {string} password 
     * @returns {Promise<boolean>} login ok - true 
     */
    async login(username, password) {
        const body = { username, password };
        
        // fourth parameter is set on True
        //  FastAPI OAuth2 requires Form Data (x-www-form-urlencoded)
        const data = await apiRequest('/auth/token', 'POST', body, true);
        
        if (data && data.access_token) {
            localStorage.setItem('shopping_app_token', data.access_token);
            return true;
        }
        return false;
    },
    logout() {
        localStorage.removeItem('shopping_app_token');
        window.location.reload();
    },

    /**
     * @returns {boolean} is user logged in?
     */
    isLoggedIn() {
        const token = localStorage.getItem('shopping_app_token');
        return !!token && token!== "undefined" && token !== "";
    }
};