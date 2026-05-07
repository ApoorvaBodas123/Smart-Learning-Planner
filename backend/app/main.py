from fastapi import Depends,FastAPI,HTTPException
from sqlalchemy.orm import Session
from .database import engine,get_db
from .import models,schemas
from fastapi.middleware.cors import CORSMiddleware
models.Base.metadata.create_all(bind=engine)

app=FastAPI(title="Smart Learning Planner API")

app.add_middleware(CORSMiddleware,
allow_origins=["*"],
allow_credentials=True,
allow_methods=["*"],
allow_headers=["*"],
)

@app.get("/")


def read_root():
    return {"message":"Welcome to the Smart Learning Planner API!"}

@app.post("/users/",response_model=schemas.UserResponse)


def create_user(user:schemas.UserCreate, db:Session=Depends(get_db)):

    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=user.password)
    print("🚀 BACKEND RECEIVED A REQUEST!")
    print(f"📦 Data from Axios: {user}")
    print(f"👤 Creating user: {user.username} with email: {user.email}")
    # ---------

    db.add(db_user)

    db.commit()

    db.refresh(db_user)

    return db_user

@app.post("/login/")
def login_user(user: schemas.UserLogin, db: Session = Depends(get_db)):
    
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    
    
    if not db_user or db_user.hashed_password != user.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    print(f"🔑 USER LOGGED IN: {db_user.username}")
    return {"message": "Login successful", "user": db_user}

@app.post("/subjects",
response_model=list[schemas.SubjectResponse]
)

def get_subjects(user_id:int,db:Session=Depends(get_db)):
    return 
    db.query(models.Subject).filter(
    models.Subject.user_id == user_id).all()


