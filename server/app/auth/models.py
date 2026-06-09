from typing import List, Optional, ClassVar, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from app.spaces.models import UserSpaceLink

if TYPE_CHECKING:
    from app.shopping.models import Item
    from app.spaces.models import Space


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
