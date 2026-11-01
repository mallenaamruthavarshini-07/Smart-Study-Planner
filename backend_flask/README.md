# StudyMate – Flask & MySQL Production Architecture Guide

## 1. Overview
This directory contains the Python Flask backend and MySQL database files for **StudyMate – Smart Study Planner & Academic Productivity System**.

### Key Modules:
- **`app.py`**: Full REST API with JWT/Bearer session validation, Flask-CORS, SQLAlchemy ORM, and APScheduler background reminder worker.
- **`schema.sql`**: Complete normalized DDL with 19 tables, foreign keys, indexes, and constraints.
- **`requirements.txt`**: Python dependencies.

---

## 2. Local Setup & Running Instructions

### Step 1: Create Virtual Environment
```bash
cd backend_flask
python3 -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Step 2: Configure MySQL Database
1. Start your local MySQL service:
   ```bash
   mysql -u root -p
   ```
2. Import the database schema:
   ```bash
   mysql -u root -p < schema.sql
   ```
3. Set environment variables in `.env`:
   ```env
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_DB=studymate_db
   VAPID_PRIVATE_KEY=your_vapid_private_key
   VAPID_PUBLIC_KEY=your_vapid_public_key
   VAPID_CLAIMS_EMAIL=mailto:admin@studymate.app
   ```

### Step 3: Run the Flask API Server
```bash
python app.py
```
The API server will run at `http://localhost:5000`.

---

## 3. Web Push VAPID Key Configuration

To generate Web Push keys for background device notifications:
```bash
pip install pywebpush
vapid --gen
```
Copy the generated `Private Key` and `Public Key` into your `.env` configuration.

---

## 4. HTTPS Deployment Instructions (Production)

Modern browsers require HTTPS for Service Workers and the Web Push API.

1. **WSGI Server**: Run via Gunicorn:
   ```bash
   gunicorn -w 4 -b 127.0.0.1:5000 app:app
   ```
2. **Nginx Reverse Proxy**:
   ```nginx
   server {
       server_name studymate.yourdomain.com;

       location /api/ {
           proxy_pass http://127.0.0.1:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
3. **SSL Certificate (Let's Encrypt)**:
   ```bash
   sudo certbot --nginx -d studymate.yourdomain.com
   ```

---

## 5. Sample Test Accounts
- **Demo Account**:
  - Email: `saranya@example.com`
  - Password: `study123`
- Or use the registration form to create any unique test student account.
