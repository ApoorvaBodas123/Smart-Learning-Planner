from sqlalchemy import Column,Integer,String,ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id=Column(Integer,primary_key=True,index=True)
    username=Column(String,unique=True,index=True)
    email=Column(String,unique=True,index=True)
    hashed_password=Column(String)

class Subjects(Base):
    __tablename__ = "subjects"

    id=Column(Integer,primary_key=True,index=True)
    name=Column(String,index=True)
    difficulty=Column(Integer)
    user_id=Column(Integer,ForeignKey("user.id"))
    owner=relationship("User",back_populates="subjects")


