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
        localStorage.removeItem('user_display_name'); 
        localStorage.removeItem('user_handle');       
        window.location.reload();
    },

    /**
     * @returns {boolean} is user logged in?
     */
    isLoggedIn() {
        const token = localStorage.getItem('shopping_app_token');
        return !!token && token!== "undefined" && token !== "";
    },

    /**
     *decoding JWT token payload
     * @returns {object|null} data from token
     */
    getTokenPayload() {
        const token = localStorage.getItem('shopping_app_token');
        if (!token) return null;
        try {
            // Token JWT: Header.Payload.Signature
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Failed to decode token", e);
            return null;
        }
    },

    /**
     * @returns {string}
     */
    getCurrentDisplayName() {
        const payload = this.getTokenPayload();
        return payload && payload.display_name ? payload.display_name : 'Profile';
    },

    /**
     * @returns {string}
     */
    getCurrentHandle() {
        const payload = this.getTokenPayload();
        return payload && payload.username ? payload.username : '';
    },
    /**
     * @returns {string}
     */
    getCurrentDisplayName() {
        const localName = localStorage.getItem('user_display_name');
        if (localName) return localName;

        const payload = this.getTokenPayload();
        return payload && payload.display_name ? payload.display_name : 'Profile';
    },

    /**
     * @returns {string}
     */
    getCurrentHandle() {
        const localHandle = localStorage.getItem('user_handle');
        if (localHandle) return localHandle;

        const payload = this.getTokenPayload();
        return payload && payload.username ? payload.username : '';
    },

    async updateProfileDetails(displayName, handle) {
        const updatedUser = await apiRequest('/auth/profile', 'PUT', {
            display_name: displayName,
            username: handle
        });

        localStorage.setItem('user_display_name', updatedUser.display_name);
        localStorage.setItem('user_handle', updatedUser.username);

        return updatedUser;
    },

    async updatePassword(currentPassword, newPassword) {
        return await apiRequest('/auth/profile/password', 'PUT', {
            current_password: currentPassword,
            new_password: newPassword
        });
    }
};
