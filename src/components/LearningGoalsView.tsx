import React, { useState } from 'react';
import { LearningGoal } from '../types';
import {
  Target,
  Plus,
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  X,
  Trash2,
} from 'lucide-react';

interface LearningGoalsViewProps {
  goals: LearningGoal[];
  onAddGoal: (goal: Partial<LearningGoal>) => void;
  onUpdateProgress: (goalId: string, completedChapters: number) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const LearningGoalsView: React.FC<LearningGoalsViewProps> = ({
  goals,
  onAddGoal,
  onUpdateProgress,
  onDeleteGoal,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [syllabusDetails, setSyllabusDetails] = useState('');
  const [totalChapters, setTotalChapters] = useState(10);
  const [targetDate, setTargetDate] = useState(
    new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0]
  );
  const [plannedDurationMonths, setPlannedDurationMonths] = useState(2);
  const [dailyStudyHours, setDailyStudyHours] = useState(2);
  const [difficulty, setDifficulty] = useState<LearningGoal['difficulty']>('Intermediate');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName || !totalChapters || !targetDate) return;

    onAddGoal({
      subjectName,
      syllabusDetails,
      totalChapters: Number(totalChapters),
      completedChapters: 0,
      targetDate,
      startDate: new Date().toISOString().split('T')[0],
      plannedDurationMonths: Number(plannedDurationMonths),
      dailyStudyHours: Number(dailyStudyHours),
      difficulty,
    });

    // Reset & close
    setSubjectName('');
    setSyllabusDetails('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 uppercase tracking-wider">
            <Target className="w-4 h-4" />
            <span>Curriculum & Syllabus Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            My Learning Goals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Plan multi-month subject milestones with automated daily & weekly pacing calculations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 text-white font-semibold text-xs sm:text-sm hover:bg-purple-800 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Learning Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const completed = Number(goal.completedChapters) || 0;
          const total = Number(goal.totalChapters) || 1;
          const remaining = Math.max(0, total - completed);
          const percent = Math.min(100, Math.round((completed / total) * 100));

          const now = new Date();
          const target = new Date(goal.targetDate);
          const daysRemaining = Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));

          const isOnTrack = goal.status === 'On-Track' || goal.status === 'Ahead of Schedule';

          return (
            <div
              key={goal.id}
              className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-purple-300 transition-all"
            >
              <div>
                {/* Header line */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        {goal.difficulty} Level
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          isOnTrack
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {goal.status}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mt-1.5">{goal.subjectName}</h2>
                  </div>

                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove Goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Syllabus details */}
                {goal.syllabusDetails && (
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    {goal.syllabusDetails}
                  </p>
                )}

                {/* Main Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Syllabus Completion</span>
                    <span className="font-extrabold text-purple-700 tabular-nums">{percent}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Metrics 4-Box Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Completed</span>
                    <span className="text-base font-extrabold text-slate-900 tabular-nums mt-0.5 block">
                      {completed} / {total}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Remaining</span>
                    <span className="text-base font-extrabold text-slate-900 tabular-nums mt-0.5 block">
                      {remaining} Ch.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Days Left</span>
                    <span className="text-base font-extrabold text-slate-900 tabular-nums mt-0.5 block">
                      {daysRemaining} d
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Daily Target</span>
                    <span className="text-base font-extrabold text-slate-900 tabular-nums mt-0.5 block">
                      {goal.dailyStudyHours} hrs
                    </span>
                  </div>
                </div>

                {/* System Calculated Pace Recommendations */}
                <div className="mt-4 p-3 rounded-xl bg-purple-50/40 border border-purple-100 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-purple-900 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                    <span>Suggested Study Plan:</span>
                  </div>
                  <p className="text-slate-600 pl-5">
                    <strong>Daily Pace:</strong> {goal.suggestedDailyPace || `${(remaining / Math.max(1, daysRemaining)).toFixed(2)} chapters/day`}
                  </p>
                  <p className="text-slate-600 pl-5">
                    <strong>Weekly Pace:</strong> {goal.suggestedWeeklyPace || `${((remaining / Math.max(1, daysRemaining)) * 7).toFixed(1)} chapters/week`}
                  </p>
                  <p className="text-slate-500 pl-5 text-[11px]">
                    Target Completion Date: {new Date(goal.targetDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Chapter Manual Progress Controls */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-600">Update Chapter Count:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateProgress(goal.id, Math.max(0, completed - 1))}
                    disabled={completed <= 0}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="font-mono text-sm font-bold text-slate-900 px-2 tabular-nums">
                    {completed}
                  </span>
                  <button
                    onClick={() => onUpdateProgress(goal.id, Math.min(total, completed + 1))}
                    disabled={completed >= total}
                    className="w-8 h-8 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Learning Goal</h3>
                  <p className="text-xs text-slate-500">Configure subject syllabus and target completion</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Java Programming, Deep Learning, Organic Chemistry"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Syllabus / Topic Details</label>
                <textarea
                  rows={2}
                  placeholder="e.g. OOP, Collections, Multithreading, Generics, Stream API, JDBC"
                  value={syllabusDetails}
                  onChange={(e) => setSyllabusDetails(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Chapters *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={totalChapters}
                    onChange={(e) => setTotalChapters(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Daily Study Hours *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="12"
                    value={dailyStudyHours}
                    onChange={(e) => setDailyStudyHours(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Completion Date *</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-700 text-white font-semibold hover:bg-purple-800"
                >
                  Calculate Plan & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
