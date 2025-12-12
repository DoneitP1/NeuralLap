from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings
import os

# Ensure data directory exists
os.makedirs("data", exist_ok=True)

SQLITE_FILE_NAME = "data/neural_community.db"
sqlite_url = f"sqlite:///{SQLITE_FILE_NAME}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, echo=False, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
