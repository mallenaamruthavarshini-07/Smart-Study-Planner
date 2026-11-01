import React, { useState } from 'react';
import { User, Task, Exam, LearningGoal } from '../types';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Plus,
  Flame,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Edit2,
  Trash2,
  CalendarDays,
  Target,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface DashboardViewProps {
  user: User | null;
  tasks: Task[];
  exams: Exam[];
  learningGoals: LearningGoal[];
  onUpdateTaskStatus: (taskId: string, status: Task['status']) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenNewTask: () => void;
  onEditTask: (task: Task) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  tasks,
  exams,
  learningGoals,
  onUpdateTaskStatus,
  onDeleteTask,
  onOpenNewTask,
  onEditTask,
  onNavigateTab,
}) => {
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('week');
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // 1. Task Overviews: Today, Week, Month
  const todayTasks = tasks.filter((t) => t.date === todayStr);
  const todayCompleted = todayTasks.filter((t) => t.status === 'Completed').length;
  const todayPending = todayTasks.length - todayCompleted;

  // This Week's tasks calculation
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
  const endOfWeekStr = endOfWeek.toISOString().split('T')[0];

  const weekTasks = tasks.filter((t) => t.date >= startOfWeekStr && t.date <= endOfWeekStr);
  const weekCompleted = weekTasks.filter((t) => t.status === 'Completed').length;
  const weekPending = weekTasks.length - weekCompleted;

  // This Month's tasks calculation
  const currentYearMonth = todayStr.substring(0, 7); // YYYY-MM
  const monthTasks = tasks.filter((t) => t.date.startsWith(currentYearMonth));
  const monthCompleted = monthTasks.filter((t) => t.status === 'Completed').length;
  const monthPending = monthTasks.length - monthCompleted;

  // Daily Study Goal Progress Calculation
  const dailyGoalHours = user?.dailyGoalHours || 3.0;
  const todayCompletedMinutes = todayTasks
    .filter((t) => t.status === 'Completed')
    .reduce((acc, curr) => acc + (Number(curr.durationMinutes) || 60), 0);
  const todayCompletedHours = Number((todayCompletedMinutes / 60).toFixed(1));
  const dailyGoalPercent = Math.min(100, Math.round((todayCompletedHours / dailyGoalHours) * 100));

  // Upcoming nearest exam for spotlight banner
  const upcomingExams = [...exams]
    .filter((e) => e.date >= todayStr)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nearestExam = upcomingExams[0];
  const daysUntilNearestExam = nearestExam
    ? Math.ceil((new Date(nearestExam.date).getTime() - new Date(todayStr).getTime()) / 86400000)
    : null;

  // Calendar Timeline Days for Week View
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i + currentWeekOffset * 7);
    const dateStr = d.toISOString().split('T')[0];
    const dayTasks = tasks.filter((t) => t.date === dateStr);
    return {
      date: d,
      dateStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      tasks: dayTasks,
      isToday: dateStr === todayStr,
    };
  });

  return (
    <div className="space-y-6 pb-20 lg:pb-12">
      {/* 1. Header & Welcome Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Academic Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {todayFormatted} · You have {todayPending} pending task{todayPending === 1 ? '' : 's'} scheduled for today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 text-white font-semibold text-xs sm:text-sm hover:bg-purple-800 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Schedule Task</span>
          </button>
        </div>
      </div>

      {/* 2. Nearest Exam Countdown Banner (Prominent Alert) */}
      {nearestExam && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-xs shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  Priority Exam Countdown
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  {daysUntilNearestExam === 0 ? 'Today!' : `${daysUntilNearestExam} Days Left`}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">{nearestExam.title}</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Subject: <strong>{nearestExam.subject}</strong> · Scheduled for{' '}
                {new Date(nearestExam.date).toLocaleDateString()} at {nearestExam.time}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('exams')}
            className="flex items-center gap-1.5 self-start md:self-center px-3.5 py-1.5 rounded-xl bg-white text-xs font-bold text-amber-900 border border-amber-300 shadow-xs hover:bg-amber-100 transition-colors whitespace-nowrap"
          >
            <span>View 5-Day Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Section A: Three Task Overview Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900">Task Overview</h2>
          <span className="text-xs text-slate-500">Real-time status breakdown</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Today's Tasks */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-purple-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-700">
                Today's Schedule
              </span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {todayTasks.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">scheduled</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Completed: <strong className="tabular-nums">{todayCompleted}</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Pending: <strong className="tabular-nums">{todayPending}</strong>
              </span>
            </div>
          </div>

          {/* Card 2: This Week's Tasks */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-purple-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                This Week's Tasks
              </span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <CalendarDays className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {weekTasks.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">total tasks</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Done: <strong className="tabular-nums">{weekCompleted}</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Remaining: <strong className="tabular-nums">{weekPending}</strong>
              </span>
            </div>
          </div>

          {/* Card 3: This Month's Tasks */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-purple-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                This Month's Scope
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {monthTasks.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">planned</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Finished: <strong className="tabular-nums">{monthCompleted}</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                In Queue: <strong className="tabular-nums">{monthPending}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Section B: Today's Study Tasks & Daily Study Goal Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols on lg): Today's Tasks List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Today's Study Tasks</h2>
              <p className="text-xs text-slate-500">Track and update completion in real time</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 tabular-nums">
              {todayCompleted}/{todayTasks.length} Complete
            </span>
          </div>

          {todayTasks.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white border border-slate-200/80">
              <p className="text-sm font-semibold text-slate-700">No study tasks scheduled for today</p>
              <p className="text-xs text-slate-400 mt-1">
                Create your first task or prepare for upcoming exams.
              </p>
              <button
                onClick={onOpenNewTask}
                className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-purple-700 text-white hover:bg-purple-800"
              >
                Add Study Task
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTasks.map((task) => {
                const isDone = task.status === 'Completed';
                const isInProgress = task.status === 'In Progress';

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isDone
                        ? 'bg-slate-50/70 border-slate-200 opacity-80'
                        : isInProgress
                        ? 'bg-white border-purple-300 shadow-xs'
                        : 'bg-white border-slate-200/80 shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() =>
                            onUpdateTaskStatus(task.id, isDone ? 'Pending' : 'Completed')
                          }
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isDone
                              ? 'bg-emerald-600 text-white'
                              : 'border-2 border-slate-300 hover:border-purple-600'
                          }`}
                          title={isDone ? 'Mark as Pending' : 'Mark as Completed'}
                        >
                          {isDone && <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />}
                        </button>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3
                              className={`text-sm font-bold ${
                                isDone ? 'line-through text-slate-400' : 'text-slate-900'
                              }`}
                            >
                              {task.title}
                            </h3>
                            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                              {task.subject}
                            </span>
                            <span
                              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                                task.priority === 'High'
                                  ? 'bg-rose-50 text-rose-700'
                                  : task.priority === 'Medium'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {task.priority} Priority
                            </span>
                          </div>

                          {task.description && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {task.startTime} {task.endTime ? `– ${task.endTime}` : ''} ({task.durationMinutes}m)
                            </span>
                            <span>·</span>
                            <span className="font-medium text-slate-600">Category: {task.category}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Selector & Controls */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 w-full sm:w-auto justify-between sm:justify-end">
                        <select
                          value={task.status}
                          onChange={(e) =>
                            onUpdateTaskStatus(task.id, e.target.value as Task['status'])
                          }
                          className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>

                        <button
                          onClick={() => onEditTask(task)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          title="Edit Task"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Daily Study Goal Progress & Learning Goals Peek */}
        <div className="space-y-4">
          {/* Daily Goal Indicator */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Daily Study Goal</h3>
                <p className="text-xs text-slate-500">Target: {dailyGoalHours} hours/day</p>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                {dailyGoalPercent}%
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500"
                  style={{ width: `${dailyGoalPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Completed: {todayCompletedHours} hrs</span>
                <span>Goal: {dailyGoalHours} hrs</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl">
              {dailyGoalPercent >= 100
                ? 'Great job! You achieved your study target for today. Extra review builds momentum!'
                : `You are ${(dailyGoalHours - todayCompletedHours).toFixed(1)} hours away from today's target.`}
            </p>
          </div>

          {/* Learning Goals Quick Peek */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Active Syllabus Goals</h3>
              <button
                onClick={() => onNavigateTab('goals')}
                className="text-xs font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {learningGoals.slice(0, 2).map((goal) => {
              const pct = Math.round((goal.completedChapters / goal.totalChapters) * 100);
              return (
                <div key={goal.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{goal.subjectName}</span>
                    <span className="font-bold text-purple-700 tabular-nums">{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-purple-600"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>{goal.completedChapters}/{goal.totalChapters} Chapters</span>
                    <span className="font-medium text-emerald-700">{goal.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Section C: Weekly and Monthly Overview (Calendar / Timeline) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Timeline & Calendar Overview</h2>
            <p className="text-xs text-slate-500">Upcoming tasks & planned academic workload</p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher: Day, Week, Month */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              {(['day', 'week', 'month'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setCalendarView(mode)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg capitalize transition-colors ${
                    calendarView === mode
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Week navigation arrows */}
            {calendarView === 'week' && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentWeekOffset((prev) => prev - 1)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  title="Previous Week"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentWeekOffset(0)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200"
                >
                  Current
                </button>
                <button
                  onClick={() => setCurrentWeekOffset((prev) => prev + 1)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  title="Next Week"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* View Content */}
        {calendarView === 'week' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {weekDays.map((day) => {
              const completedCount = day.tasks.filter((t) => t.status === 'Completed').length;
              return (
                <div
                  key={day.dateStr}
                  className={`p-3 rounded-xl border flex flex-col justify-between min-h-[120px] transition-all ${
                    day.isToday
                      ? 'border-purple-500 bg-purple-50/30 ring-1 ring-purple-400'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-500">{day.dayName}</span>
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold tabular-nums ${
                          day.isToday
                            ? 'bg-purple-700 text-white'
                            : 'text-slate-900 bg-slate-100'
                        }`}
                      >
                        {day.dayNumber}
                      </span>
                    </div>

                    <div className="mt-2 space-y-1">
                      {day.tasks.slice(0, 2).map((t) => (
                        <div
                          key={t.id}
                          className="text-[11px] p-1 rounded bg-slate-100/80 truncate text-slate-700 font-medium"
                          title={t.title}
                        >
                          {t.title}
                        </div>
                      ))}
                      {day.tasks.length > 2 && (
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          +{day.tasks.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{day.tasks.length} tasks</span>
                    {day.tasks.length > 0 && (
                      <span className="text-emerald-700 font-bold">
                        {completedCount}/{day.tasks.length}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {calendarView === 'day' && (
          <div className="p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-sm font-bold text-slate-900">Today's Timeline ({todayStr})</h4>
            <div className="space-y-2">
              {todayTasks.length === 0 ? (
                <p className="text-xs text-slate-500">No tasks scheduled for today.</p>
              ) : (
                todayTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{t.title}</span>
                      <span className="text-slate-500 block">
                        {t.subject} · {t.startTime} ({t.durationMinutes}m)
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-md font-semibold text-[11px] ${
                        t.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {calendarView === 'month' && (
          <div className="p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-sm font-bold text-slate-900">
              <span>{now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Summary</span>
              <span className="text-xs font-semibold text-purple-700">
                {monthCompleted}/{monthTasks.length} Completed
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100">
                <span className="text-purple-800 font-semibold block">Total Tasks</span>
                <span className="text-xl font-extrabold text-purple-950 mt-1 block tabular-nums">
                  {monthTasks.length}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-emerald-800 font-semibold block">Completed</span>
                <span className="text-xl font-extrabold text-emerald-950 mt-1 block tabular-nums">
                  {monthCompleted}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                <span className="text-amber-800 font-semibold block">Pending</span>
                <span className="text-xl font-extrabold text-amber-950 mt-1 block tabular-nums">
                  {monthPending}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                <span className="text-blue-800 font-semibold block">Completion Rate</span>
                <span className="text-xl font-extrabold text-blue-950 mt-1 block tabular-nums">
                  {monthTasks.length > 0 ? Math.round((monthCompleted / monthTasks.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
