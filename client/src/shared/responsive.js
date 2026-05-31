const btnSidebar = document.getElementById('navBtnSidebar');
const btnMain = document.getElementById('navBtnMain');
const sidebar = document.querySelector('.sidebar');
const mainContent = document.querySelector('.main-content');

export function switchMobileView(view) {
    if (view === 'sidebar') {
        sidebar.classList.add('active-mobile');
        mainContent.classList.remove('active-mobile');
        btnSidebar.classList.add('active');
        btnMain.classList.remove('active');
    } else {
        sidebar.classList.remove('active-mobile');
        mainContent.classList.add('active-mobile');
        btnSidebar.classList.remove('active');
        btnMain.classList.add('active');
    }
}

export function initResponsive() {
    btnSidebar.addEventListener('click', () => switchMobileView('sidebar'));
    btnMain.addEventListener('click', () => switchMobileView('main'));

    if (window.innerWidth <= 768) {
        switchMobileView('sidebar');
    }
}