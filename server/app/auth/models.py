from datetime import datetime
from typing import List, Optional, ClassVar, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.shopping.models import Item
    from app.spaces.models import Space


class UserSpaceLink(SQLModel, table=True):
    __tablename__: ClassVar[str] = "user_space_links"

    user_id: int = Field(foreign_key="users.id", primary_key=True)
    space_id: int = Field(foreign_key="spaces.id", primary_key=True)
    joined_at: datetime = Field(default_factory=datetime.utcnow)


class User(SQLModel, table=True):
    __tablename__: ClassVar[str] = "users"

    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    username: str = Field(unique=True, index=True, nullable=False)
    display_name: Optional[str] = Field(default=None, nullable=True)
    email: Optional[str] = Field(default=None, unique=True, index=True, nullable=True)

    hashed_password: str = Field(nullable=False)
    is_active: bool = Field(default=True)

    shopping_items: List["Item"] = Relationship(
        back_populates="owner",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )

    spaces: List["Space"] = Relationship(
        back_populates="members", link_model=UserSpaceLink
    )


class UserCreate(SQLModel):
    username: str
    password: str
    email: Optional[str] = None


class ProfileUpdate(SQLModel):
    display_name: Optional[str] = None
    username: Optional[str] = None


class PasswordUpdate(SQLModel):
    current_password: str
    new_password: str
