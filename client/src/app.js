import { initResponsive } from './shared/responsive.js';
import { initShoppingModule } from './modules/shopping/shopping.view.js';
import { authService } from './modules/auth/auth.service.js';
import { navigationView } from './modules/navigation/navigation.view.js';

async function bootstrap() {
    if (!authService.isLoggedIn()) {
        window.location.href = './login.html';
        return;
    }

    try {
        navigationView.render();
        await initShoppingModule(); 
    } catch (error) {
        console.error("Something went wrong:", error);
        
        if (error.message.includes("Not authenticated")) {
            authService.logout(); 
        }
    }
}

document.addEventListener('DOMContentLoaded', bootstrap);