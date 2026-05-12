from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    subjects = relationship("Subject", back_populates="owner")

class Subject(Base):
    __tablename__ = "subjects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    difficulty = Column(Integer)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="subjects")
    # --- ENSURE THIS LINE IS HERE ---
    tasks = relationship("Task", back_populates="subject") 

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    estimated_hours = Column(Integer)
    due_date = Column(String, nullable=True)
    is_completed = Column(Boolean, default=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"))

    # --- ENSURE THIS LINE IS HERE ---
    # This must match the name used in back_populates="subject" above!
    subject = relationship("Subject", back_populates="tasks")
