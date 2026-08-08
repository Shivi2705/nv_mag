"""
Database engine + session factory. Defaults to a local SQLite file at
NV_Quantum_Navigation/datasets/final/nv_navigation.db so it sits alongside
the other dataset artifacts. Override with env var DATABASE_URL for
Postgres/MySQL in production.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DB_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "datasets", "final")
os.makedirs(DB_DIR, exist_ok=True)
DEFAULT_DB_PATH = os.path.join(DB_DIR, "nv_navigation.db")

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from app.database import models  # noqa: F401 (ensure models are registered)
    Base.metadata.create_all(bind=engine)
