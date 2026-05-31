from sqlmodel import Session, select
from app.shopping.models import ShoppingList, Item, ItemUpdate
from typing import Optional
from sqlalchemy.orm import joinedload  # noqa


def create_list(session: Session, name: str) -> ShoppingList:
    """Creates a new shopping list using the ORM."""
    db_list = ShoppingList(name=name)
    session.add(db_list)
    session.commit()
    session.refresh(db_list)
    return db_list


def add_item_to_list(session: Session, list_id: int, name: str, quantity: int) -> Item:
    """Adds an item to the list using the ORM."""
    db_item = Item(list_id=list_id, name=name, quantity=quantity)
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item


def delete_list(session: Session, list_id: int) -> bool:
    """Soft Delete dla listy zakupów."""
    shopping_list = session.get(ShoppingList, list_id)
    if not shopping_list or shopping_list.is_deleted == 1:
        return False

    shopping_list.is_deleted = 1
    session.add(shopping_list)
    session.commit()
    return True


def get_list_with_items(session: Session, list_id: int) -> Optional[dict]:
    """Returns items of list, in hash map."""
    statement_list = select(ShoppingList).where(
        ShoppingList.id == list_id, ShoppingList.is_deleted == 0
    )
    shopping_list = session.exec(statement_list).first()

    if not shopping_list:
        return None

    statement_items = select(Item).where(Item.list_id == list_id)
    items = session.exec(statement_items).all()

    return {
        "id": shopping_list.id,
        "name": shopping_list.name,
        "is_deleted": shopping_list.is_deleted,
        "created_at": shopping_list.created_at,
        "items": items,
    }


def toggle_item_status(session: Session, item_id: int) -> Optional[Item]:
    """Toggles item state (0 -> 1, 1 -> 0)."""
    item = session.get(Item, item_id)
    if not item:
        return None

    if item.is_done == 0:
        item.is_done = 1
    else:
        item.is_done = 0

    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def edit_item(session: Session, item_id: int, item_data: ItemUpdate) -> bool:
    db_item = session.get(Item, item_id)
    if not db_item:
        return False

    update_data = item_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)

    session.add(db_item)
    session.commit()
    return True


def delete_item(session: Session, item_id: int) -> bool:
    """Deletes an item from list. Returns True if success, False if not found."""
    item = session.get(Item, item_id)
    if not item:
        return False

    session.delete(item)
    session.commit()
    return True


def get_all_lists(session: Session) -> list[ShoppingList]:
    """Returns all lists."""
    statement = select(ShoppingList).where(ShoppingList.is_deleted == 0)
    return list(session.exec(statement).all())
