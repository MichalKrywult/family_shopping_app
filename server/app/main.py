from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.shopping.router import router as shopping_router
from app.core.database import init_db
from fastapi.middleware.cors import CORSMiddleware

from fastapi.staticfiles import StaticFiles
from pathlib import Path
from fastapi.responses import FileResponse


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


CLIENT_DIR = Path(__file__).resolve().parent.parent.parent / "client"
app.mount("/src", StaticFiles(directory=CLIENT_DIR / "src"), name="src")
app.mount("/public", StaticFiles(directory=CLIENT_DIR / "public"), name="public")


@app.get("/")
def read_root():
    return FileResponse(CLIENT_DIR / "index.html")
