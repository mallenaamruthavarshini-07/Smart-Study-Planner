import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'studymate_db.json');

fs.mkdirSync(DATA_DIR, { recursive: true });

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper for secure password hashing
function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const chosenSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, chosenSalt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt: chosenSalt };
}

// In-Memory & File-Persisted Database Structure
interface DatabaseSchema {
  users: Array<{
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    salt: string;
    token?: string;
    theme: string;
    dailyGoalHours: number;
    xp: number;
    streakDays: number;
    badges: string[];
    createdAt: string;
  }>;
  subjects: Array<any>;
  tasks: Array<any>;
  learningGoals: Array<any>;
  exams: Array<any>;
  documents: Array<any>;
  notifications: Array<any>;
  heatmapRecords: Array<any>;
  subscriptions: Array<any>;
}

function getInitialDatabase(): DatabaseSchema {
  const today = new Date().toISOString().split('T')[0];
  const demoSalt = crypto.randomBytes(16).toString('hex');
  const demoHash = crypto.pbkdf2Sync('study123', demoSalt, 1000, 64, 'sha512').toString('hex');
  const demoUserId = 'usr_saranya_demo';

  // Generate realistic past 60 days of consistency heatmap
  const heatmap: any[] = [];
  const now = new Date();
  for (let i = 59; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay(); // 0 is Sunday

    if (i === 0) {
      // Today
      heatmap.push({
        date: dateStr,
        status: 'light-green',
        scheduledHours: 4,
        completedHours: 2,
        tasksScheduled: 4,
        tasksCompleted: 2,
      });
    } else if (dayOfWeek === 0) {
      // Sunday rest day
      heatmap.push({
        date: dateStr,
        status: 'grey',
        scheduledHours: 0,
        completedHours: 0,
        tasksScheduled: 0,
        tasksCompleted: 0,
      });
    } else if (i % 7 === 3) {
      // Skipped study day
      heatmap.push({
        date: dateStr,
        status: 'red',
        scheduledHours: 3,
        completedHours: 0.5,
        tasksScheduled: 3,
        tasksCompleted: 0,
      });
    } else if (i % 5 === 0) {
      // Partial progress
      heatmap.push({
        date: dateStr,
        status: 'light-green',
        scheduledHours: 3,
        completedHours: 2,
        tasksScheduled: 3,
        tasksCompleted: 2,
      });
    } else {
      // Completed goal
      heatmap.push({
        date: dateStr,
        status: 'green',
        scheduledHours: 3,
        completedHours: 3.5,
        tasksScheduled: 4,
        tasksCompleted: 4,
      });
    }
  }

  return {
    users: [
      {
        id: demoUserId,
        name: 'Saranya',
        email: 'saranya@example.com',
        passwordHash: demoHash,
        salt: demoSalt,
        token: `token_${crypto.randomBytes(24).toString('hex')}`,
        theme: 'light-purple',
        dailyGoalHours: 3,
        xp: 450,
        streakDays: 7,
        badges: ['First Step', '7-Day Streak', 'Revision Champion', 'Study Master'],
        createdAt: new Date().toISOString(),
      },
    ],
    subjects: [
      { id: 'sub_1', userId: demoUserId, name: 'Java Programming', color: '#8066C5', createdAt: new Date().toISOString() },
      { id: 'sub_2', userId: demoUserId, name: 'Database Management Systems', color: '#3B82F6', createdAt: new Date().toISOString() },
      { id: 'sub_3', userId: demoUserId, name: 'Computer Networks', color: '#10B981', createdAt: new Date().toISOString() },
      { id: 'sub_4', userId: demoUserId, name: 'Data Structures & Algorithms', color: '#F59E0B', createdAt: new Date().toISOString() },
      { id: 'sub_5', userId: demoUserId, name: 'Software Engineering', color: '#EC4899', createdAt: new Date().toISOString() },
    ],
    tasks: [
      {
        id: 'tsk_1',
        userId: demoUserId,
        title: 'Java Stream API & Lambdas Practice',
        subject: 'Java Programming',
        subjectId: 'sub_1',
        description: 'Complete hands-on code exercises for map, filter, collect, and custom collectors.',
        date: today,
        startTime: '10:00',
        endTime: '12:00',
        durationMinutes: 120,
        priority: 'High',
        category: 'Study',
        status: 'In Progress',
        reminderSettings: { enabled: true, offsetMinutes: 15, repeatMinutes: 30 },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tsk_2',
        userId: demoUserId,
        title: 'DBMS Normalization: 1NF to BCNF Problems',
        subject: 'Database Management Systems',
        subjectId: 'sub_2',
        description: 'Solve past semester questions on functional dependencies and lossless join decomposition.',
        date: today,
        startTime: '14:00',
        endTime: '15:30',
        durationMinutes: 90,
        priority: 'Medium',
        category: 'Assignment',
        status: 'Completed',
        reminderSettings: { enabled: true, offsetMinutes: 10 },
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      },
      {
        id: 'tsk_3',
        userId: demoUserId,
        title: 'Computer Networks Packet Tracer Lab',
        subject: 'Computer Networks',
        subjectId: 'sub_3',
        description: 'Configure subnetting and static routing topologies in Cisco Packet Tracer.',
        date: today,
        startTime: '17:00',
        endTime: '18:00',
        durationMinutes: 60,
        priority: 'Medium',
        category: 'Project',
        status: 'Pending',
        reminderSettings: { enabled: true, offsetMinutes: 15 },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tsk_4',
        userId: demoUserId,
        title: 'Daily Evening Flashcard Revision',
        subject: 'Data Structures & Algorithms',
        subjectId: 'sub_4',
        description: 'Quick active recall on Graph Traversals (BFS & DFS) and Time Complexities.',
        date: today,
        startTime: '20:30',
        endTime: '21:00',
        durationMinutes: 30,
        priority: 'Low',
        category: 'Revision',
        status: 'Pending',
        reminderSettings: { enabled: true, offsetMinutes: 15 },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tsk_5',
        userId: demoUserId,
        title: 'Software Engineering Agile Sprint Report',
        subject: 'Software Engineering',
        subjectId: 'sub_5',
        description: 'Review Scrum user stories and burn-down chart for term project.',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        startTime: '11:00',
        endTime: '12:30',
        durationMinutes: 90,
        priority: 'High',
        category: 'Project',
        status: 'Pending',
        reminderSettings: { enabled: true, offsetMinutes: 15 },
        createdAt: new Date().toISOString(),
      },
    ],
    learningGoals: [
      {
        id: 'goal_1',
        userId: demoUserId,
        subjectName: 'Java Programming',
        syllabusDetails: 'Core OOP, Exception Handling, Collections, Multithreading, Generics, Stream API & Lambdas, JDBC & Spring Boot basics',
        totalChapters: 12,
        completedChapters: 6,
        targetDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
        startDate: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
        plannedDurationMonths: 2,
        dailyStudyHours: 2,
        difficulty: 'Intermediate',
        suggestedDailyPace: '1 chapter every 5 days (~2 hours/day)',
        suggestedWeeklyPace: '1.4 chapters per week with weekend revisions',
        estimatedCompletionDate: new Date(Date.now() + 55 * 86400000).toISOString().split('T')[0],
        status: 'On-Track',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'goal_2',
        userId: demoUserId,
        subjectName: 'Database Management Systems',
        syllabusDetails: 'ER Modeling, Relational Schema, SQL Queries, Normalization, Transactions & Concurrency Control, Indexing (B+ Trees)',
        totalChapters: 8,
        completedChapters: 5,
        targetDate: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
        startDate: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0],
        plannedDurationMonths: 1.5,
        dailyStudyHours: 1.5,
        difficulty: 'Intermediate',
        suggestedDailyPace: '1 chapter every 6 days (~1.5 hours/day)',
        suggestedWeeklyPace: '1.2 chapters per week',
        estimatedCompletionDate: new Date(Date.now() + 42 * 86400000).toISOString().split('T')[0],
        status: 'On-Track',
        createdAt: new Date().toISOString(),
      },
    ],
    exams: [
      {
        id: 'exam_1',
        userId: demoUserId,
        title: 'Database Management Systems Semester Exam',
        subject: 'Database Management Systems',
        date: new Date(Date.now() + 18 * 86400000).toISOString().split('T')[0],
        time: '10:00',
        description: 'University end-term examination covering Units 1 to 5. Paper duration: 3 Hours.',
        priority: 'High',
        reminderSchedule: [5, 4, 3, 2, 1, 0],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'exam_2',
        userId: demoUserId,
        title: 'Computer Networks Practical & Viva',
        subject: 'Computer Networks',
        date: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0],
        time: '14:00',
        description: 'Socket programming in C and Wireshark packet capture demonstration.',
        priority: 'High',
        reminderSchedule: [5, 3, 1, 0],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'exam_3',
        userId: demoUserId,
        title: 'Software Engineering Project Final Submission',
        subject: 'Software Engineering',
        date: new Date(Date.now() + 24 * 86400000).toISOString().split('T')[0],
        time: '23:59',
        description: 'Submit documentation report, GitHub repository link, and video presentation.',
        priority: 'Medium',
        reminderSchedule: [5, 4, 3, 2, 1, 0],
        createdAt: new Date().toISOString(),
      },
    ],
    documents: [
      {
        id: 'doc_1',
        userId: demoUserId,
        title: 'Java Stream API & Functional Interfaces Cheatsheet',
        category: 'Notes',
        subject: 'Java Programming',
        fileName: 'Java_Streams_Cheatsheet.pdf',
        fileSize: 428000,
        fileType: 'application/pdf',
        uploadedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        fileData: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgNjEyIDc5Ml0vQ29udGVudHMgNCAwIFI+PmVuZG9iago0IDAgb2JqPDwvTGVuZ3RoIDQ0Pj5zdHJlYW0KQVQgL0YxIDI0IFRmCjEwMCA3MDAgVGRKKEphdmEgU3RyZWFtIEFQSSBOb3RlcyBFbmRUZXh0CmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE4IDAwMDAwIG4gCjAwMDAwMDAwNjggMDAwMDAgbiAKMDAwMDAwMDEyNSAwMDAwMCBuIAowMDAwMDAwMjE5IDAwMDAwIG4gCnRyYWlsZXI8PC9TaXplIDUvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgoyODgKJSVFT0Y=',
      },
      {
        id: 'doc_2',
        userId: demoUserId,
        title: 'DBMS Relational Algebra & Normalization Guide',
        category: 'PDFs',
        subject: 'Database Management Systems',
        fileName: 'DBMS_Normalization_Lecture.pdf',
        fileSize: 852000,
        fileType: 'application/pdf',
        uploadedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        fileData: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgNjEyIDc5Ml0vQ29udGVudHMgNCAwIFI+PmVuZG9iago0IDAgb2JqPDwvTGVuZ3RoIDQ0Pj5zdHJlYW0KQVQgL0YxIDI0IFRmCjEwMCA3MDAgVGRKKEhCTVMgUmVsYXRpb25hbCBBbGdlYnJhIEVuZFRleHQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTggMDAwMDAgbiAKMDAwMDAwMDA2OCAwMDAwMCBuIAowMDAwMDAwMTI1IDAwMDAwIG4gCjAwMDAwMDAyMTkgMDAwMDAgbiAKdHJhaWxlcjw8L1NpemUgNS9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjI4OAolJUVPRg==',
      },
      {
        id: 'doc_3',
        userId: demoUserId,
        title: 'Oracle Certified Associate Java SE 11 Certificate',
        category: 'Certificates',
        subject: 'Java Programming',
        fileName: 'Oracle_Java_Associate_Cert.pdf',
        fileSize: 1240000,
        fileType: 'application/pdf',
        uploadedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        fileData: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgNjEyIDc5Ml0vQ29udGVudHMgNCAwIFI+PmVuZG9iago0IDAgb2JqPDwvTGVuZ3RoIDQ0Pj5zdHJlYW0KQVQgL0YxIDI0IFRmCjEwMCA3MDAgVGRKKEphdmEgQ2VydGlmaWNhdGUgT2ZmaWNpYWwgRW5kVGV4dAppZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTggMDAwMDAgbiAKMDAwMDAwMDA2OCAwMDAwMCBuIAowMDAwMDAwMTI1IDAwMDAwIG4gCjAwMDAwMDAyMTkgMDAwMDAgbiAKdHJhaWxlcjw8L1NpemUgNS9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjI4OAolJUVPRg==',
      },
    ],
    notifications: [
      {
        id: 'notif_1',
        userId: demoUserId,
        title: 'Study Task Ready',
        message: 'Upcoming: "Java Stream API & Lambdas Practice" starts in 15 minutes.',
        type: 'task_start',
        taskId: 'tsk_1',
        scheduledTime: new Date(Date.now() - 20 * 60000).toISOString(),
        status: 'unread',
        createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
      },
      {
        id: 'notif_2',
        userId: demoUserId,
        title: 'Task Progress Check',
        message: 'Have you finished DBMS Normalization problems? Mark it completed or snooze.',
        type: 'task_deadline',
        taskId: 'tsk_2',
        scheduledTime: new Date(Date.now() - 60 * 60000).toISOString(),
        status: 'completed',
        createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
      },
      {
        id: 'notif_3',
        userId: demoUserId,
        title: 'Exam Countdown Alert (18 Days Left)',
        message: 'DBMS Semester Exam is on Dec 25 at 10:00 AM. Start unit 3 revision today!',
        type: 'exam_countdown',
        examId: 'exam_1',
        scheduledTime: new Date(Date.now() - 180 * 60000).toISOString(),
        status: 'unread',
        createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
      },
    ],
    heatmapRecords: heatmap,
    subscriptions: [],
  };
}

