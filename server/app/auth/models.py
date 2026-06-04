from typing import List, Optional, ClassVar
from sqlmodel import SQLModel, Field, Relationship


class User(SQLModel, table=True):
    __tablename__: ClassVar[str] = "users"

    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    username: str = Field(unique=True, index=True, nullable=False)
    email: Optional[str] = Field(default=None, unique=True, index=True, nullable=True)

    hashed_password: str = Field(nullable=False)
    is_active: bool = Field(default=True)

    shopping_items: List["Item"] = Relationship(
        back_populates="owner",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class UserCreate(SQLModel):
    username: str
    password: str
    email: Optional[str] = None
