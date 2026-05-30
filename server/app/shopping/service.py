from sqlmodel import Session, select
from shopping.models import ShoppingList, Item, Optional


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


def get_list_with_items(session: Session, list_id: int) -> Optional[ShoppingList]:
    """Pobiera listę tylko, jeśli nie została miękko usunięta."""
    statement = select(ShoppingList).where(
        ShoppingList.id == list_id,
        ShoppingList.is_deleted == 0, 
    )
    result = session.exec(statement).first()
    return result


def mark_item_as_done(session: Session, item_id: int) -> Optional[Item]:
    """Marks an item as done. Returns None if item not found."""
    item = session.get(Item, item_id)
    if not item:
        return None

    item.is_done = 1
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def delete_item(session: Session, item_id: int) -> bool:
    """Deletes an item from list. Returns True if success, False if not found."""
    item = session.get(Item, item_id)
    if not item:
        return False

    session.delete(item)
    session.commit()
    return True
