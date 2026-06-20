"""
Application entry point.

This is the file uvicorn runs. It builds the FastAPI app, connects the three
routers, enables CORS (so the React frontend can call the API from the
browser), and exposes the interactive docs at /docs.

For local development we auto-create the database tables on startup so you can
run the app immediately without Alembic. In Docker/production, Alembic
migrations manage the schema instead.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import customers, orders, products

# Import models so SQLAlchemy registers the tables before create_all runs.
from app import models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs once when the server starts.
    Base.metadata.create_all(bind=engine)
    yield
    # (Nothing needed on shutdown.)


app = FastAPI(
    title="Inventory & Order Management System",
    description="A simple API to manage products, customers, and orders.",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow the frontend (and the docs page) to call this API from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For an assessment this is fine; tighten in real production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Wire up the endpoints.
app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)


@app.get("/", tags=["Health"], summary="Health check")
def root():
    """A tiny endpoint to confirm the API is alive."""
    return {"status": "ok", "message": "Inventory & Order API is running. See /docs."}
