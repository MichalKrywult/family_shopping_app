import { authService } from './auth.service.js';
import { showToast } from '../../shared/toast.js';

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

            if (!success) {
                showToast("Invalid username or password", "error");
            } else {
                window.location.href = "./index.html";
            }
        } catch (error) {
            showToast(error.message || "Login failed", "error");
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
                window.location.href = "./index.html";
            }
        } catch (error) {
            showToast(error.message || "Registration failed", "error");
        }
    });
});