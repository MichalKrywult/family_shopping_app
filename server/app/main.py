from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.shopping.router import router as shopping_router
from app.auth.router import router as auth_router
from app.spaces.router import router as spaces_router
from app.core.database import init_db
from fastapi.middleware.cors import CORSMiddleware

from fastapi.staticfiles import StaticFiles
from pathlib import Path
from fastapi.responses import RedirectResponse, FileResponse

# Do not delete this or bad things will happen (probably)
from app.auth import models as auth_models  # noqa
from app.spaces import models as spaces_models  # noqa
from app.shopping import models as shopping_models  # noqa


@asynccontextmanager
async def lifespan(app: FastAPI):
    # this code will be executed once at the server start
    init_db()
    yield


app = FastAPI(title="Shopping List API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],  # Allow all origins for simplicity, in production use specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(shopping_router)
app.include_router(auth_router)
app.include_router(spaces_router)


CLIENT_DIR = Path(__file__).resolve().parent.parent.parent / "client"
app.mount("/src", StaticFiles(directory=CLIENT_DIR / "src"), name="src")
app.mount("/public", StaticFiles(directory=CLIENT_DIR / "public"), name="public")


@app.get("/")
def read_root():
    return FileResponse(CLIENT_DIR / "index.html")


@app.get("/index.html")
def redirect_to_root():
    return RedirectResponse(url="/", status_code=307)


@app.get("/login.html")
def read_login():
    return FileResponse(CLIENT_DIR / "login.html")
