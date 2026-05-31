import { initResponsive } from './shared/responsive.js';
import { initShoppingModule } from './modules/shopping/shopping.view.js';

function bootstrap() {

    initResponsive();
    initShoppingModule();
}

document.addEventListener('DOMContentLoaded', bootstrap);