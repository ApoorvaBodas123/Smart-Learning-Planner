from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="./.env")

SQlALCHEMY_DATABASE_URL=os.getenv("DATABASE_URL")

engine=create_engine(
    SQlALCHEMY_DATABASE_URL,
    pool_pre_ping=True,  # Verify connections before using
    pool_recycle=3600,   # Recycle connections after 1 hour
    pool_size=5,         # Number of connections to maintain
    max_overflow=10,     # Additional connections when needed
    connect_args={
        "sslmode": "require",  # Require SSL for Neon
        "connect_timeout": 10  # Connection timeout
    }
)

SessionLocal= sessionmaker(autocommit=False,autoflush=False, bind=engine)

Base=declarative_base()

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()