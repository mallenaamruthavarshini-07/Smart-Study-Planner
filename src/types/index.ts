export type ThemeKey = 'soft-grey' | 'light-purple' | 'soft-peach' | 'lemon-yellow' | 'dark';
export type DeviceMode = 'laptop' | 'mobile';

export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type TaskCategory = 'Study' | 'Assignment' | 'Project' | 'Revision' | 'Exam Prep' | 'Personal';

export interface User {
  id: string;
  name: string;
  email: string;
  theme: ThemeKey;
  avatar?: string;
  devicePreference?: DeviceMode;
  dailyGoalHours: number;
  xp: number;
  streakDays: number;
  badges: string[];
  createdAt: string;
  isNewUser?: boolean;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  code?: string;
  color: string;
  icon?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  subject: string;
  subjectId?: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string;
  durationMinutes: number;
  priority: TaskPriority;
  category: TaskCategory;
  status: TaskStatus;
  reminderSettings: {
    enabled: boolean;
    offsetMinutes: number; // e.g. 15 mins before
    repeatMinutes?: number;
  };
  createdAt: string;
  completedAt?: string;
}

export interface LearningGoal {
  id: string;
  userId: string;
  subjectName: string;
  syllabusDetails: string;
  totalChapters: number;
  completedChapters: number;
  targetDate: string; // YYYY-MM-DD
  startDate: string; // YYYY-MM-DD
  plannedDurationMonths: number;
  dailyStudyHours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Hard';
  suggestedDailyPace?: string;
  suggestedWeeklyPace?: string;
  estimatedCompletionDate?: string;
  status: 'On-Track' | 'Behind Schedule' | 'Ahead of Schedule' | 'Completed';
  createdAt: string;
}

export interface Exam {
  id: string;
  userId: string;
  title: string;
  subject: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  description?: string;
  priority: TaskPriority;
  reminderSchedule: number[]; // e.g. [5, 4, 3, 2, 1, 0] days before
  createdAt: string;
}

export type DocumentCategory = 'Notes' | 'PDFs' | 'Certificates' | 'Projects' | 'Other Documents';

export interface AcademicDocument {
  id: string;
  userId: string;
  title: string;
  category: DocumentCategory;
  subject: string;
  fileName: string;
  fileSize: number; // bytes
  fileType: string;
  uploadedAt: string;
  fileData?: string; // base64 data URL
}

export type NotificationType =
  | 'task_start'
  | 'task_deadline'
  | 'task_overdue'
  | 'daily_goal'
  | 'revision'
  | 'exam_countdown'
  | 'assignment_deadline';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  taskId?: string;
  examId?: string;
  scheduledTime: string;
  status: 'unread' | 'read' | 'snoozed' | 'dismissed' | 'completed';
  createdAt: string;
  snoozedUntil?: string;
}

export interface DayHeatmapRecord {
  date: string; // YYYY-MM-DD
  status: 'green' | 'light-green' | 'red' | 'grey';
  scheduledHours: number;
  completedHours: number;
  tasksScheduled: number;
  tasksCompleted: number;
  note?: string;
}

export interface AnalyticsSummary {
  totalStudyHours: number;
  totalCompletedTasks: number;
  totalPendingTasks: number;
  overallSyllabusCompletion: number;
  mostProductiveSubject: string;
  bestStudyDay: string;
  averageDailyStudyTime: number; // hours
  streak: number;
  xp: number;
  level: number;
}
