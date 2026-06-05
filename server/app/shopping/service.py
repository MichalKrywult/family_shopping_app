from sqlmodel import Session, select
from app.shopping.models import ShoppingList, Item, ItemUpdate, ShoppingListMinimal
from app.spaces.models import UserSpaceLink
from typing import Optional


def is_user_in_space(session: Session, user_id: int, space_id: int) -> bool:
    """Funkcja pomocnicza: Sprawdza, czy użytkownik ma dostęp do danej przestrzeni."""
    statement = select(UserSpaceLink).where(
        UserSpaceLink.user_id == user_id, UserSpaceLink.space_id == space_id
    )
    link = session.exec(statement).first()
    return link is not None


def create_list(
    session: Session, name: str, space_id: int, user_id: int
) -> Optional[ShoppingList]:
    """Creates a new shopping list assigning the space_id after verifying access."""
    if not is_user_in_space(session, user_id, space_id):
        return None

    db_list = ShoppingList(name=name, space_id=space_id)
    session.add(db_list)
    session.commit()
    session.refresh(db_list)
    return db_list


def add_item_to_list(
    session: Session, list_id: int, name: str, quantity: int, user_id: int
) -> Optional[Item]:
    """Adds an item to the list, verifying that the user has access to the list's space."""
    statement = select(ShoppingList).where(
        ShoppingList.id == list_id, ShoppingList.is_deleted == 0
    )
    shopping_list = session.exec(statement).first()
    if not shopping_list:
        return None

    if not is_user_in_space(session, user_id, shopping_list.space_id):
        return None

    db_item = Item(list_id=list_id, name=name, quantity=quantity, owner_id=user_id)
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item


def delete_list(session: Session, list_id: int, user_id: int) -> bool:
    """Soft Delete dla listy zakupów po weryfikacji dostępu do przestrzeni."""
    statement = select(ShoppingList).where(ShoppingList.id == list_id)
    shopping_list = session.exec(statement).first()

    if not shopping_list or shopping_list.is_deleted == 1:
        return False

    if not is_user_in_space(session, user_id, shopping_list.space_id):
        return False

    shopping_list.is_deleted = 1
    session.add(shopping_list)
    session.commit()
    return True


def get_list_with_items(session: Session, list_id: int, user_id: int) -> Optional[dict]:
    """Returns items of a list, verified by space membership."""
    statement_list = select(ShoppingList).where(
        ShoppingList.id == list_id,
        ShoppingList.is_deleted == 0,
    )
    shopping_list = session.exec(statement_list).first()

    if not shopping_list or not is_user_in_space(
        session, user_id, shopping_list.space_id
    ):
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
    """Toggles item state if the user belongs to the space containing the item's list."""
    statement = select(Item).join(ShoppingList).where(Item.id == item_id)
    item = session.exec(statement).first()
    if not item or not is_user_in_space(session, user_id, item.shopping_list.space_id):
        return None

    item.is_done = 1 if item.is_done == 0 else 0

    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def edit_item(
    session: Session, item_id: int, item_data: ItemUpdate, user_id: int
) -> bool:
    """Edits an item if the user has access to its space."""
    statement = select(Item).join(ShoppingList).where(Item.id == item_id)
    db_item = session.exec(statement).first()

    if not db_item or not is_user_in_space(
        session, user_id, db_item.shopping_list.space_id
    ):
        return False

    update_data = item_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)

    session.add(db_item)
    session.commit()
    return True


def delete_item(session: Session, item_id: int, user_id: int) -> bool:
    """Deletes an item from list if the user has access to its space."""
    statement = select(Item).join(ShoppingList).where(Item.id == item_id)
    item = session.exec(statement).first()
    if not item or not is_user_in_space(session, user_id, item.shopping_list.space_id):
        return False

    session.delete(item)
    session.commit()
    return True


def get_all_lists(
    session: Session, space_id: int, user_id: int
) -> list[ShoppingListMinimal]:
    """Returns all lists belonging to a specific space, with items count."""
    if not is_user_in_space(session, user_id, space_id):
        return []

    statement = select(ShoppingList).where(
        ShoppingList.is_deleted == 0, ShoppingList.space_id == space_id
    )
    db_lists = session.exec(statement).all()

    result = []
    for shopping_list in db_lists:
        if shopping_list.id is not None:
            list_data = ShoppingListMinimal(
                id=shopping_list.id,
                name=shopping_list.name,
                is_deleted=shopping_list.is_deleted,
                created_at=shopping_list.created_at,
                items_count=sum(1 for item in shopping_list.items if item.is_done == 0),
            )
            result.append(list_data)

    return result
