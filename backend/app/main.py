import os
import json
from dotenv import load_dotenv 
load_dotenv() 

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .database import engine, get_db
from . import models, schemas, auth_utils
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from groq import Groq
from sqlalchemy import func
from jose import JWTError, jwt

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Learning Planner API")

app.add_middleware(CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth_utils.SECRET_KEY, algorithms=[auth_utils.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@app.get("/")
def read_root():
    return {"message": "Welcome to the Secure Smart Learning Planner API!"}

@app.post("/users/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=auth_utils.get_password_hash(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/login/")
def login_user(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth_utils.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    
    access_token = auth_utils.create_access_token(data={"sub": db_user.email})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "username": db_user.username,
            "email": db_user.email
        }
    }

@app.post("/generate-roadmap/")
def generate_roadmap(
    input_data: schemas.RoadmapInput, 
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    prompt = f"""
    Create a highly professional and structured learning roadmap for: "{input_data.prompt}"
    The user's current level is: "{input_data.level}"
    The desired duration is: {input_data.duration_months} months.
    The user can dedicate exactly {input_data.daily_hours} hours per day to studying.

    Return ONLY a JSON object with this structure:
    {{
      "goal": "string",
      "duration_months": {input_data.duration_months},
      "subjects": [
        {{
          "name": "string",
          "difficulty": 1-5,
          "tasks": [
            {{
              "title": "string",
              "day_number": int (MUST start from 1 and increment daily across the duration. Spread tasks across different days of the week),
              "estimated_hours": float (max {input_data.daily_hours} hours per task; if a topic is longer, split it into multiple tasks on different days),
              "description": "string (briefly explain what will be learned and why it is important in this sequence)"
            }}
          ]
        }}
      ]
    }}
    """
    try:
        completion = groq_client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        roadmap_data = json.loads(completion.choices[0].message.content)
        target_date = (datetime.now() + timedelta(days=roadmap_data.get('duration_months', 3) * 30)).strftime("%Y-%m-%d")
        
        db_roadmap = models.Roadmap(user_id=current_user.id, goal=roadmap_data['goal'], target_completion_date=target_date)
        db.add(db_roadmap)
        db.commit()
        db.refresh(db_roadmap)
        
        for sub_data in roadmap_data['subjects']:
            db_sub = models.Subject(name=sub_data['name'], difficulty=sub_data['difficulty'], user_id=current_user.id, roadmap_id=db_roadmap.id)
            db.add(db_sub)
            db.commit()
            db.refresh(db_sub)
            for task_data in sub_data['tasks']:
                # SMART DAILY DISTRIBUTION
                # Today + (Day Number days)
                day_offset = task_data.get('day_number', 1)
                task_due_date = (datetime.now() + timedelta(days=day_offset)).strftime("%Y-%m-%d")

                db_task = models.Task(
                    title=task_data['title'], 
                    description=task_data.get('description', ''),
                    estimated_hours=task_data['estimated_hours'], 
                    resource_url=None, 
                    subject_id=db_sub.id, 
                    due_date=task_due_date
                )
                db.add(db_task)
            db.commit()
        return {"message": "Roadmap generated", "roadmap_id": db_roadmap.id}
    except Exception as e:
        print(f"ROADMAP ERROR: {e}")
        raise HTTPException(status_code=500, detail=f"Roadmap generation failed: {str(e)}")

@app.get("/analytics/")
def get_analytics(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    subjects = db.query(models.Subject).filter(models.Subject.user_id == current_user.id).all()
    subject_ids = [s.id for s in subjects]
    
    total_tasks = db.query(models.Task).filter(models.Task.subject_id.in_(subject_ids)).count() if subject_ids else 0
    completed_tasks = db.query(models.Task).filter(models.Task.subject_id.in_(subject_ids), models.Task.is_completed == True).count() if subject_ids else 0
    
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    history = db.query(
        func.date(models.Task.completed_at).label('day'),
        func.count(models.Task.id).label('count')
    ).filter(
        models.Task.subject_id.in_(subject_ids),
        models.Task.completed_at >= seven_days_ago
    ).group_by(func.date(models.Task.completed_at)).all() if subject_ids else []
    
    completed_days = db.query(func.date(models.Task.completed_at)).join(models.Subject).filter(
        models.Subject.user_id == current_user.id,
        models.Task.is_completed == True
    ).distinct().order_by(func.date(models.Task.completed_at).desc()).all()
    
    streak = 0
    if completed_days:
        current_date = datetime.now().date()
        last_completed = completed_days[0][0]

        if last_completed >= current_date - timedelta(days=1):
            streak = 0
            expected = last_completed
            for day_row in completed_days:
                if day_row[0] == expected:
                    streak += 1
                    expected -= timedelta(days=1)
                else:
                    break
    
    return {
        "completion_rate": round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0,
        "total_completed": completed_tasks,
        "daily_history": [{"day": str(h.day), "tasks": h.count} for h in history],
        "streak": streak
    }

@app.get("/schedule/")
def generate_schedule(roadmap_id: int | None = None, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    today_str = datetime.now().strftime("%Y-%m-%d")
    
    base_filter = [models.Subject.user_id == current_user.id, models.Task.is_completed == False]
    if roadmap_id:
        base_filter.append(models.Subject.roadmap_id == roadmap_id)

    overdue_tasks = db.query(models.Task).join(models.Subject).filter(
        *base_filter,
        models.Task.due_date < today_str
    ).all()
    
    for task in overdue_tasks:
        task.due_date = today_str
    db.commit() #on overdue tasks are added to next day's schedule, their due date is updated to today so that they are prioritized in the schedule

    
    query = db.query(
        models.Task, 
        models.Subject.name.label("subject_name"), 
        models.Subject.difficulty,
        models.Roadmap.goal.label("roadmap_goal")
    ).join(models.Subject, models.Task.subject_id == models.Subject.id)\
     .join(models.Roadmap, models.Subject.roadmap_id == models.Roadmap.id)\
     .filter(*base_filter)
    
    results = query.all()
    all_tasks = []
    for t, sub_name, diff, goal in results:
        all_tasks.append({
            "id": t.id, 
            "title": t.title, 
            "description": t.description,
            "subject": sub_name, 
            "difficulty": diff,
            "goal": goal,
            "hours": t.estimated_hours, 
            "due_date": t.due_date, 
            "resource_url": t.resource_url
        })
    
    # CHRONOLOGICAL SORTING (Immediate tasks first)
    sorted_tasks = sorted(all_tasks, key=lambda x: (x['due_date'], -x['difficulty']))
    
    # Show more tasks to ensure visibility of the current month
    pomodoro_plan = [{**t, "pomodoro_chunks": max(1, int((t['hours'] * 60) // 25))} for t in sorted_tasks[:15]]
    
    return {
        "today_focus": pomodoro_plan, 
        "total_estimated_time": round(sum(t['hours'] for t in sorted_tasks), 1),
        "ai_tip": "Focus on your immediate milestones!"
    }

@app.get("/roadmaps/", response_model=list[schemas.RoadmapResponse])
def get_roadmaps(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Roadmap).filter(models.Roadmap.user_id == current_user.id).all()  #this one is called again after the roadmap is deleted to refresh the list of roadmaps in the schedule page

@app.delete("/roadmaps/{roadmap_id}")
def delete_roadmap(roadmap_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_roadmap = db.query(models.Roadmap).filter(models.Roadmap.id == roadmap_id, models.Roadmap.user_id == current_user.id).first()
    if not db_roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    subjects = db.query(models.Subject).filter(models.Subject.roadmap_id == roadmap_id).all()
    for sub in subjects:
        db.query(models.Task).filter(models.Task.subject_id == sub.id).delete()
    db.query(models.Subject).filter(models.Subject.roadmap_id == roadmap_id).delete()
    
    db.delete(db_roadmap)
    db.commit()
    return {"message": "Roadmap and associated tasks deleted"} #deleted roadmap and all associated subjects and tasks when called from scheulde page roadmap delete button

@app.patch("/tasks/{task_id}/toggle")
def toggle_task(task_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_task = db.query(models.Task).join(models.Subject).filter(models.Task.id == task_id, models.Subject.user_id == current_user.id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    db_task.is_completed = not db_task.is_completed
    db_task.completed_at = datetime.utcnow() if db_task.is_completed else None
    db.commit()
    db.refresh(db_task)
    return db_task #this is called in schedule page to mark as completed
   
@app.get("/all-tasks/")
def get_all_tasks(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    tasks = db.query(
        models.Task, 
        models.Subject.name.label("subject_name"),
        models.Roadmap.goal.label("roadmap_goal")
    ).join(models.Subject, models.Task.subject_id == models.Subject.id)\
     .join(models.Roadmap, models.Subject.roadmap_id == models.Roadmap.id)\
     .filter(
        models.Subject.user_id == current_user.id,
        models.Task.is_completed == False
    ).all()
    
    return [{
        "id": t.id,
        "title": t.title,
        "due_date": t.due_date,
        "subject": sub_name,
        "goal": goal
    } for t, sub_name, goal in tasks] #this is called in calendar page
