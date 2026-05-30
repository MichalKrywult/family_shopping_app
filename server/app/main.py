from contextlib import asynccontextmanager
from fastapi import FastAPI
from shopping.router import router as shopping_router
from core.database import init_db
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    # this code will be executed once at the server start
    init_db()
    yield


app = FastAPI(title="Shopping List API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for simplicity, in production use specific origins
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
)

app.include_router(shopping_router)


@app.get("/")
def read_root():
    return {"status": "ok"}