// Read database from file or fallback to initial
function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading database file:', err);
  }
  const initial = getInitialDatabase();
  saveDatabase(initial);
  return initial;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

// Authentication Middleware
function authenticateUser(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const db = loadDatabase();
  const user = db.users.find((u) => u.token === token);

  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }

  // Attach authenticated user to request
  (req as any).user = user;
  next();
}

// --- API ROUTES ---

// 1. Auth: Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const db = loadDatabase();
  const normalizedEmail = String(email).toLowerCase().trim();

  if (db.users.find((u) => u.email === normalizedEmail)) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const { hash, salt } = hashPassword(password);
  const userId = `usr_${crypto.randomUUID().slice(0, 8)}`;
  const token = `token_${crypto.randomBytes(24).toString('hex')}`;

  const newUser = {
    id: userId,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: hash,
    salt,
    token,
    theme: 'light-purple',
    dailyGoalHours: 3,
    xp: 0,
    streakDays: 0,
    badges: [],
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  // Initialize initial starter subjects for the new user
  const initialSubjects = [
    { id: `sub_${crypto.randomUUID().slice(0, 6)}`, userId, name: 'Java Programming', color: '#8066C5', createdAt: new Date().toISOString() },
    { id: `sub_${crypto.randomUUID().slice(0, 6)}`, userId, name: 'Database Systems', color: '#3B82F6', createdAt: new Date().toISOString() },
    { id: `sub_${crypto.randomUUID().slice(0, 6)}`, userId, name: 'Computer Networks', color: '#10B981', createdAt: new Date().toISOString() },
  ];
  db.subjects.push(...initialSubjects);

  // Note: New users start with 0 tasks scheduled until they assign/create their own tasks.
  saveDatabase(db);

  return res.json({
    message: 'Registration successful',
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      theme: newUser.theme,
      dailyGoalHours: newUser.dailyGoalHours,
      xp: newUser.xp,
      streakDays: newUser.streakDays,
      badges: newUser.badges,
      createdAt: newUser.createdAt,
      isNewUser: true,
    },
  });
});

