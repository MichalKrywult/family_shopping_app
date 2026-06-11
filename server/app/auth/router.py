from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

from app.auth import service as auth_service
from app.auth.models import User, UserCreate
from app.core.config import settings
from app.core.database import get_session
from app.auth.models import ProfileUpdate, PasswordUpdate

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate, session: Session = Depends(get_session)):
    """Register a new user with an optional email address."""

    statement_username = select(User).where(User.username == user_data.username)
    if session.exec(statement_username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this username already exists.",
        )

    if user_data.email:
        statement_email = select(User).where(User.email == user_data.email)
        if session.exec(statement_email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists.",
            )

    hashed_password = auth_service.get_password_hash(user_data.password)

    db_user = User(
        username=user_data.username,
        display_name=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        is_active=True,
    )

    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    return {
        "message": "User registered successfully.",
        "username": db_user.username,
        "display_name": db_user.display_name,
    }


@router.post("/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    """Authenticate a user and return a JWT access token with profile data."""

    statement = select(User).where(User.username == form_data.username)
    user = session.exec(statement).first()

    if not user or not auth_service.verify_password(
        form_data.password, user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is inactive.",
        )

    access_token_expires = timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS)
    access_token = auth_service.create_access_token(
        data={
            "sub": str(user.id),
            "username": user.username,
            "display_name": user.display_name or user.username,
        },
        expires_delta=access_token_expires,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.put("/profile")
def update_profile_details(
    profile_data: ProfileUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_service.get_current_user),
):
    """Update current user's profile details (display name and username)."""

    if profile_data.username and profile_data.username != current_user.username:
        statement = select(User).where(User.username == profile_data.username)
        if session.exec(statement).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This username is already taken.",
            )
        current_user.username = profile_data.username

    if profile_data.display_name is not None:
        current_user.display_name = profile_data.display_name

    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    return {
        "username": current_user.username,
        "display_name": current_user.display_name,
    }


@router.put("/profile/password")
def update_password(
    password_data: PasswordUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_service.get_current_user),
):
    """Update current user's password."""

    if not auth_service.verify_password(
        password_data.current_password, current_user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password.",
        )

    current_user.hashed_password = auth_service.get_password_hash(
        password_data.new_password
    )

    session.add(current_user)
    session.commit()

    return {"message": "Password updated successfully."}
