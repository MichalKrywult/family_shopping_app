# app/shopping_lists/router.py
from fastapi import APIRouter, HTTPException
from . import service

router = APIRouter(prefix="/shopping", tags=["Shopping Lists"])


@router.post("/", status_code=201)
def create_new_list(name: str):
    """Creates a new shopping list and returns its ID."""
    list_id = service.create_list(name)
    return {"message": "Shopping list created", "list_id": list_id}


@router.post("/{list_id}/items", status_code=201)
def add_item_to_list(list_id: int, name: str, quantity: int = 1):
    """Adds an item to a specific shopping list."""
    # TODO - check whether the ID exists in the database
    service.add_item_to_list(list_id, name, quantity)
    return {"message": "Item added successfully"}


@router.get("/{list_id}")
def get_list(list_id: int):
    """Retrieves a shopping list along with its items."""
    result = service.get_list_with_items(list_id)
    if not result:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    return result