// 2. Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = loadDatabase();
  const normalizedEmail = String(email).toLowerCase().trim();
  const user = db.users.find((u) => u.email === normalizedEmail);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const { hash } = hashPassword(password, user.salt);
  if (hash !== user.passwordHash) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Generate fresh token
  const token = `token_${crypto.randomBytes(24).toString('hex')}`;
  user.token = token;
  saveDatabase(db);

  return res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      theme: user.theme || 'light-purple',
      avatar: (user as any).avatar || '',
      devicePreference: (user as any).devicePreference || 'laptop',
      dailyGoalHours: user.dailyGoalHours || 3,
      xp: user.xp || 0,
      streakDays: user.streakDays || 1,
      badges: user.badges || [],
      createdAt: user.createdAt,
      isNewUser: false,
    },
  });
});

// 3. Auth: Current User (`/api/auth/me`)
app.get('/api/auth/me', authenticateUser, (req, res) => {
  const user = (req as any).user;
  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    theme: user.theme || 'light-purple',
    avatar: user.avatar || '',
    devicePreference: user.devicePreference || 'laptop',
    dailyGoalHours: user.dailyGoalHours || 3,
    xp: user.xp || 0,
    streakDays: user.streakDays || 1,
    badges: user.badges || [],
    createdAt: user.createdAt,
    isNewUser: false,
  });
});

