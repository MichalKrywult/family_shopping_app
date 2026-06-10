from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from app.core.database import get_session
from app.auth.service import get_current_user
from app.auth.models import User
from app.spaces.models import SpaceRead, SpaceCreate, SpaceUserAdd
from . import service
from app.spaces.models import Space

router = APIRouter(prefix="/spaces", tags=["Spaces"])


@router.post("/", response_model=SpaceRead, status_code=status.HTTP_201_CREATED)
def create_new_space(
    space_data: SpaceCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Creates a new space for the authenticated user."""
    assert current_user.id is not None
    return service.create_space(session, name=space_data.name, user_id=current_user.id)


@router.get("/", response_model=list[SpaceRead])
def get_spaces(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Retrieves all spaces the authenticated user has access to."""
    assert current_user.id is not None
    return service.get_user_spaces(session, user_id=current_user.id)


@router.post("/{space_id}/members")
def add_member_to_space(
    space_id: int,
    member_data: SpaceUserAdd,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Adds another user to a space by username (Owner only)."""
    assert current_user.id is not None
    user = service.add_member_by_username(
        session,
        space_id=space_id,
        username=member_data.username,
        current_user_id=current_user.id,
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Space not found, user not found, or access denied",
        )
    return {"message": f"User {user.username} added successfully to the space"}


@router.delete("/{space_id}")
def delete_space(
    space_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Deletes a space (Owner only)"""
    assert current_user.id is not None
    success = service.delete_space(
        session,
        space_id=space_id,
        current_user_id=current_user.id,
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Space not found or access denied",
        )
    return {"message": "Space deleted successfully"}


@router.put("/{space_id}")
def edit_space_name(
    space_id: int,
    space_data: SpaceCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Edits the name of a space (Owner only)."""
    assert current_user.id is not None

    success = service.edit_space_name(
        session=session,
        space_id=space_id,
        current_user_id=current_user.id,
        name=space_data.name,
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Space not found or access denied",
        )

    return {"message": "Space name edited successfully"}


@router.get("/{space_id}/members")
def get_space_members(
    space_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Retrieves all members of a specific space."""
    assert current_user.id is not None

    members = service.get_space_members_list(
        session, space_id=space_id, current_user_id=current_user.id
    )

    if members is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this space or space does not exist",
        )

    space = session.get(Space, space_id)
    assert space is not None

    return [
        {
            "id": m.id,
            "username": m.username,
            "display_name": m.display_name or m.username,
            "is_owner": m.id == space.owner_id,
        }
        for m in members
    ]


@router.delete("/{space_id}/members/{user_id}")
def remove_member(
    space_id: int,
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Removes a member from a space (Owner only)."""
    assert current_user.id is not None

    success = service.remove_member_from_space(
        session,
        space_id=space_id,
        user_id_to_remove=user_id,
        current_user_id=current_user.id,
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not remove member. Verify ownership, user status, or database links.",
        )

    return {"message": "Member removed successfully"}
