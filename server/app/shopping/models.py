from typing import List, Optional, ClassVar
from sqlmodel import Field, Relationship, SQLModel
from datetime import datetime


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
    items: List["Item"]


class ItemUpdate(SQLModel):
    name: Optional[str] = None
    quantity: Optional[int] = None


class ItemCreate(SQLModel):
    name: str
    quantity: int = 1