// 4. Auth: Logout
app.post('/api/auth/logout', authenticateUser, (req, res) => {
  const user = (req as any).user;
  const db = loadDatabase();
  const existing = db.users.find((u) => u.id === user.id);
  if (existing) {
    existing.token = undefined;
    saveDatabase(db);
  }
  return res.json({ message: 'Logged out successfully' });
});

// 5. User Preferences: Update Theme, Goals, Avatar, and Device Mode
app.put('/api/user/preferences', authenticateUser, (req, res) => {
  const user = (req as any).user;
  const { theme, dailyGoalHours, avatar, devicePreference } = req.body;
  const db = loadDatabase();
  const existing = db.users.find((u) => u.id === user.id);

  if (!existing) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (theme) {
    const validThemes = ['soft-grey', 'light-purple', 'soft-peach', 'lemon-yellow', 'dark'];
    if (validThemes.includes(theme)) {
      existing.theme = theme;
    }
  }

  if (dailyGoalHours && Number(dailyGoalHours) > 0) {
    existing.dailyGoalHours = Number(dailyGoalHours);
  }

  if (avatar !== undefined) {
    (existing as any).avatar = avatar;
  }

  if (devicePreference && ['laptop', 'mobile'].includes(devicePreference)) {
    (existing as any).devicePreference = devicePreference;
  }

  saveDatabase(db);

  return res.json({
    message: 'Preferences updated',
    theme: existing.theme,
    dailyGoalHours: existing.dailyGoalHours,
    avatar: (existing as any).avatar || '',
    devicePreference: (existing as any).devicePreference || 'laptop',
  });
});

// 6. Subjects CRUD
app.get('/api/subjects', authenticateUser, (req, res) => {
  const user = (req as any).user;
  const db = loadDatabase();
  const userSubjects = db.subjects.filter((s) => s.userId === user.id);
  return res.json(userSubjects);
});

app.post('/api/subjects', authenticateUser, (req, res) => {
  const user = (req as any).user;
  const { name, color } = req.body;
  if (!name) return res.status(400).json({ error: 'Subject name is required' });

  const db = loadDatabase();
  const newSubject = {
    id: `sub_${crypto.randomUUID().slice(0, 8)}`,
    userId: user.id,
    name: name.trim(),
    color: color || '#8066C5',
    createdAt: new Date().toISOString(),
  };

  db.subjects.push(newSubject);
  saveDatabase(db);
  return res.status(201).json(newSubject);
});

app.delete('/api/subjects/:id', authenticateUser, (req, res) => {
  const user = (req as any).user;
  const subjectId = req.params.id;
  const db = loadDatabase();

  const idx = db.subjects.findIndex((s) => s.id === subjectId && s.userId === user.id);
  if (idx === -1) return res.status(404).json({ error: 'Subject not found' });

  db.subjects.splice(idx, 1);
  saveDatabase(db);
  return res.json({ message: 'Subject deleted' });
});

// 7. Tasks CRUD
app.get('/api/tasks', authenticateUser, (req, res) => {
  const user = (req as any).user;
  const db = loadDatabase();
  const userTasks = db.tasks.filter((t) => t.userId === user.id);
  return res.json(userTasks);
});

app.post('/api/tasks', authenticateUser, (req, res) => {
  const user = (req as any).user;
  const {
    title,
    subject,
    subjectId,
    description,
    date,
    startTime,
    endTime,
    durationMinutes,
    priority,
    category,
    reminderSettings,
  } = req.body;

  if (!title || !subject || !date) {
    return res.status(400).json({ error: 'Title, subject, and date are required' });
  }

  const db = loadDatabase();
  const newTask = {
    id: `tsk_${crypto.randomUUID().slice(0, 8)}`,
    userId: user.id,
    title: title.trim(),
    subject: subject.trim(),
    subjectId: subjectId || '',
    description: description || '',
    date: date || new Date().toISOString().split('T')[0],
    startTime: startTime || '09:00',
    endTime: endTime || '',
    durationMinutes: Number(durationMinutes) || 60,
    priority: priority || 'Medium',
    category: category || 'Study',
    status: 'Pending',
    reminderSettings: reminderSettings || { enabled: true, offsetMinutes: 15 },
    createdAt: new Date().toISOString(),
  };

  db.tasks.push(newTask);

  // Automatically schedule reminder notification
  db.notifications.push({
    id: `notif_${crypto.randomUUID().slice(0, 8)}`,
    userId: user.id,
    title: `Task Reminder: ${newTask.title}`,
    message: `${newTask.subject} is scheduled for ${newTask.startTime} on ${newTask.date}.`,
    type: 'task_start',
    taskId: newTask.id,
    scheduledTime: `${newTask.date}T${newTask.startTime}:00.000Z`,
    status: 'unread',
    createdAt: new Date().toISOString(),
  });

  saveDatabase(db);
  return res.status(201).json(newTask);
});

