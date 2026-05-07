from fastapi import Depends,FastAPI
from sqlalchemy.orm import Session
from .database import engine,get_db
from .import models,schemas
models.Base.metadata.create_all(bind=engine)

app=FastAPI(title="Smart Learning Planner API")

@app.get("/")

def read_root():
    return {"message":"Welcome to the Smart Learning Planner API!"}

@app.post("/users/",response_model=schemas.UserResponse)

def create_user(user:schemas.UserCreate, db:Session=Depends(get_db)):

    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=user.password)

    db.add(db_user)

    db.commit()

    db.refresh(db_user)

    return db_user
