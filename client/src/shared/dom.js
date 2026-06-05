export const DOM = {
    // global / navigation slots
    get sidebar() { return document.querySelector('.sidebar'); },
    get mainContent() { return document.querySelector('.main-content'); },
    get btnSidebar() { return document.getElementById('navBtnSidebar'); },
    get btnMain() { return document.getElementById('navBtnMain'); },
    
    // shopping
    get sidebarSlot() { return document.getElementById('shopping-sidebar-slot'); },
    get mainSlot() { return document.getElementById('shopping-main-slot'); },

    // shopping - sidebar
    get listsDashboard() { return document.getElementById('listsDashboard'); },
    get listNameInput() { return document.getElementById('listName'); },
    get createListBtn() { return document.querySelector('#createListForm button'); },
    
    // shopping - main 
    get blankState() { return document.getElementById('blankState'); },
    get currentListCard() { return document.getElementById('currentListCard'); },
    get currentListName() { return document.getElementById('currentListName'); },
    get deleteListBtn() { return document.getElementById('deleteListBtn'); },
    get itemsContainer() { return document.getElementById('itemsContainer'); },
    get itemNameInput() { return document.getElementById('itemName'); },
    get itemQtyInput() { return document.getElementById('itemQty'); },
    get addItemBtn() { return document.querySelector('.add-item-row button'); },
    
    // shopping - modal
    get editModal() { return document.getElementById('editModal'); },
    get editItemId() { return document.getElementById('editItemId'); },
    get editItemNameInput() { return document.getElementById('editItemNameInput'); },
    get editItemQtyInput() { return document.getElementById('editItemQtyInput'); },
    get cancelEditBtn() { return document.querySelector('.modal-actions .cancel-btn'); },
    get saveEditBtn() { return document.querySelector('.modal-actions button:not(.cancel-btn)'); }
};