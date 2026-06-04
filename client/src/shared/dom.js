
export const DOM = {
    // global / navigation
    sidebar: document.querySelector('.sidebar'),
    mainContent: document.querySelector('.main-content'),
    btnSidebar: document.getElementById('navBtnSidebar'), // Upewnij się, że w HTML masz id="navBtnSidebar"
    btnMain: document.getElementById('navBtnMain'),       // Upewnij się, że w HTML masz id="navBtnMain"
    
    // shopping - lists
    listsDashboard: document.getElementById('listsDashboard'),
    listNameInput: document.getElementById('listName'),
    createListBtn: document.querySelector('#createListForm button'),

    blankState: document.getElementById('blankState'),
    currentListCard: document.getElementById('currentListCard'),
    currentListName: document.getElementById('currentListName'),
    deleteListBtn: document.getElementById('deleteListBtn'),
    itemsContainer: document.getElementById('itemsContainer'),
    itemNameInput: document.getElementById('itemName'),
    itemQtyInput: document.getElementById('itemQty'),
    addItemBtn: document.querySelector('.add-item-row button'),
    
    //shopping - modal
    editModal: document.getElementById('editModal'),
    editItemId: document.getElementById('editItemId'),
    editItemNameInput: document.getElementById('editItemNameInput'),
    editItemQtyInput: document.getElementById('editItemQtyInput'),
    cancelEditBtn: document.querySelector('.modal-actions .cancel-btn'),
    saveEditBtn: document.querySelector('.modal-actions button:not(.cancel-btn)')
};