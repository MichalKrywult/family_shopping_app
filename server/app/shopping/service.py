from sqlmodel import Session, select
from app.shopping.models import ShoppingList, Item, ItemUpdate, ShoppingListMinimal
from typing import Optional
from sqlalchemy.orm import joinedload  # noqa


def create_list(session: Session, name: str, user_id: int) -> ShoppingList:
    """Creates a new shopping list assigning the owner_id."""
    db_list = ShoppingList(name=name, owner_id=user_id)
    session.add(db_list)
    session.commit()
    session.refresh(db_list)
    return db_list


def add_item_to_list(
    session: Session, list_id: int, name: str, quantity: int, user_id: int
) -> Optional[Item]:
    """Adds an item to the list, verifying that the user owns the list."""
    # Security: ensure the target list belongs to the authenticated user.
    statement = select(ShoppingList).where(
        ShoppingList.id == list_id,
        ShoppingList.owner_id == user_id,
        ShoppingList.is_deleted == 0,
    )
    shopping_list = session.exec(statement).first()
    if not shopping_list:
        return None

    db_item = Item(list_id=list_id, name=name, quantity=quantity, owner_id=user_id)
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item


def delete_list(session: Session, list_id: int, user_id: int) -> bool:
    """Soft Delete dla listy zakupów należącej do użytkownika."""
    statement = select(ShoppingList).where(
        ShoppingList.id == list_id, ShoppingList.owner_id == user_id
    )
    shopping_list = session.exec(statement).first()

    if not shopping_list or shopping_list.is_deleted == 1:
        return False

    shopping_list.is_deleted = 1
    session.add(shopping_list)
    session.commit()
    return True


def get_list_with_items(session: Session, list_id: int, user_id: int) -> Optional[dict]:
    """Returns items of a list, verified by list ownership."""
    statement_list = select(ShoppingList).where(
        ShoppingList.id == list_id,
        ShoppingList.owner_id == user_id,
        ShoppingList.is_deleted == 0,
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


def toggle_item_status(session: Session, item_id: int, user_id: int) -> Optional[Item]:
    """Toggles item state if the item belongs to a list owned by the user."""
    # Join with ShoppingList to enforce ownership validation.
    statement = (
        select(Item)
        .join(ShoppingList)
        .where(Item.id == item_id, ShoppingList.owner_id == user_id)
    )
    item = session.exec(statement).first()
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


def edit_item(
    session: Session, item_id: int, item_data: ItemUpdate, user_id: int
) -> bool:
    """Edits an item if it belongs to a list owned by the user."""
    statement = (
        select(Item)
        .join(ShoppingList)
        .where(Item.id == item_id, ShoppingList.owner_id == user_id)
    )
    db_item = session.exec(statement).first()
    if not db_item:
        return False

    update_data = item_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)

    session.add(db_item)
    session.commit()
    return True


def delete_item(session: Session, item_id: int, user_id: int) -> bool:
    """Deletes an item from list if it belongs to a list owned by the user."""
    statement = (
        select(Item)
        .join(ShoppingList)
        .where(Item.id == item_id, ShoppingList.owner_id == user_id)
    )
    item = session.exec(statement).first()
    if not item:
        return False

    session.delete(item)
    session.commit()
    return True


def get_all_lists(session: Session, user_id: int) -> list[ShoppingListMinimal]:
    """Returns all lists owned by the user, with items count."""
    statement = select(ShoppingList).where(
        ShoppingList.is_deleted == 0, ShoppingList.owner_id == user_id
    )
    db_lists = session.exec(statement).all()

    result = []
    if db_lists != []:
        for shopping_list in db_lists:
            if shopping_list.id is not None:
                list_data = ShoppingListMinimal(
                    id=shopping_list.id,
                    name=shopping_list.name,
                    is_deleted=shopping_list.is_deleted,
                    created_at=shopping_list.created_at,
                    # Count only pending (not completed) items.
                    items_count=sum(
                        1 for item in shopping_list.items if item.is_done == 0
                    ),
                )
                result.append(list_data)

    return result
