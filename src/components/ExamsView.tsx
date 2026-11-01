import React, { useState } from 'react';
import { Exam, TaskPriority } from '../types';
import {
  Calendar,
  Plus,
  Clock,
  Bell,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  FileSpreadsheet,
  Award,
} from 'lucide-react';

interface ExamsViewProps {
  exams: Exam[];
  onAddExam: (exam: Partial<Exam>) => void;
  onDeleteExam: (id: string) => void;
}

export const ExamsView: React.FC<ExamsViewProps> = ({
  exams,
  onAddExam,
  onDeleteExam,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [time, setTime] = useState('10:00');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('High');
  const [customDays, setCustomDays] = useState<number[]>([5, 4, 3, 2, 1, 0]);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !date) return;

    onAddExam({
      title,
      subject,
      date,
      time,
      description,
      priority,
      reminderSchedule: customDays,
    });

    setTitle('');
    setSubject('');
    setDescription('');
    setShowModal(false);
  };

  const toggleReminderDay = (day: number) => {
    if (customDays.includes(day)) {
      setCustomDays(customDays.filter((d) => d !== day));
    } else {
      setCustomDays([...customDays, day].sort((a, b) => b - a));
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>Milestone & Assessment Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Exams & Deadlines
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            End-semester exams, project submissions, lab vivas, and automatic 5-day countdown alerts.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 text-white font-semibold text-xs sm:text-sm hover:bg-purple-800 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Exam / Deadline</span>
        </button>
      </div>

      {/* Grid of Exams & Deadlines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {exams.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl bg-white border border-slate-200/80">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No upcoming exams or deadlines</p>
            <p className="text-xs text-slate-400 mt-1">
              Add your university dates to automate 5-day preparation alerts.
            </p>
          </div>
        ) : (
          exams.map((exam) => {
            const examTime = new Date(`${exam.date}T${exam.time || '10:00'}:00`);
            const now = new Date();
            const daysLeft = Math.ceil((examTime.getTime() - now.getTime()) / 86400000);
            const isPast = daysLeft < 0;
            const isUrgent = daysLeft <= 3 && daysLeft >= 0;

            return (
              <div
                key={exam.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all ${
                  isUrgent
                    ? 'border-rose-300 bg-rose-50/20 shadow-xs'
                    : 'border-slate-200/80 bg-white shadow-xs hover:border-purple-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        {exam.subject}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1.5 line-clamp-2">
                        {exam.title}
                      </h3>
                    </div>

                    <button
                      onClick={() => onDeleteExam(exam.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Exam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {exam.description && (
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {exam.description}
                    </p>
                  )}

                  {/* Countdown Badge & Schedule Details */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {exam.date} at {exam.time}
                      </span>
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          isPast
                            ? 'bg-slate-200 text-slate-700'
                            : isUrgent
                            ? 'bg-rose-100 text-rose-800 animate-pulse'
                            : 'bg-purple-100 text-purple-900'
                        }`}
                      >
                        {isPast ? 'Passed' : daysLeft === 0 ? 'Today!' : `${daysLeft} Days Left`}
                      </span>
                    </div>

                    {/* 5-Day Automated Reminder Track */}
                    <div className="pt-2 border-t border-slate-200/70">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                        <Bell className="w-3 h-3 text-purple-600" />
                        Automated 5-Day Alert Schedule
                      </span>
                      <div className="flex items-center gap-1">
                        {[5, 4, 3, 2, 1, 0].map((d) => {
                          const isConfigured = exam.reminderSchedule?.includes(d);
                          const isPassedDay = daysLeft < d;

                          return (
                            <span
                              key={d}
                              className={`flex-1 py-1 text-center text-[10px] font-mono rounded font-semibold ${
                                isPassedDay
                                  ? 'bg-slate-200/70 text-slate-400'
                                  : isConfigured
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-slate-100 text-slate-400'
                              }`}
                              title={d === 0 ? 'Exam Day Alert' : `${d} days before alert`}
                            >
                              {d === 0 ? 'Day 0' : `-${d}d`}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    Priority: <strong className="text-slate-800">{exam.priority}</strong>
                  </span>
                  <span className="text-purple-700 font-semibold">Active Reminders</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Add Exam */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Exam or Deadline</h3>
                  <p className="text-xs text-slate-500">Set date, time, and 5-day reminder countdown</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Assessment / Deadline Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Database Management Systems Semester Exam"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subject *</label>
                  <input
                    type="text"
                    placeholder="e.g. Database Management Systems"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Deadline Date *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Time *</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description / Syllabus Scope</label>
                <textarea
                  rows={2}
                  placeholder="e.g. End-term exam covering Units 1 to 5. Paper duration: 3 Hours."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              {/* 5-Day Reminder Checkboxes */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="font-bold text-slate-700 block">
                  Automatic Daily Reminder Sequence:
                </span>
                <p className="text-[11px] text-slate-500">
                  Select which days before the deadline StudyMate should alert your device:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[5, 4, 3, 2, 1, 0].map((d) => {
                    const isChecked = customDays.includes(d);
                    return (
                      <button
                        type="button"
                        key={d}
                        onClick={() => toggleReminderDay(d)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          isChecked
                            ? 'bg-purple-700 text-white border-purple-700'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {d === 0 ? 'Deadline Day' : `${d} Days Before`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-700 text-white font-semibold hover:bg-purple-800"
                >
                  Schedule Exam Reminders
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
