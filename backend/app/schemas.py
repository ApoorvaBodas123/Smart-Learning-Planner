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

class SubjectCreate(BaseModel):
    pass 

class SubjectResponse(SubjectBase):
    id:int
    user_id:int
    model_config = ConfigDict(from_attributes=True)

    

