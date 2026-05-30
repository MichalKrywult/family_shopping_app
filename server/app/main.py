from contextlib import asynccontextmanager
from fastapi import FastAPI
from shopping.router import router as shopping_router
from core.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # this code will be executed once at the server start
    init_db()
    yield


app = FastAPI(title="Shopping List API", version="1.0.0", lifespan=lifespan)
app.include_router(shopping_router)


@app.get("/")
def read_root():
    return {"status": "ok"}
