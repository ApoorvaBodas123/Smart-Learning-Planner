from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Float, Date
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    subjects = relationship("Subject", back_populates="owner")
    roadmaps = relationship("Roadmap", back_populates="user")

class Roadmap(Base):
    __tablename__ = "roadmaps"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    goal = Column(String)
    target_completion_date = Column(String)  # Stored as ISO string
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="roadmaps")
    subjects = relationship("Subject", back_populates="roadmap")

class Subject(Base):
    __tablename__ = "subjects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    difficulty = Column(Integer)
    user_id = Column(Integer, ForeignKey("users.id"))
    roadmap_id = Column(Integer, ForeignKey("roadmaps.id"), nullable=True)

    owner = relationship("User", back_populates="subjects")
    roadmap = relationship("Roadmap", back_populates="subjects")
    tasks = relationship("Task", back_populates="subject", cascade="all, delete-orphan") 

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    estimated_hours = Column(Float)
    due_date = Column(String, nullable=True)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True) # For analytics
    resource_url = Column(String, nullable=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))

    subject = relationship("Subject", back_populates="tasks")