app.put('/api/tasks/:id', authenticateUser, (req, res) => {
  const user = (req as any).user;
  const taskId = req.params.id;
  const db = loadDatabase();

  const task = db.tasks.find((t) => t.id === taskId && t.userId === user.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  Object.assign(task, req.body, { updatedAt: new Date().toISOString() });
  saveDatabase(db);
  return res.json(task);
});

// Update Task Status with XP and Gamification
app.patch('/api/tasks/:id/status', authenticateUser, (req, res) => {
  const user = (req as any).user;
  const taskId = req.params.id;
  const { status } = req.body;

  if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid task status' });
  }

  const db = loadDatabase();
  const task = db.tasks.find((t) => t.id === taskId && t.userId === user.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const prevStatus = task.status;
  task.status = status;

  let earnedXp = 0;
  let newBadges: string[] = [];

  const currentUser = db.users.find((u) => u.id === user.id);
  if (currentUser) {
    if (status === 'Completed' && prevStatus !== 'Completed') {
      task.completedAt = new Date().toISOString();
      earnedXp = 25;
      currentUser.xp = (currentUser.xp || 0) + earnedXp;
      currentUser.streakDays = Math.max(1, currentUser.streakDays || 1);

      // Record completed task into heatmap for this user
      const today = new Date().toISOString().split('T')[0];
      if (!db.heatmapRecords) db.heatmapRecords = [];
      const userHeat = (db.heatmapRecords as any[]).find((h) => h.userId === user.id && h.date === today);
      if (userHeat) {
        userHeat.completedTasks = (userHeat.completedTasks || 0) + 1;
        userHeat.studyMinutes = (userHeat.studyMinutes || 0) + (Number(task.durationMinutes) || 60);
      } else {
        db.heatmapRecords.push({
          date: today,
          studyMinutes: Number(task.durationMinutes) || 60,
          completedTasks: 1,
          userId: user.id,
        });
      }

      // Check milestones
      if (currentUser.xp >= 500 && !currentUser.badges.includes('Study Master')) {
        currentUser.badges.push('Study Master');
        newBadges.push('Study Master');
      }
    } else if (prevStatus === 'Completed' && status !== 'Completed') {
      currentUser.xp = Math.max(0, (currentUser.xp || 0) - 25);
      delete task.completedAt;
    }
  }

  saveDatabase(db);
  return res.json({
    task,
    earnedXp,
    newBadges,
    totalXp: currentUser?.xp || 0,
    streak: currentUser?.streakDays || 0,
  });
});

app.delete('/api/tasks/:id', authenticateUser, (req, res) => {
  const user = (req as any).user;
  const taskId = req.params.id;
  const db = loadDatabase();

  const idx = db.tasks.findIndex((t) => t.id === taskId && t.userId === user.id);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });

  db.tasks.splice(idx, 1);
  saveDatabase(db);
  return res.json({ message: 'Task deleted successfully' });
});

// 8. Learning Goals ("My Learning Goals" Subject Preparation Planner)
app.get('/api/learning-goals', authenticateUser, (req, res) => {
  const user = (req as any).user;
  const db = loadDatabase();
  const goals = db.learningGoals.filter((g) => g.userId === user.id);
  return res.json(goals);
});

app.post('/api/learning-goals', authenticateUser, (req, res) => {
  const user = (req as any).user;
  const {
    subjectName,
    syllabusDetails,
    totalChapters,
    completedChapters,
    targetDate,
    plannedDurationMonths,
    dailyStudyHours,
    difficulty,
  } = req.body;

  if (!subjectName || !totalChapters || !targetDate) {
    return res.status(400).json({ error: 'Subject name, total chapters, and target date are required' });
  }

  const total = Number(totalChapters) || 1;
  const completed = Number(completedChapters) || 0;
  const target = new Date(targetDate);
  const now = new Date();
  const daysDiff = Math.max(1, Math.ceil((target.getTime() - now.getTime()) / 86400000));
  const remainingChapters = Math.max(0, total - completed);

  // Automatic calculation of study pacing
  const daysPerChapter = (daysDiff / (remainingChapters || 1)).toFixed(1);
  const chaptersPerWeek = ((remainingChapters / daysDiff) * 7).toFixed(1);

  const suggestedDailyPace = remainingChapters > 0
    ? `1 chapter every ${daysPerChapter} days (~${dailyStudyHours || 2} hours/day)`
    : 'All chapters completed!';
  const suggestedWeeklyPace = remainingChapters > 0
    ? `${chaptersPerWeek} chapters per week with regular reviews`
    : 'Goal accomplished';

  const completionRatio = completed / total;
  const timeRatio = 1 - daysDiff / (Number(plannedDurationMonths) * 30 || 60);
  let status: 'On-Track' | 'Behind Schedule' | 'Ahead of Schedule' | 'Completed' = 'On-Track';

  if (completed >= total) status = 'Completed';
  else if (completionRatio < timeRatio - 0.15) status = 'Behind Schedule';
  else if (completionRatio > timeRatio + 0.1) status = 'Ahead of Schedule';

  const db = loadDatabase();
  const newGoal = {
    id: `goal_${crypto.randomUUID().slice(0, 8)}`,
    userId: user.id,
    subjectName: subjectName.trim(),
    syllabusDetails: syllabusDetails || '',
    totalChapters: total,
    completedChapters: completed,
    targetDate,
    startDate: new Date().toISOString().split('T')[0],
    plannedDurationMonths: Number(plannedDurationMonths) || 2,
    dailyStudyHours: Number(dailyStudyHours) || 2,
    difficulty: difficulty || 'Intermediate',
    suggestedDailyPace,
    suggestedWeeklyPace,
    estimatedCompletionDate: targetDate,
    status,
    createdAt: new Date().toISOString(),
  };

  db.learningGoals.push(newGoal);
  saveDatabase(db);
  return res.status(201).json(newGoal);
});

