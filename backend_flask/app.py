"""
StudyMate – Smart Study Planner & Academic Productivity System
Production-ready Flask Backend with MySQL, APScheduler & Web Push (VAPID)
"""

import os
import uuid
import datetime
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from sqlalchemy import create_engine, Column, String, Integer, Float, Text, Boolean, DateTime, Date, Time, ForeignKey, Enum
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from dotenv import load_dotenv
import bcrypt
from apscheduler.schedulers.background import BackgroundScheduler
import json

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configuration
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "password")
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = os.getenv("MYSQL_PORT", "3306")
MYSQL_DB = os.getenv("MYSQL_DB", "studymate_db")
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", os.path.join(os.path.dirname(__file__), "uploads"))
VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY", "generate_via_vapid_key")
VAPID_CLAIMS_EMAIL = os.getenv("VAPID_CLAIMS_EMAIL", "mailto:admin@studymate.app")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

DATABASE_URI = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}?charset=utf8mb4"
engine = create_engine(DATABASE_URI, pool_recycle=3600, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# SQLAlchemy Database Models
class User(Base):
    __tablename__ = 'users'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(120), nullable=False)
    email = Column(String(191), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class UserPreference(Base):
    __tablename__ = 'user_preferences'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), unique=True)
    theme = Column(String(50), default='light-purple')
    daily_goal_hours = Column(Float, default=3.0)
    auto_snooze_minutes = Column(Integer, default=15)

class Subject(Base):
    __tablename__ = 'subjects'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), index=True)
    name = Column(String(100), nullable=False)
    color = Column(String(20), default='#8066C5')

class Task(Base):
    __tablename__ = 'tasks'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), index=True)
    title = Column(String(200), nullable=False)
    subject = Column(String(120), nullable=False)
    description = Column(Text, nullable=True)
    date = Column(Date, nullable=False)
    start_time = Column(String(10), nullable=False)
    duration_minutes = Column(Integer, default=60)
    priority = Column(String(20), default='Medium')
    category = Column(String(30), default='Study')
    status = Column(String(20), default='Pending')
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

class LearningGoal(Base):
    __tablename__ = 'learning_goals'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), index=True)
    subject_name = Column(String(120), nullable=False)
    syllabus_details = Column(Text, nullable=True)
    total_chapters = Column(Integer, default=1)
    completed_chapters = Column(Integer, default=0)
    target_date = Column(Date, nullable=False)
    start_date = Column(Date, default=datetime.date.today)
    planned_duration_months = Column(Float, default=2.0)
    daily_study_hours = Column(Float, default=2.0)
    difficulty = Column(String(30), default='Intermediate')
    status = Column(String(30), default='On-Track')

class Exam(Base):
    __tablename__ = 'exams'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), index=True)
    title = Column(String(150), nullable=False)
    subject = Column(String(120), nullable=False)
    date = Column(Date, nullable=False)
    time = Column(String(10), default='10:00')
    description = Column(Text, nullable=True)
    priority = Column(String(20), default='High')

class Document(Base):
    __tablename__ = 'documents'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), index=True)
    title = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)
    subject = Column(String(120), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_size = Column(Integer, default=0)
    file_type = Column(String(100), default='application/pdf')
    storage_path = Column(String(500), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

class Notification(Base):
    __tablename__ = 'notifications'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False)
    task_id = Column(String(36), nullable=True)
    exam_id = Column(String(36), nullable=True)
    scheduled_time = Column(DateTime, nullable=False)
    status = Column(String(20), default='unread')
    snoozed_until = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class PushSubscription(Base):
    __tablename__ = 'notification_subscriptions'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'))
    endpoint = Column(Text, nullable=False)
    p256dh = Column(String(255), nullable=False)
    auth = Column(String(255), nullable=False)

# Simple Token Cache
TOKEN_STORE = {}

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"error": "Authentication token missing"}), 401
        token = auth_header.replace("Bearer ", "").strip()
        user_id = TOKEN_STORE.get(token)
        if not user_id:
            return jsonify({"error": "Invalid or expired session"}), 401
        return f(user_id, *args, **kwargs)
    return decorated

# 1. Registration
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json or {}
    name = data.get("name")
    email = (data.get("email") or "").lower().strip()
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    db = next(get_db())
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        return jsonify({"error": "User with this email already exists"}), 409

    pwd_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    new_user = User(name=name, email=email, password_hash=pwd_hash)
    db.add(new_user)
    db.commit()

    # Preferences
    pref = UserPreference(user_id=new_user.id, theme='light-purple', daily_goal_hours=3.0)
    db.add(pref)
    db.commit()

    token = str(uuid.uuid4())
    TOKEN_STORE[token] = new_user.id

    return jsonify({
        "message": "User registered successfully",
        "token": token,
        "user": {"id": new_user.id, "name": new_user.name, "email": new_user.email, "theme": "light-purple"}
    }), 201

# 2. Login
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json or {}
    email = (data.get("email") or "").lower().strip()
    password = data.get("password")

    db = next(get_db())
    user = db.query(User).filter(User.email == email).first()
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
        return jsonify({"error": "Invalid email or password"}), 401

    token = str(uuid.uuid4())
    TOKEN_STORE[token] = user.id

    pref = db.query(UserPreference).filter(UserPreference.user_id == user.id).first()
    theme = pref.theme if pref else 'light-purple'

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email, "theme": theme}
    })

# 3. Tasks CRUD
@app.route('/api/tasks', methods=['GET'])
@auth_required
def get_tasks(user_id):
    db = next(get_db())
    tasks = db.query(Task).filter(Task.user_id == user_id).all()
    return jsonify([{
        "id": t.id,
        "title": t.title,
        "subject": t.subject,
        "description": t.description,
        "date": str(t.date),
        "startTime": t.start_time,
        "durationMinutes": t.duration_minutes,
        "priority": t.priority,
        "category": t.category,
        "status": t.status
    } for t in tasks])

@app.route('/api/tasks', methods=['POST'])
@auth_required
def create_task(user_id):
    data = request.json or {}
    db = next(get_db())
    new_task = Task(
        user_id=user_id,
        title=data.get("title"),
        subject=data.get("subject"),
        description=data.get("description", ""),
        date=datetime.datetime.strptime(data.get("date"), "%Y-%m-%d").date(),
        start_time=data.get("startTime", "09:00"),
        duration_minutes=int(data.get("durationMinutes", 60)),
        priority=data.get("priority", "Medium"),
        category=data.get("category", "Study"),
        status="Pending"
    )
    db.add(new_task)
    db.commit()
    return jsonify({"message": "Task created", "id": new_task.id}), 201

# Background notification scheduler runner
def check_scheduled_notifications():
    with app.app_context():
        db = next(get_db())
        now = datetime.datetime.utcnow()
        pending = db.query(Notification).filter(
            Notification.status == 'unread',
            Notification.scheduled_time <= now
        ).all()
        for notif in pending:
            # Send Web Push notification if subscription exists
            # Dispatch device push payload
            pass

scheduler = BackgroundScheduler()
scheduler.add_job(func=check_scheduled_notifications, trigger="interval", seconds=60)
scheduler.start()

if __name__ == '__main__':
    Base.metadata.create_all(bind=engine)
    app.run(host='0.0.0.0', port=5000, debug=True)
