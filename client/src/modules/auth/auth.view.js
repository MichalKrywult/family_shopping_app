import { authService } from './auth.service.js';

document.addEventListener('DOMContentLoaded', () => {
    if (authService.isLoggedIn()) {
        window.location.href = './index.html';
        return;
    }

    const loginBox = document.getElementById('login-box');
    const registerBox = document.getElementById('register-box');

    document.getElementById('switch-to-register').addEventListener('click', () => {
        loginBox.classList.add('hidden');
        registerBox.classList.remove('hidden');
    });

    document.getElementById('switch-to-login').addEventListener('click', () => {
        registerBox.classList.add('hidden');
        loginBox.classList.remove('hidden');
    });

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        try {
            const success = await authService.login(username, password);
            if (success) {
                window.location.href = './index.html';
            }
        } catch (error) {
            console.error("Login error:", error);
        }
    });

    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value.trim();
        const email = document.getElementById('reg-email').value.trim() || null;
        const password = document.getElementById('reg-password').value;

        try {
            await authService.register(username, password, email);
            const success = await authService.login(username, password);
            if (success) {
                window.location.href = './index.html';
            }
        } catch (error) {
            console.error("Register error:", error);
        }
    });
});