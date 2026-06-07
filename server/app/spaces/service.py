from sqlmodel import Session, select
from app.spaces.models import Space, UserSpaceLink
from app.auth.models import User
from typing import Optional


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

    space = session.get(Space, space_id)
    if not space or space.owner_id != current_user_id:
        return None

    user_statement = select(User).where(User.username == username)
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