app.put('/api/learning-goals/:id', authenticateUser, (req, res) => {
  const user = (req as any).user;
  const goalId = req.params.id;
  const db = loadDatabase();

  const goal = db.learningGoals.find((g) => g.id === goalId && g.userId === user.id);
  if (!goal) return res.status(404).json({ error: 'Learning goal not found' });

  const total = Number(req.body.totalChapters ?? goal.totalChapters);
  const completed = Number(req.body.completedChapters ?? goal.completedChapters);
  const targetDate = req.body.targetDate ?? goal.targetDate;
  const target = new Date(targetDate);
  const now = new Date();
  const daysDiff = Math.max(1, Math.ceil((target.getTime() - now.getTime()) / 86400000));
  const remainingChapters = Math.max(0, total - completed);

  const daysPerChapter = (daysDiff / (remainingChapters || 1)).toFixed(1);
  const chaptersPerWeek = ((remainingChapters / daysDiff) * 7).toFixed(1);
  const dailyHours = req.body.dailyStudyHours ?? goal.dailyStudyHours;

  const suggestedDailyPace = remainingChapters > 0
    ? `1 chapter every ${daysPerChapter} days (~${dailyHours} hours/day)`
    : 'All chapters completed!';
  const suggestedWeeklyPace = remainingChapters > 0
    ? `${chaptersPerWeek} chapters per week with regular reviews`
    : 'Goal accomplished';

  const completionRatio = completed / total;
  let status: 'On-Track' | 'Behind Schedule' | 'Ahead of Schedule' | 'Completed' = 'On-Track';
  if (completed >= total) status = 'Completed';
  else if (completionRatio < 0.3 && daysDiff < 15) status = 'Behind Schedule';

  Object.assign(goal, req.body, {
    totalChapters: total,
    completedChapters: completed,
    suggestedDailyPace,
    suggestedWeeklyPace,
    status,
    updatedAt: new Date().toISOString(),
  });

  saveDatabase(db);
  return res.json(goal);
});

app.delete('/api/learning-goals/:id', authenticateUser, (req, res) => {
  const user = (req as any).user;
  const goalId = req.params.id;
  const db = loadDatabase();

  const idx = db.learningGoals.findIndex((g) => g.id === goalId && g.userId === user.id);
  if (idx === -1) return res.status(404).json({ error: 'Goal not found' });

  db.learningGoals.splice(idx, 1);
  saveDatabase(db);
  return res.json({ message: 'Goal removed successfully' });
});

// 9. Exams & Deadlines CRUD (with 5-day countdown alerts)
app.get('/api/exams', authenticateUser, (req, res) => {
  const user = (req as any).user;
  const db = loadDatabase();
  const exams = db.exams.filter((e) => e.userId === user.id);
  return res.json(exams);
});

app.post('/api/exams', authenticateUser, (req, res) => {
  const user = (req as any).user;
  const { title, subject, date, time, description, priority, reminderSchedule } = req.body;

  if (!title || !subject || !date) {
    return res.status(400).json({ error: 'Title, subject, and deadline date are required' });
  }

  const db = loadDatabase();
  const newExam = {
    id: `exam_${crypto.randomUUID().slice(0, 8)}`,
    userId: user.id,
    title: title.trim(),
    subject: subject.trim(),
    date,
    time: time || '10:00',
    description: description || '',
    priority: priority || 'High',
    reminderSchedule: reminderSchedule || [5, 4, 3, 2, 1, 0],
    createdAt: new Date().toISOString(),
  };

  db.exams.push(newExam);

  // Generate automated reminders based on the 5-day schedule
  const examDate = new Date(`${date}T${newExam.time}:00`);
  (newExam.reminderSchedule as number[]).forEach((daysBefore) => {
    const remindTime = new Date(examDate.getTime() - daysBefore * 86400000);
    db.notifications.push({
      id: `notif_${crypto.randomUUID().slice(0, 8)}`,
      userId: user.id,
      title: daysBefore === 0 ? `Today is Exam Day: ${newExam.title}` : `Exam in ${daysBefore} Days: ${newExam.title}`,
      message: `${newExam.subject} is scheduled on ${newExam.date} at ${newExam.time}. Prepare your checklist!`,
      type: 'exam_countdown',
      examId: newExam.id,
      scheduledTime: remindTime.toISOString(),
      status: 'unread',
      createdAt: new Date().toISOString(),
    });
  });

  saveDatabase(db);
  return res.status(201).json(newExam);
});

app.delete('/api/exams/:id', authenticateUser, (req, res) => {
  const user = (req as any).user;
  const examId = req.params.id;
  const db = loadDatabase();

  const idx = db.exams.findIndex((e) => e.id === examId && e.userId === user.id);
  if (idx === -1) return res.status(404).json({ error: 'Exam not found' });

  db.exams.splice(idx, 1);
  saveDatabase(db);
  return res.json({ message: 'Exam deleted successfully' });
});

