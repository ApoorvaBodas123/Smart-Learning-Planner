import os
from dotenv import load_dotenv 
load_dotenv() 

from fastapi import Depends,FastAPI,HTTPException
from sqlalchemy.orm import Session
from .database import engine,get_db
from .import models,schemas
from fastapi.middleware.cors import CORSMiddleware
models.Base.metadata.create_all(bind=engine)

import google.generativeai as genai
from datetime import datetime
from groq import Groq

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

# Add these endpoints to main.py

@app.post("/subjects/", response_model=schemas.SubjectResponse)
def create_subject(subject: schemas.SubjectCreate, user_id: int, db: Session = Depends(get_db)):
     db_subject = models.Subject(
        name=subject.name, 
        difficulty=subject.difficulty, 
        user_id=user_id
    )
     db.add(db_subject)
     db.commit()
     db.refresh(db_subject)
     return db_subject

@app.get("/users/{user_id}/subjects/", response_model=list[schemas.SubjectResponse])
def get_subjects(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.Subject).filter(models.Subject.user_id == user_id).all()


@app.post("/tasks/", response_model=schemas.TaskResponse)
def create_task(task: schemas.TaskCreate, subject_id: int, db: Session = Depends(get_db)):
    db_task = models.Task(**task.model_dump(), subject_id=subject_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.get("/subjects/{subject_id}/tasks/", response_model=list[schemas.TaskResponse])
def get_tasks(subject_id: int, db: Session = Depends(get_db)):
    return db.query(models.Task).filter(models.Task.subject_id == subject_id).all()


# Configure Groq
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@app.get("/users/{user_id}/schedule/")
def generate_schedule(user_id: int, db: Session = Depends(get_db)):
    subjects = db.query(models.Subject).filter(models.Subject.user_id == user_id).all()
    
    all_tasks = []
    for sub in subjects:
        tasks = db.query(models.Task).filter(models.Task.subject_id == sub.id, models.Task.is_completed == False).all()
        for t in tasks:
            all_tasks.append({
                "id": t.id,
                "title": t.title,
                "subject": sub.name,
                "difficulty": sub.difficulty,
                "hours": t.estimated_hours,
                "due_date": t.due_date
            })

    # 1. ENHANCED SORTING: Due Date (Closest) first, then Difficulty (Hardest)
    def sort_key(task):
        due = task['due_date'] if task['due_date'] else "9999-12-31"
        return (due, -task['difficulty'])

    sorted_tasks = sorted(all_tasks, key=sort_key)

    # 2. POMODORO MODE: Split tasks into 25-min chunks
    pomodoro_plan = []
    for task in sorted_tasks[:5]:
        chunks = (task['hours'] * 60) // 25
        pomodoro_plan.append({
            **task,
            "pomodoro_chunks": max(1, int(chunks))
        })

    return {
        "today_focus": pomodoro_plan, 
        "total_estimated_time": sum(t['hours'] for t in sorted_tasks),
        "ai_tip": "Focus on the tasks with the red deadline labels first!"
    }


@app.get("/users/{user_id}/ai-analysis/")
def get_ai_analysis(user_id: int, db: Session = Depends(get_db)):
    # Fetch tasks to analyze
    subjects = db.query(models.Subject).filter(models.Subject.user_id == user_id).all()
    task_titles = []
    for sub in subjects:
        tasks = db.query(models.Task).filter(models.Task.subject_id == sub.id).all()
        task_titles.extend([f"{t.title} ({sub.name})" for t in tasks])

    if not task_titles:
        return {"analysis": "Add some tasks first so I can analyze them!"}

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": f"Here are my study tasks: {', '.join(task_titles)}. Can you group them by similarity and give me one 'Pro Study Tip' for this specific workload? Keep it brief and encouraging."
                }
            ],
            temperature=0.7,
            max_tokens=500,
        )
        return {"analysis": completion.choices[0].message.content}
    except Exception as e:
        print(f"❌ Groq Error: {str(e)}")
        # Fallback logic if API fails
        return {"analysis": f"AI Fallback: Focus on your {len(task_titles)} tasks one by one. Tip: Take a 5-min break every 25 mins!"}

@app.patch("/tasks/{task_id}/toggle")
def toggle_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db_task.is_completed = not db_task.is_completed
    db.commit()
    db.refresh(db_task)
    return db_task

@app.delete("/subjects/{subject_id}")
def delete_subject(subject_id: int, db: Session = Depends(get_db)):
    db_subject = db.query(models.Subject).filter(models.Subject.id == subject_id).first()
    if not db_subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(db_subject)
    db.commit()
    return {"message": "Subject deleted"}
