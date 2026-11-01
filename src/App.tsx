import React, { useState, useEffect } from 'react';
import {
  User,
  ThemeKey,
  DeviceMode,
  Task,
  Exam,
  LearningGoal,
  Subject,
  AcademicDocument,
  NotificationItem,
  DayHeatmapRecord,
  AnalyticsSummary,
} from './types';
import {
  getStoredToken,
  setStoredToken,
  removeStoredToken,
  getStoredUser,
  setStoredUser,
  apiRequest,
} from './utils/api';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { LearningGoalsView } from './components/LearningGoalsView';
import { TasksView } from './components/TasksView';
import { ExamsView } from './components/ExamsView';
import { DocumentsView } from './components/DocumentsView';
import { ProgressAnalyticsView } from './components/ProgressAnalyticsView';
import { ConsistencyHeatmapView } from './components/ConsistencyHeatmapView';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { NotificationModal } from './components/NotificationModal';
import { RewardsModal } from './components/RewardsModal';
import { BackendExportModal } from './components/BackendExportModal';
import { AuthModal } from './components/AuthModal';
import { AuthScreen } from './components/AuthScreen';
import { NewUserGuideModal } from './components/NewUserGuideModal';
import { ProfileAvatarModal } from './components/ProfileAvatarModal';
import { triggerCelebration } from './utils/confetti';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    return getStoredToken() ? getStoredUser() : null;
  });
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>(() => {
    const cached = getStoredUser();
    return cached?.devicePreference || 'laptop';
  });

  // Core Data States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [documents, setDocuments] = useState<AcademicDocument[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [heatmapRecords, setHeatmapRecords] = useState<DayHeatmapRecord[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    totalStudyHours: 0,
    totalCompletedTasks: 0,
    totalPendingTasks: 0,
    overallSyllabusCompletion: 0,
    mostProductiveSubject: 'None yet',
    bestStudyDay: 'None yet',
    averageDailyStudyTime: 0,
    streak: 0,
    xp: 0,
    level: 1,
  });

  // Modal Visibility States
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showBackendModal, setShowBackendModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Active theme application
  const applyTheme = (theme: ThemeKey) => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme !== 'light-purple') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Register service worker on mount
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
    }
  }, []);

  // Initial user authentication check (persists if token exists, otherwise prompts for login)
  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken();
      if (token) {
        try {
          const userData = await apiRequest<User>('/api/auth/me');
          setUser(userData);
          setStoredUser(userData);
          applyTheme(userData.theme || 'light-purple');
          if (userData.devicePreference) {
            setDeviceMode(userData.devicePreference);
          }
          fetchAllData();
          return;
        } catch {
          removeStoredToken();
          setUser(null);
        }
      }
      setUser(null);
    };

    initAuth();
  }, []);

  // Poll for scheduled overdue task alerts & exam countdown updates
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      apiRequest<NotificationItem[]>('/api/notifications')
        .then((data) => {
          if (Array.isArray(data)) setNotifications(data);
        })
        .catch(() => {});
    }, 45000);
    return () => clearInterval(interval);
  }, [user]);

  // Fetch all user specific data
  const fetchAllData = async () => {
    try {
      const [
        tasksData,
        examsData,
        goalsData,
        subjectsData,
        docsData,
        notifsData,
        heatmapData,
        analyticsData,
      ] = await Promise.all([
        apiRequest<Task[]>('/api/tasks').catch(() => []),
        apiRequest<Exam[]>('/api/exams').catch(() => []),
        apiRequest<LearningGoal[]>('/api/learning-goals').catch(() => []),
        apiRequest<Subject[]>('/api/subjects').catch(() => []),
        apiRequest<AcademicDocument[]>('/api/documents').catch(() => []),
        apiRequest<NotificationItem[]>('/api/notifications').catch(() => []),
        apiRequest<DayHeatmapRecord[]>('/api/progress/heatmap').catch(() => []),
        apiRequest<AnalyticsSummary>('/api/progress/analytics').catch(() => null),
      ]);

      setTasks(tasksData);
      setExams(examsData);
      setGoals(goalsData);
      setSubjects(subjectsData);
      setDocuments(docsData);
      setNotifications(notifsData);
      setHeatmapRecords(heatmapData);
      if (analyticsData) setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error fetching study data:', err);
    }
  };

  // Theme change handler
  const handleSelectTheme = async (theme: ThemeKey) => {
    applyTheme(theme);
    if (user) {
      const updatedUser = { ...user, theme };
      setUser(updatedUser);
      setStoredUser(updatedUser);
      try {
        await apiRequest('/api/user/preferences', {
          method: 'PUT',
          body: JSON.stringify({ theme }),
        });
      } catch (err) {
        console.error('Failed to save theme preference:', err);
      }
    }
  };

  // Device mode switcher (Laptop vs Mobile Phone configuration)
  const handleChangeDeviceMode = async (mode: DeviceMode) => {
    setDeviceMode(mode);
    if (user) {
      const updatedUser = { ...user, devicePreference: mode };
      setUser(updatedUser);
      setStoredUser(updatedUser);
      try {
        await apiRequest('/api/user/preferences', {
          method: 'PUT',
          body: JSON.stringify({ devicePreference: mode }),
        });
      } catch (err) {
        console.error('Failed to save device mode preference:', err);
      }
    }
  };

  // Avatar change handler (uploaded from device or selected icon)
  const handleSaveAvatar = async (avatarDataUrl: string) => {
    if (user) {
      const updatedUser = { ...user, avatar: avatarDataUrl };
      setUser(updatedUser);
      setStoredUser(updatedUser);
      try {
        await apiRequest('/api/user/preferences', {
          method: 'PUT',
          body: JSON.stringify({ avatar: avatarDataUrl }),
        });
      } catch (err) {
        console.error('Failed to save avatar:', err);
      }
    }
  };

  // Task Status Update (awards XP and checks badges)
  const handleUpdateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      const res = await apiRequest<{
        task: Task;
        earnedXp: number;
        newBadges: string[];
        totalXp: number;
        streak: number;
      }>(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      // Update state
      setTasks((prev) => prev.map((t) => (t.id === taskId ? res.task : t)));

      if (res.earnedXp > 0) {
        triggerCelebration('subtle');
        if (user) {
          const updated = {
            ...user,
            xp: res.totalXp,
            streakDays: res.streak,
            badges: Array.from(new Set([...user.badges, ...res.newBadges])),
          };
          setUser(updated);
          setStoredUser(updated);
        }
      }

      // Refresh analytics
      const updatedAnalytics = await apiRequest<AnalyticsSummary>('/api/progress/analytics');
      setAnalytics(updatedAnalytics);
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  // Task CRUD Handlers
  const handleAddTask = async (taskData: Partial<Task>) => {
    try {
      const newTask = await apiRequest<Task>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
      setTasks((prev) => [newTask, ...prev]);
      fetchAllData();
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updated = await apiRequest<Task>(`/api/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      console.error('Error editing task:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await apiRequest(`/api/tasks/${taskId}`, { method: 'DELETE' });
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  // Learning Goals CRUD Handlers
  const handleAddGoal = async (goalData: Partial<LearningGoal>) => {
    try {
      const newGoal = await apiRequest<LearningGoal>('/api/learning-goals', {
        method: 'POST',
        body: JSON.stringify(goalData),
      });
      setGoals((prev) => [newGoal, ...prev]);
    } catch (err) {
      console.error('Error creating learning goal:', err);
    }
  };

  const handleUpdateGoalProgress = async (goalId: string, completedChapters: number) => {
    try {
      const updated = await apiRequest<LearningGoal>(`/api/learning-goals/${goalId}`, {
        method: 'PUT',
        body: JSON.stringify({ completedChapters }),
      });
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));

      if (updated.status === 'Completed') {
        triggerCelebration('milestone');
      }
    } catch (err) {
      console.error('Error updating goal:', err);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await apiRequest(`/api/learning-goals/${goalId}`, { method: 'DELETE' });
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
    } catch (err) {
      console.error('Error deleting goal:', err);
    }
  };

  // Exams CRUD Handlers
  const handleAddExam = async (examData: Partial<Exam>) => {
    try {
      const newExam = await apiRequest<Exam>('/api/exams', {
        method: 'POST',
        body: JSON.stringify(examData),
      });
      setExams((prev) => [newExam, ...prev]);
      fetchAllData();
    } catch (err) {
      console.error('Error adding exam:', err);
    }
  };

  const handleDeleteExam = async (id: string) => {
    try {
      await apiRequest(`/api/exams/${id}`, { method: 'DELETE' });
      setExams((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Error deleting exam:', err);
    }
  };

  // Documents CRUD Handlers
  const handleUploadDocument = async (docData: Partial<AcademicDocument>) => {
    try {
      const newDoc = await apiRequest<AcademicDocument>('/api/documents', {
        method: 'POST',
        body: JSON.stringify(docData),
      });
      setDocuments((prev) => [newDoc, ...prev]);
    } catch (err) {
      console.error('Error uploading document:', err);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await apiRequest(`/api/documents/${id}`, { method: 'DELETE' });
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  // Notification Action Handler
  const handleNotificationAction = async (
    id: string,
    action: 'snooze' | 'dismiss' | 'complete' | 'reschedule',
    meta?: any
  ) => {
    try {
      await apiRequest(`/api/notifications/${id}/action`, {
        method: 'POST',
        body: JSON.stringify({ action, ...meta }),
      });
      fetchAllData();
    } catch (err) {
      console.error('Error applying notification action:', err);
    }
  };

  // Auth Handlers
  const handleLoginSuccess = (token: string, loggedInUser: User) => {
    setStoredToken(token);
    setStoredUser(loggedInUser);
    setUser(loggedInUser);
    applyTheme(loggedInUser.theme || 'light-purple');
    if (loggedInUser.devicePreference) {
      setDeviceMode(loggedInUser.devicePreference);
    }
    fetchAllData();

    // If an existing used account logs in, show old data directly without onboarding
    // If flagged as new user, provide helpful suggestions
    if (loggedInUser.isNewUser) {
      setShowGuideModal(true);
    }
  };

  const handleRegisterSuccess = (token: string, registeredUser: User) => {
    setStoredToken(token);
    setStoredUser(registeredUser);
    setUser(registeredUser);
    applyTheme(registeredUser.theme || 'light-purple');
    fetchAllData();

    // New user account: provide suggestions on how to use!
    setShowGuideModal(true);
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    removeStoredToken();
    setUser(null);
    setTasks([]);
    setExams([]);
    setGoals([]);
    setSubjects([]);
    setDocuments([]);
    setNotifications([]);
    setHeatmapRecords([]);
    setAnalytics({
      totalStudyHours: 0,
      totalCompletedTasks: 0,
      totalPendingTasks: 0,
      overallSyllabusCompletion: 0,
      mostProductiveSubject: 'None yet',
      bestStudyDay: 'None yet',
      averageDailyStudyTime: 0,
      streak: 0,
      xp: 0,
      level: 1,
    });
    setCurrentTab('dashboard');
  };

  // When app opens and student is not logged in, ask to login or create account
  if (!user) {
    return (
      <AuthScreen
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleRegisterSuccess}
      />
    );
  }

  const unreadNotifsCount = notifications.filter((n) => n.status === 'unread').length;

  const renderActiveTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView
            user={user}
            tasks={tasks}
            exams={exams}
            learningGoals={goals}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onDeleteTask={handleDeleteTask}
            onOpenNewTask={() => setCurrentTab('tasks')}
            onEditTask={() => setCurrentTab('tasks')}
            onNavigateTab={setCurrentTab}
          />
        );
      case 'goals':
        return (
          <LearningGoalsView
            goals={goals}
            onAddGoal={handleAddGoal}
            onUpdateProgress={handleUpdateGoalProgress}
            onDeleteGoal={handleDeleteGoal}
          />
        );
      case 'tasks':
        return (
          <TasksView
            tasks={tasks}
            subjects={subjects}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onUpdateStatus={handleUpdateTaskStatus}
            onDeleteTask={handleDeleteTask}
          />
        );
      case 'exams':
        return (
          <ExamsView
            exams={exams}
            onAddExam={handleAddExam}
            onDeleteExam={handleDeleteExam}
          />
        );
      case 'documents':
        return (
          <DocumentsView
            documents={documents}
            subjects={subjects}
            onUploadDocument={handleUploadDocument}
            onDeleteDocument={handleDeleteDocument}
          />
        );
      case 'progress':
        return (
          <ProgressAnalyticsView
            analytics={analytics}
            tasks={tasks}
            goals={goals}
          />
        );
      case 'heatmap':
        return <ConsistencyHeatmapView heatmapRecords={heatmapRecords} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col antialiased selection:bg-purple-200 selection:text-purple-900 transition-colors">
      {/* Top Bar Navigation */}
      <Navbar
        user={user}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        unreadNotifsCount={unreadNotifsCount}
        deviceMode={deviceMode}
        onChangeDeviceMode={handleChangeDeviceMode}
        onOpenNotifications={() => setShowNotifModal(true)}
        onOpenThemes={() => setShowThemeModal(true)}
        onOpenRewards={() => setShowRewardsModal(true)}
        onOpenAvatarPicker={() => setShowAvatarModal(true)}
        onOpenGuide={() => setShowGuideModal(true)}
        onOpenBackendExport={() => setShowBackendModal(true)}
        onLogout={handleLogout}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* Main Responsive Canvas: adapts to Laptop or Mobile Phone Configuration */}
      {deviceMode === 'mobile' ? (
        <div className="w-full flex-1 flex flex-col items-center justify-start py-4 px-2 bg-slate-900/5 dark:bg-black/40 lg:ml-64 lg:w-[calc(100%-16rem)]">
          {/* Mobile Phone Mockup Shell with notch, status bar, and pinned bottom navigation */}
          <div className="w-full max-w-[420px] min-h-[820px] bg-white dark:bg-slate-900 rounded-[38px] shadow-2xl border-[7px] border-slate-900 dark:border-slate-800 flex flex-col relative overflow-hidden transition-all pb-18">
            {/* Phone Status Bar */}
            <div className="h-7 w-full bg-slate-900 text-white flex items-center justify-between px-6 text-[10px] font-mono shrink-0 select-none">
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <div className="w-16 h-3 bg-black rounded-b-md mx-auto -mt-1" />
              <div className="flex items-center gap-1.5 text-[10px]">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* Mobile Viewport Content */}
            <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4">
              {renderActiveTabContent()}
            </div>

            {/* Bottom Nav inside mobile shell */}
            <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
          </div>
        </div>
      ) : (
        /* Laptop / Desktop Wide Canvas Configuration */
        <>
          <main className="flex-1 w-full px-4 sm:px-6 pt-6 lg:ml-64 lg:w-[calc(100%-16rem)] lg:px-8">
            {renderActiveTabContent()}
          </main>
          {/* Ambient Bottom Navigation for touch devices on wider views */}
          <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
        </>
      )}

      {/* Modals & Dialogs */}
      <ThemeSelectorModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        currentTheme={(user?.theme as ThemeKey) || 'light-purple'}
        onSelectTheme={handleSelectTheme}
      />

      <NotificationModal
        isOpen={showNotifModal}
        onClose={() => setShowNotifModal(false)}
        notifications={notifications}
        onAction={handleNotificationAction}
      />

      <RewardsModal
        isOpen={showRewardsModal}
        onClose={() => setShowRewardsModal(false)}
        user={user}
      />

      <BackendExportModal
        isOpen={showBackendModal}
        onClose={() => setShowBackendModal(false)}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleRegisterSuccess}
      />

      {/* New User Suggestions & Onboarding Guide */}
      <NewUserGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        onNavigateTab={setCurrentTab}
      />

      {/* Profile Avatar Icon & Device Photo Picker */}
      <ProfileAvatarModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        currentUser={user}
        onSaveAvatar={handleSaveAvatar}
      />
    </div>
  );
}