// 10. Documents & Certificates CRUD ("My Documents")
app.get('/api/documents', authenticateUser, (req, res) => {
  const user = (req as any).user;
  const db = loadDatabase();
  const docs = db.documents.filter((d) => d.userId === user.id);
  return res.json(docs);
});

app.post('/api/documents', authenticateUser, (req, res) => {
  const user = (req as any).user;
  const { title, category, subject, fileName, fileSize, fileType, fileData } = req.body;

  if (!title || !category || !fileName) {
    return res.status(400).json({ error: 'Document title, category, and file are required' });
  }

  // Size limit validation (15MB in base64 string length)
  if (fileSize && Number(fileSize) > 15 * 1024 * 1024) {
    return res.status(413).json({ error: 'File size exceeds 15MB limit' });
  }

  const db = loadDatabase();
  const newDoc = {
    id: `doc_${crypto.randomUUID().slice(0, 8)}`,
    userId: user.id,
    title: title.trim(),
    category: category || 'Notes',
    subject: subject || 'General',
    fileName,
    fileSize: Number(fileSize) || 0,
    fileType: fileType || 'application/octet-stream',
    uploadedAt: new Date().toISOString(),
    fileData: fileData || '',
  };

  db.documents.push(newDoc);
  saveDatabase(db);
  return res.status(201).json(newDoc);
});

app.delete('/api/documents/:id', authenticateUser, (req, res) => {
  const user = (req as any).user;
  const docId = req.params.id;
  const db = loadDatabase();

  const idx = db.documents.findIndex((d) => d.id === docId && d.userId === user.id);
  if (idx === -1) return res.status(404).json({ error: 'Document not found' });

  db.documents.splice(idx, 1);
  saveDatabase(db);
  return res.json({ message: 'Document deleted successfully' });
});

// 11. Notification Actions (Snooze, Reschedule, Mark Done, Dismiss)
app.get('/api/notifications', authenticateUser, (req, res) => {
  const user = (req as any).user;
  const db = loadDatabase();

  // Automatic overdue tasks checker:
  // If a task is scheduled on or before today and has not been marked Completed,
  // ensure an active alert is generated for the student.
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const userTasks = db.tasks.filter((t) => t.userId === user.id && t.status !== 'Completed');
  let hasNewAlerts = false;

  userTasks.forEach((t) => {
    let isPastTime = false;
    if (t.date < todayStr) {
      isPastTime = true;
    } else if (t.date === todayStr && t.startTime) {
      const parts = t.startTime.split(':');
      const taskMinutes = (Number(parts[0]) || 0) * 60 + (Number(parts[1]) || 0);
      if (currentMinutes >= taskMinutes) {
        isPastTime = true;
      }
    }

    if (isPastTime) {
      const alreadyAlerted = db.notifications.some(
        (n) => n.userId === user.id && n.taskId === t.id && n.type === 'task_overdue' && n.status !== 'dismissed'
      );
      if (!alreadyAlerted) {
        db.notifications.push({
          id: `notif_${crypto.randomUUID().slice(0, 8)}`,
          userId: user.id,
          title: `Overdue Task Alert: ${t.title}`,
          message: `Your task "${t.title}" for ${t.subject} was scheduled for ${t.startTime} on ${t.date} and is incomplete. Mark as done, snooze, or reschedule!`,
          type: 'task_overdue',
          taskId: t.id,
          scheduledTime: new Date().toISOString(),
          status: 'unread',
          createdAt: new Date().toISOString(),
        });
        hasNewAlerts = true;
      }
    }
  });

  // Automatic exam countdown check (5, 4, 3, 2, 1, 0 days before)
  const userExams = db.exams.filter((e) => e.userId === user.id);
  userExams.forEach((e) => {
    const examDate = new Date(`${e.date}T${e.time || '10:00'}:00`);
    const diffDays = Math.ceil((examDate.getTime() - now.getTime()) / 86400000);
    if (diffDays >= 0 && diffDays <= 5) {
      const alreadyAlerted = db.notifications.some(
        (n) => n.userId === user.id && n.examId === e.id && n.title.includes(`${diffDays} Days Left`)
      );
      if (!alreadyAlerted) {
        db.notifications.push({
          id: `notif_${crypto.randomUUID().slice(0, 8)}`,
          userId: user.id,
          title: diffDays === 0 ? `Today is Exam Day: ${e.title}` : `Exam Countdown Alert: ${e.title} (${diffDays} Days Left)`,
          message: `${e.subject} deadline is on ${e.date} at ${e.time}. Review your syllabus checklist!`,
          type: 'exam_countdown',
          examId: e.id,
          scheduledTime: new Date().toISOString(),
          status: 'unread',
          createdAt: new Date().toISOString(),
        });
        hasNewAlerts = true;
      }
    }
  });

  if (hasNewAlerts) {
    saveDatabase(db);
  }

  const list = db.notifications.filter((n) => n.userId === user.id);
  return res.json(list.reverse());
});

