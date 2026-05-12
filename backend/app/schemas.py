from pydantic import BaseModel,ConfigDict

class UserCreate(BaseModel):
    username:str 
    password:str 
    email:str


class UserResponse(BaseModel):
    id:int 
    username:str
    email:str 
    model_config=ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    email:str
    password:str 


class SubjectBase(BaseModel):
    name:str
    difficulty:int

class SubjectCreate(SubjectBase):
    pass

class SubjectResponse(SubjectBase):
    id: int
    user_id: int
    tasks: list['TaskResponse'] = []

    model_config = ConfigDict(from_attributes=True)


class TaskBase(BaseModel):
    title: str
    description: str | None = None
    estimated_hours: int
    due_date: str | None = None

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: int
    is_completed: bool
    subject_id: int

    model_config = ConfigDict(from_attributes=True)
