from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="./.env")

SQlALCHEMY_DATABASE_URL=os.getenv("DATABASE_URL")

if SQlALCHEMY_DATABASE_URL is None:
    print("No url found")
else:
    print("url found")

engine=create_engine(
    SQlALCHEMY_DATABASE_URL
)

\

SessionLocal= sessionmaker(autocommit=False,autoflush=False, bind=engine)

Base=declarative_base()

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()