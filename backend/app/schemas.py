from pydantic import BaseModel, ConfigDict
from datetime import datetime

class UserCreate(BaseModel):
    username: str 
    password: str 
    email: str

class UserResponse(BaseModel):
    id: int 
    username: str
    email: str 
    model_config = ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    email: str
    password: str 

class TaskBase(BaseModel):
    title: str
    description: str | None = None
    estimated_hours: float
    due_date: str | None = None
    resource_url: str | None = None

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: int
    is_completed: bool
    completed_at: datetime | None = None
    subject_id: int
    model_config = ConfigDict(from_attributes=True)

class SubjectBase(BaseModel):
    name: str
    difficulty: int

class SubjectCreate(SubjectBase):
    roadmap_id: int | None = None

class SubjectResponse(SubjectBase):
    id: int
    user_id: int
    roadmap_id: int | None = None
    tasks: list[TaskResponse] = []
    model_config = ConfigDict(from_attributes=True)

class RoadmapCreate(BaseModel):
    goal: str
    target_completion_date: str

class RoadmapResponse(BaseModel):
    id: int
    goal: str
    target_completion_date: str
    created_at: datetime
    subjects: list[SubjectResponse] = []
    model_config = ConfigDict(from_attributes=True)

class RoadmapInput(BaseModel):
    prompt: str  
    duration_months: int = 3
    level: str = "Beginner"
    daily_hours: float = 4.0
