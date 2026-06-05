from pathlib import Path
from sqlmodel import Session, SQLModel, create_engine

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
    """Init db, tables and relations"""
    from app.auth.models import User  # noqa
    from app.shopping.models import Item, ShoppingList  # noqa
    from app.spaces.models import Space, UserSpaceLink  # noqa

    User.model_rebuild()
    Item.model_rebuild()
    ShoppingList.model_rebuild()
    Space.model_rebuild()
    UserSpaceLink.model_rebuild()

    SQLModel.metadata.create_all(engine)


def get_session():
    """Generetes session"""
    with Session(engine) as session:
        yield session
