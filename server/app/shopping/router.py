from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from core.database import get_session
from . import service

router = APIRouter(prefix="/shopping", tags=["Shopping Lists"])


@router.post("/", status_code=201)
def create_new_list(name: str, session: Session = Depends(get_session)):
    """Creates a new shopping list."""
    return service.create_list(session, name)


@router.post("/{list_id}/items", status_code=201)
def add_item_to_list(
    list_id: int, name: str, quantity: int = 1, session: Session = Depends(get_session)
):
    """Adds an item to a specific shopping list."""

    service.add_item_to_list(session, list_id, name, quantity)

    return {"message": "Item added successfully"}


@router.get("/{list_id}")
def get_list(list_id: int, session: Session = Depends(get_session)):
    """Retrieves a shopping list along with its items."""

    result = service.get_list_with_items(session, list_id)

    if not result:
        raise HTTPException(status_code=404, detail="Shopping list not found")

    return result


@router.put("/items/{item_id}/done")
def mark_item_as_done(item_id: int, session: Session = Depends(get_session)):
    """Marks an item as done."""
    updated_item = service.mark_item_as_done(session, item_id)
    if not updated_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item marked as done successfully", "item": updated_item}


@router.delete("/items/{item_id}")
def delete_item(item_id: int, session: Session = Depends(get_session)):
    """Deletes an item from the shopping list."""
    success = service.delete_item(session, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted successfully"}


@router.delete("/{list_id}")
def delete_shopping_list(list_id: int, session: Session = Depends(get_session)):
    """Soft-deletes a shopping list."""
    success = service.delete_list(session, list_id)
    if not success:
        raise HTTPException(
            status_code=404, detail="Shopping list not found or already deleted"
        )
    return {"message": "Shopping list deleted successfully (Soft Delete)"}
