-- ==============================================================================
-- STUDYMATE – SMART STUDY PLANNER & ACADEMIC PRODUCTIVITY SYSTEM
-- MySQL Database Schema (Fully Normalized DDL with Foreign Keys & Indexes)
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS studymate_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE studymate_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. User Preferences Table (Themes, Daily Goals, Reminder intervals)
CREATE TABLE IF NOT EXISTS user_preferences (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    theme VARCHAR(50) DEFAULT 'light-purple',
    daily_goal_hours DECIMAL(4,2) DEFAULT 3.00,
    notification_sound BOOLEAN DEFAULT TRUE,
    auto_snooze_minutes INT DEFAULT 15,
    email_reminders_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20),
    color VARCHAR(20) DEFAULT '#8066C5',
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_subject_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Learning Goals Table ("My Learning Goals" module)
CREATE TABLE IF NOT EXISTS learning_goals (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    subject_name VARCHAR(120) NOT NULL,
    syllabus_details TEXT,
    total_chapters INT NOT NULL DEFAULT 1,
    completed_chapters INT NOT NULL DEFAULT 0,
    target_date DATE NOT NULL,
    start_date DATE NOT NULL,
    planned_duration_months DECIMAL(4,1) DEFAULT 2.0,
    daily_study_hours DECIMAL(4,2) DEFAULT 2.0,
    difficulty ENUM('Beginner', 'Intermediate', 'Advanced', 'Hard') DEFAULT 'Intermediate',
    suggested_daily_pace VARCHAR(150),
    suggested_weekly_pace VARCHAR(150),
    status ENUM('On-Track', 'Behind Schedule', 'Ahead of Schedule', 'Completed') DEFAULT 'On-Track',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_goal_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Chapters Table
CREATE TABLE IF NOT EXISTS chapters (
    id VARCHAR(36) PRIMARY KEY,
    goal_id VARCHAR(36) NOT NULL,
    chapter_number INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
    estimated_hours DECIMAL(4,2) DEFAULT 3.0,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (goal_id) REFERENCES learning_goals(id) ON DELETE CASCADE,
    INDEX idx_chapter_goal (goal_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    subject_id VARCHAR(36),
    subject_name VARCHAR(120) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    duration_minutes INT NOT NULL DEFAULT 60,
    priority ENUM('High', 'Medium', 'Low') DEFAULT 'Medium',
    category ENUM('Study', 'Assignment', 'Project', 'Revision', 'Exam Prep', 'Personal') DEFAULT 'Study',
    status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
    reminder_enabled BOOLEAN DEFAULT TRUE,
    reminder_offset_minutes INT DEFAULT 15,
    repeat_minutes INT DEFAULT 0,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_task_user_date (user_id, date),
    INDEX idx_task_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Exams Table
CREATE TABLE IF NOT EXISTS exams (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    subject_name VARCHAR(120) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    description TEXT,
    priority ENUM('High', 'Medium', 'Low') DEFAULT 'High',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_exam_user_date (user_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Deadlines Table (Assignments, Project Submissions, Lab Records)
CREATE TABLE IF NOT EXISTS deadlines (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    category ENUM('Assignment', 'Project Submission', 'Lab Record', 'Presentation', 'Other') DEFAULT 'Assignment',
    subject_name VARCHAR(120) NOT NULL,
    deadline_date DATE NOT NULL,
    deadline_time TIME NOT NULL,
    status ENUM('Pending', 'Submitted', 'Overdue') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_deadline_user (user_id, deadline_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Study Sessions Table (Pomodoro & Clocked Study Time)
CREATE TABLE IF NOT EXISTS study_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    task_id VARCHAR(36),
    subject_name VARCHAR(120) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    duration_minutes INT NOT NULL,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Daily Progress Table
CREATE TABLE IF NOT EXISTS daily_progress (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    study_hours DECIMAL(4,2) DEFAULT 0.00,
    tasks_scheduled INT DEFAULT 0,
    tasks_completed INT DEFAULT 0,
    goal_achieved BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_date (user_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Study Feedback Table
CREATE TABLE IF NOT EXISTS study_feedback (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    focus_level ENUM('Low', 'Medium', 'High', 'Flow State') DEFAULT 'Medium',
    feedback_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Consistency Records Table (Heatmap Activity)
CREATE TABLE IF NOT EXISTS consistency_records (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    status ENUM('green', 'light-green', 'red', 'grey') DEFAULT 'grey',
    scheduled_hours DECIMAL(4,2) DEFAULT 0.00,
    completed_hours DECIMAL(4,2) DEFAULT 0.00,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_consistency_user_date (user_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Revisions Table
CREATE TABLE IF NOT EXISTS revisions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    subject_name VARCHAR(120) NOT NULL,
    topic VARCHAR(200) NOT NULL,
    scheduled_date DATE NOT NULL,
    repetition_cycle INT DEFAULT 1, -- Spaced repetition (1, 3, 7, 14, 30 days)
    status ENUM('Pending', 'Completed') DEFAULT 'Pending',
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. Notes Table
CREATE TABLE IF NOT EXISTS notes (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    subject_name VARCHAR(120) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content MEDIUMTEXT,
    tags VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 15. Documents Table ("My Documents" for Notes, PDFs, Certificates)
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    category ENUM('Notes', 'PDFs', 'Certificates', 'Projects', 'Other Documents') NOT NULL,
    subject_name VARCHAR(120) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_doc_user_cat (user_id, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 16. Achievements Table (Milestones)
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    icon VARCHAR(100),
    xp_award INT DEFAULT 50,
    badge_key VARCHAR(50) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 17. User Rewards Table (XP, Streak, Earned Badges)
CREATE TABLE IF NOT EXISTS user_rewards (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    achievement_id VARCHAR(36) NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_reward (user_id, achievement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 18. Notification Subscriptions Table (Web Push VAPID endpoints)
CREATE TABLE IF NOT EXISTS notification_subscriptions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    endpoint TEXT NOT NULL,
    p256dh VARCHAR(255) NOT NULL,
    auth VARCHAR(255) NOT NULL,
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 19. Notifications Table (Active & Historic Device Reminders)
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('task_start', 'task_deadline', 'task_overdue', 'daily_goal', 'revision', 'exam_countdown', 'assignment_deadline') NOT NULL,
    task_id VARCHAR(36),
    exam_id VARCHAR(36),
    scheduled_time TIMESTAMP NOT NULL,
    status ENUM('unread', 'read', 'snoozed', 'dismissed', 'completed') DEFAULT 'unread',
    snoozed_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user_time (user_id, scheduled_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
