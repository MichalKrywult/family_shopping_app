from datetime import datetime
from typing import ClassVar, List, Optional, TYPE_CHECKING
from sqlmodel import Field, Relationship, SQLModel

from app.auth.models import UserSpaceLink

if TYPE_CHECKING:
    from app.auth.models import User
    from app.shopping.models import ShoppingList


class Space(SQLModel, table=True):
    __tablename__: ClassVar[str] = "spaces"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    owner_id: int = Field(foreign_key="users.id")

    # 2. Używamy zaimportowanej klasy jako żywego obiektu
    members: List["User"] = Relationship(
        back_populates="spaces", link_model=UserSpaceLink
    )
    shopping_lists: List["ShoppingList"] = Relationship(
        back_populates="space", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class SpaceCreate(SQLModel):
    name: str


class SpaceRead(SQLModel):
    id: int
    name: str
    owner_id: int
    created_at: datetime


class SpaceUserAdd(SQLModel):
    username: str
