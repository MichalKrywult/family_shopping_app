from fastapi import FastAPI
from shopping.router import router as shopping_router
from core.database import init_db

app = FastAPI()

init_db()

app.include_router(shopping_router)
