from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from app.core.database import get_session
from . import service
from app.shopping.models import (
    ItemUpdate,
    ShoppingListCreate,
    ItemCreate,
)
from app.auth.service import get_current_user
from app.auth.models import User

router = APIRouter(prefix="/shopping", tags=["Shopping Lists"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_new_list(
    list_data: ShoppingListCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),  
):
    """Creates a new shopping list using JSON body."""
    assert current_user.id is not None
    return service.create_list(session, name=list_data.name, user_id=current_user.id) 


@router.post("/{list_id}/items", status_code=status.HTTP_201_CREATED)
def add_item_to_list(
    list_id: int,
    item_data: ItemCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Adds an item to a shopping list using JSON body."""
    assert current_user.id is not None
    item = service.add_item_to_list(
        session,
        list_id=list_id,
        name=item_data.name,
        quantity=item_data.quantity,
        user_id=current_user.id,
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shopping list not found or access denied",
        )
    return {"message": "Item added successfully"}


@router.get("/{list_id}")
def get_list(
    list_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Retrieves a shopping list along with its items."""
    assert current_user.id is not None
    result = service.get_list_with_items(
        session, list_id=list_id, user_id=current_user.id
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Shopping list not found"
        )
    return result


@router.put("/items/{item_id}")
def edit_item(
    item_id: int,
    item_data: ItemUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Edits item name and/or quantity using JSON body."""
    assert current_user.id is not None
    success = service.edit_item(
        session, item_id=item_id, item_data=item_data, user_id=current_user.id
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item not found"
        )
    return {"message": "Item updated successfully"}


@router.put("/items/{item_id}/done")
def mark_item_as_done(
    item_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Marks an item as done."""
    assert current_user.id is not None
    updated_item = service.toggle_item_status(
        session, item_id=item_id, user_id=current_user.id
    )
    if not updated_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item not found"
        )
    return {"message": "Item marked as done successfully", "item": updated_item}


@router.delete("/items/{item_id}")
def delete_item(
    item_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Deletes an item from the shopping list."""
    assert current_user.id is not None
    success = service.delete_item(session, item_id=item_id, user_id=current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item not found"
        )
    return {"message": "Item deleted successfully"}


@router.delete("/{list_id}")
def delete_shopping_list(
    list_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Soft-deletes a shopping list."""
    assert current_user.id is not None
    success = service.delete_list(session, list_id=list_id, user_id=current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shopping list not found or already deleted",
        )
    return {"message": "Shopping list deleted successfully (Soft Delete)"}


@router.get("/")
def get_all_lists(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Returns all lists."""
    assert current_user.id is not None
    return service.get_all_lists(session, user_id=current_user.id)
