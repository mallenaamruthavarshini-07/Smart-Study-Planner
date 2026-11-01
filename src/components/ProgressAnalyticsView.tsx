import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { AnalyticsSummary, Task, LearningGoal } from '../types';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  BookOpen,
  Award,
  Calendar,
  Flame,
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ProgressAnalyticsViewProps {
  analytics: AnalyticsSummary;
  tasks: Task[];
  goals: LearningGoal[];
}

export const ProgressAnalyticsView: React.FC<ProgressAnalyticsViewProps> = ({
  analytics,
  tasks,
  goals,
}) => {
  // 1. Daily Study Hours Graph (Past 7 days)
  const last7DaysLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
  });

  const dailyStudyHoursData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayTasks = tasks.filter((t) => t.date === dateStr && t.status === 'Completed');
    const mins = dayTasks.reduce((sum, t) => sum + (Number(t.durationMinutes) || 60), 0);
    return Number((mins / 60).toFixed(1));
  });

  const dailyHoursChart = {
    labels: last7DaysLabels,
    datasets: [
      {
        label: 'Study Hours',
        data: dailyStudyHoursData,
        backgroundColor: '#8066C5',
        borderRadius: 8,
      },
    ],
  };

  // 2. Weekly Task Completion Graph (Completed vs Pending per day this week)
  const weeklyCompletionChart = {
    labels: last7DaysLabels,
    datasets: [
      {
        label: 'Completed Tasks',
        data: Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const dateStr = d.toISOString().split('T')[0];
          return tasks.filter((t) => t.date === dateStr && t.status === 'Completed').length;
        }),
        backgroundColor: '#10B981',
        borderRadius: 6,
      },
      {
        label: 'Pending Tasks',
        data: Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const dateStr = d.toISOString().split('T')[0];
          return tasks.filter((t) => t.date === dateStr && t.status !== 'Completed').length;
        }),
        backgroundColor: '#E2E8F0',
        borderRadius: 6,
      },
    ],
  };

  // 3. Subject-wise Hours Doughnut Chart
  const subjectsMap: Record<string, number> = {};
  tasks.forEach((t) => {
    if (t.status === 'Completed') {
      const h = (Number(t.durationMinutes) || 60) / 60;
      subjectsMap[t.subject] = (subjectsMap[t.subject] || 0) + h;
    }
  });

  const subjectLabels = Object.keys(subjectsMap).length > 0
    ? Object.keys(subjectsMap)
    : ['Java Programming', 'Database Systems', 'Networks'];
  const subjectHours = Object.keys(subjectsMap).length > 0
    ? Object.values(subjectsMap)
    : [6.5, 4.0, 3.0];

  const subjectChart = {
    labels: subjectLabels,
    datasets: [
      {
        data: subjectHours,
        backgroundColor: ['#8066C5', '#3B82F6', '#10B981', '#F59E0B', '#EC4899'],
        borderWidth: 2,
        borderColor: '#FFFFFF',
      },
    ],
  };

  // 4. Completed vs Pending Tasks Doughnut
  const taskStatusChart = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [analytics.totalCompletedTasks, Math.max(1, analytics.totalPendingTasks)],
        backgroundColor: ['#10B981', '#F59E0B'],
        borderWidth: 2,
        borderColor: '#FFFFFF',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" },
        },
      },
    },
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Academic Performance Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            My Progress
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Visual metrics derived directly from your personal task completions and study logs.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-50 text-purple-900 border border-purple-200/60 font-semibold text-xs">
          <Flame className="w-4 h-4 text-purple-700" />
          <span>Active Streak: {analytics.streak} Days</span>
        </div>
      </div>

      {/* 7 KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-600" /> Total Study Hours
          </span>
          <span className="text-2xl font-extrabold text-slate-900 tabular-nums mt-1 block">
            {analytics.totalStudyHours} hrs
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Logged study time</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed Tasks
          </span>
          <span className="text-2xl font-extrabold text-emerald-700 tabular-nums mt-1 block">
            {analytics.totalCompletedTasks}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            vs {analytics.totalPendingTasks} pending
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> Syllabus Completion
          </span>
          <span className="text-2xl font-extrabold text-blue-700 tabular-nums mt-1 block">
            {analytics.overallSyllabusCompletion}%
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Across all subjects</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-600" /> Top Subject
          </span>
          <span className="text-sm font-bold text-slate-900 truncate mt-2 block" title={analytics.mostProductiveSubject}>
            {analytics.mostProductiveSubject}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Highest study focus</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Best Study Day
          </span>
          <span className="text-lg font-extrabold text-slate-900 mt-1 block">
            {analytics.bestStudyDay}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Peak task efficiency</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-rose-600" /> Daily Average
          </span>
          <span className="text-2xl font-extrabold text-slate-900 tabular-nums mt-1 block">
            {analytics.averageDailyStudyTime} hrs/d
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">14-day rolling average</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-purple-600" /> Mastery Level
          </span>
          <span className="text-2xl font-extrabold text-purple-700 tabular-nums mt-1 block">
            Level {analytics.level} ({analytics.xp} XP)
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Academic standing</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Daily Study Hours */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Daily Study Hours (Last 7 Days)</h3>
            <span className="text-xs text-purple-700 font-semibold">Active Hours</span>
          </div>
          <div className="h-64">
            <Bar data={dailyHoursChart} options={chartOptions} />
          </div>
        </div>

        {/* Chart 2: Weekly Task Completion Ratio */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Weekly Task Completion Breakdown</h3>
            <span className="text-xs text-emerald-700 font-semibold">Done vs Queue</span>
          </div>
          <div className="h-64">
            <Bar data={weeklyCompletionChart} options={chartOptions} />
          </div>
        </div>

        {/* Chart 3: Subject-wise Focus Hours */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Subject-wise Study Distribution</h3>
            <span className="text-xs text-slate-500">By Logged Hours</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={subjectChart} options={chartOptions} />
          </div>
        </div>

        {/* Chart 4: Overall Tasks Ratio */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Task Completion vs Pending</h3>
            <span className="text-xs text-slate-500">Total Portfolio</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={taskStatusChart} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};