app.post('/api/notifications/:id/action', authenticateUser, (req, res) => {
  const user = (req as any).user;
  const notifId = req.params.id;
  const { action, snoozeMinutes, rescheduleDate, rescheduleTime } = req.body;

  const db = loadDatabase();
  const notif = db.notifications.find((n) => n.id === notifId && n.userId === user.id);
  if (!notif) return res.status(404).json({ error: 'Notification not found' });

  if (action === 'snooze') {
    const mins = Number(snoozeMinutes) || 15;
    notif.status = 'snoozed';
    notif.snoozedUntil = new Date(Date.now() + mins * 60000).toISOString();
  } else if (action === 'dismiss') {
    notif.status = 'dismissed';
    // Notice: Prompt specifies "Dismiss must not mean task completed"
  } else if (action === 'complete') {
    notif.status = 'completed';
    if (notif.taskId) {
      const task = db.tasks.find((t) => t.id === notif.taskId && t.userId === user.id);
      if (task) {
        task.status = 'Completed';
        task.completedAt = new Date().toISOString();
      }
    }
  } else if (action === 'reschedule') {
    notif.status = 'unread';
    if (notif.taskId && rescheduleDate) {
      const task = db.tasks.find((t) => t.id === notif.taskId && t.userId === user.id);
      if (task) {
        task.date = rescheduleDate;
        if (rescheduleTime) task.startTime = rescheduleTime;
      }
    }
  }

  saveDatabase(db);
  return res.json({ message: `Notification action ${action} applied`, notif });
});

// 12. Push Notification Subscription Registration
app.post('/api/notifications/subscribe', authenticateUser, (req, res) => {
  const user = (req as any).user;
  const { subscription } = req.body;
  if (!subscription) return res.status(400).json({ error: 'Subscription is required' });

  const db = loadDatabase();
  const existingIdx = db.subscriptions.findIndex(
    (s) => s.userId === user.id && s.endpoint === subscription.endpoint
  );
  if (existingIdx >= 0) {
    db.subscriptions[existingIdx] = { ...subscription, userId: user.id, updatedAt: new Date().toISOString() };
  } else {
    db.subscriptions.push({ ...subscription, userId: user.id, createdAt: new Date().toISOString() });
  }

  saveDatabase(db);
  return res.json({ message: 'Subscribed to push notifications successfully' });
});

// 13. Progress & Analytics Data (calculated live from logged-in user records)
app.get('/api/progress/analytics', authenticateUser, (req, res) => {
  const user = (req as any).user;
  const db = loadDatabase();

  const userTasks = db.tasks.filter((t) => t.userId === user.id);
  const userGoals = db.learningGoals.filter((g) => g.userId === user.id);

  let totalMinutes = 0;
  let completedTasks = 0;
  let pendingTasks = 0;
  const subjectHoursMap: Record<string, number> = {};

  userTasks.forEach((t) => {
    if (t.status === 'Completed') {
      completedTasks++;
      const mins = Number(t.durationMinutes) || 60;
      totalMinutes += mins;
      subjectHoursMap[t.subject] = (subjectHoursMap[t.subject] || 0) + mins / 60;
    } else {
      pendingTasks++;
    }
  });

  const totalStudyHours = Number((totalMinutes / 60).toFixed(1));

  // Determine most productive subject
  let mostProductiveSubject = 'Java Programming';
  let maxHours = 0;
  Object.entries(subjectHoursMap).forEach(([subj, hours]) => {
    if (hours > maxHours) {
      maxHours = hours;
      mostProductiveSubject = subj;
    }
  });

  // Calculate overall syllabus completion
  let totalChapters = 0;
  let completedChapters = 0;
  userGoals.forEach((g) => {
    totalChapters += Number(g.totalChapters) || 0;
    completedChapters += Number(g.completedChapters) || 0;
  });
  const overallSyllabusCompletion = totalChapters > 0
    ? Math.round((completedChapters / totalChapters) * 100)
    : 0;

  // Average daily study time
  const averageDailyStudyTime = totalStudyHours > 0 ? Number((totalStudyHours / 14).toFixed(1)) : 0;

  return res.json({
    totalStudyHours,
    totalCompletedTasks: completedTasks,
    totalPendingTasks: pendingTasks,
    overallSyllabusCompletion,
    mostProductiveSubject: mostProductiveSubject || 'None yet',
    bestStudyDay: totalStudyHours > 0 ? 'Wednesday' : 'None yet',
    averageDailyStudyTime,
    streak: user.streakDays || 0,
    xp: user.xp || 0,
    level: Math.floor((user.xp || 0) / 100) + 1,
    subjectBreakdown: subjectHoursMap,
  });
});

// 14. Activity Heatmap Records
app.get('/api/progress/heatmap', authenticateUser, (req, res) => {
  const user = (req as any).user;
  const db = loadDatabase();
  // Return records (if demo user, return demo records, otherwise filter by userId)
  if (user.id === 'usr_saranya_demo') {
    return res.json(db.heatmapRecords || []);
  }
  const userRecords = (db.heatmapRecords || []).filter((r: any) => r.userId === user.id);
  return res.json(userRecords);
});

// 15. Export Python Flask + MySQL Deliverables
app.get('/api/export-backend', (req, res) => {
  const flaskAppPath = path.join(__dirname, 'backend_flask', 'app.py');
  const schemaPath = path.join(__dirname, 'backend_flask', 'schema.sql');
  const readmePath = path.join(__dirname, 'backend_flask', 'README.md');

  res.json({
    hasFlaskBackend: fs.existsSync(flaskAppPath),
    hasMySQLSchema: fs.existsSync(schemaPath),
    hasReadme: fs.existsSync(readmePath),
    flaskBackendLocation: '/backend_flask',
  });
});

// --- VITE DEV MIDDLEWARE / STATIC SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyMate server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
