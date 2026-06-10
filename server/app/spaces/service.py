from sqlmodel import Session, select
from app.spaces.models import Space, UserSpaceLink
from app.auth.models import User
from typing import Optional
from collections.abc import Sequence


def create_space(session: Session, name: str, user_id: int) -> Space:
    """Creates a new space and automatically assigns the creator as a member."""
    db_space = Space(name=name, owner_id=user_id)
    session.add(db_space)
    session.commit()
    session.refresh(db_space)

    if db_space.id is not None:
        db_link = UserSpaceLink(user_id=user_id, space_id=db_space.id)
        session.add(db_link)
        session.commit()

    return db_space


def get_user_spaces(session: Session, user_id: int):
    """Returns all spaces that the user belongs to."""
    statement = (
        select(Space).join(UserSpaceLink).where(UserSpaceLink.user_id == user_id)
    )
    return session.exec(statement).all()


def add_member_by_username(
    session: Session, space_id: int, username: str, current_user_id: int
) -> Optional[User]:
    """Adds a user to a space by username. Requires ownership of the space."""
    cleaned_username = username.lstrip("@").strip()

    space = session.get(Space, space_id)
    if not space or space.owner_id != current_user_id:
        return None

    user_statement = select(User).where(User.username == cleaned_username)
    invited_user = session.exec(user_statement).first()
    if not invited_user:
        return None

    link_statement = select(UserSpaceLink).where(
        UserSpaceLink.user_id == invited_user.id,
        UserSpaceLink.space_id == space_id,
    )
    existing_link = session.exec(link_statement).first()
    if existing_link:
        return invited_user

    if invited_user.id is not None:
        db_link = UserSpaceLink(user_id=invited_user.id, space_id=space_id)
        session.add(db_link)
        session.commit()

    return invited_user


def delete_space(session: Session, space_id: int, current_user_id: int) -> bool:
    """Deletes a space (with cascading cleanup of related records) if the user is the owner."""

    space = session.get(Space, space_id)
    if not space or space.owner_id != current_user_id:
        return False

    session.delete(space)
    session.commit()

    return True


def edit_space_name(
    session: Session, space_id: int, current_user_id: int, name: str
) -> bool:
    """Edit space name if the user is the owner."""
    db_space = session.get(Space, space_id)
    if not db_space or db_space.owner_id != current_user_id:
        return False

    db_space.name = name
    session.commit()
    return True


def get_space_members_list(
    session: Session, space_id: int, current_user_id: int
) -> Sequence[User] | None:
    """Retrieves all members of a specific space. Verifies if the requesting user belongs to it."""
    access_statement = select(UserSpaceLink).where(
        UserSpaceLink.user_id == current_user_id, UserSpaceLink.space_id == space_id
    )
    has_access = session.exec(access_statement).first()
    if not has_access:
        return None

    members_statement = (
        select(User).join(UserSpaceLink).where(UserSpaceLink.space_id == space_id)
    )
    return session.exec(members_statement).all()


def remove_member_from_space(
    session: Session, space_id: int, user_id_to_remove: int, current_user_id: int
) -> bool:
    """Removes a user from a space. Requires ownership. Owner cannot remove themselves."""
    space = session.get(Space, space_id)
    if not space or space.owner_id != current_user_id:
        return False

    if user_id_to_remove == current_user_id:
        return False

    statement = select(UserSpaceLink).where(
        UserSpaceLink.user_id == user_id_to_remove, UserSpaceLink.space_id == space_id
    )
    link = session.exec(statement).first()
    if not link:
        return False

    session.delete(link)
    session.commit()
    return True
