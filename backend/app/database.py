"""
Database connection setup.

This file decides WHICH database to talk to and creates the tools the rest
of the app uses to read/write data.

- If the DATABASE_URL environment variable is set (e.g. inside Docker), we use
  that — typically PostgreSQL.
- If it is NOT set, we fall back to a local SQLite file called inventory.db,
  so you can run everything on your machine with no extra setup.
"""

import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load variables from a .env file if one exists (handy for local development).
load_dotenv()

# Read the database location from the environment, or default to local SQLite.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./inventory.db")

# Some hosts (including Render) hand out URLs that start with "postgres://".
# SQLAlchemy needs the scheme "postgresql://", so we fix it up here.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLite needs one special flag to work with FastAPI's threading model.
# Other databases (PostgreSQL) don't need it.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

# The "engine" is the actual connection to the database.
engine = create_engine(DATABASE_URL, connect_args=connect_args)

# A "session" is a single conversation with the database (one request = one session).
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# All our table classes (models) will inherit from this Base.
Base = declarative_base()


def get_db():
    """
    Hands a fresh database session to each request, and guarantees it is
    closed afterwards even if something goes wrong. FastAPI calls this
    automatically wherever we write Depends(get_db).
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
