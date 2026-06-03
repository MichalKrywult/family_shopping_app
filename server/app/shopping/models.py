from datetime import datetime
from typing import ClassVar, List, Optional
from sqlmodel import Field, Relationship, SQLModel


class ShoppingList(SQLModel, table=True):
    __tablename__: ClassVar[str] = "shopping_lists"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(nullable=False)
    is_deleted: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    items: List["Item"] = Relationship(back_populates="shopping_list")


class Item(SQLModel, table=True):
    __tablename__: ClassVar[str] = "items"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(nullable=False)
    quantity: int = Field(default=1)
    is_done: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    list_id: int = Field(foreign_key="shopping_lists.id")
    shopping_list: Optional[ShoppingList] = Relationship(back_populates="items")
    owner_id: Optional[int] = Field(default=None, foreign_key="users.id")
    owner: Optional[User] = Relationship(back_populates="shopping_items")


class ItemRead(SQLModel):
    id: int
    name: str
    quantity: int
    is_done: int
    created_at: datetime
    list_id: int
    owner_id: Optional[int]


class ShoppingListCreate(SQLModel):
    name: str


class ShoppingListMinimal(SQLModel):
    id: int
    name: str
    is_deleted: int
    created_at: datetime
    items_count: int


class ShoppingListDetail(SQLModel):
    id: int
    name: str
    is_deleted: int
    created_at: datetime
    items: List[ItemRead]


class ItemUpdate(SQLModel):
    name: Optional[str] = None
    quantity: Optional[int] = None


class ItemCreate(SQLModel):
    name: str
    quantity: int = 1
