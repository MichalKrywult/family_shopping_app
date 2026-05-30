# app/core/database.py
from pathlib import Path
from sqlmodel import create_engine, Session, SQLModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

DB_PATH = DATA_DIR / "database.db"
# sqlite:// to inform the  SQLAlchemy
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL, echo=True, connect_args={"check_same_thread": False}
)


def init_db():
    """Inicjalizuje bazę danych i tworzy wszystkie tabele zdefiniowane w models.py"""
    # import models - IMPORRTANT!!!
    from shopping.models import ShoppingList, Item  # noqa

    SQLModel.metadata.create_all(engine)


def get_session():
    """Generator sesji dla FastAPI (Context Manager)"""
    with Session(engine) as session:
        yield session
