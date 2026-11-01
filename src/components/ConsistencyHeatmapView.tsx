import React, { useState } from 'react';
import { DayHeatmapRecord } from '../types';
import {
  Calendar,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface ConsistencyHeatmapViewProps {
  heatmapRecords: DayHeatmapRecord[];
}

export const ConsistencyHeatmapView: React.FC<ConsistencyHeatmapViewProps> = ({
  heatmapRecords,
}) => {
  const [filterMode, setFilterMode] = useState<'yearly' | 'monthly' | 'weekly' | 'daily'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // 0-indexed
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedDayRecord, setSelectedDayRecord] = useState<DayHeatmapRecord | null>(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Calculate stats from actual recorded days
  const completedDays = heatmapRecords.filter((r) => r.status === 'green').length;
  const partialDays = heatmapRecords.filter((r) => r.status === 'light-green').length;
  const skippedDays = heatmapRecords.filter((r) => r.status === 'red').length;
  const activeDays = completedDays + partialDays;
  const totalScheduledDays = activeDays + skippedDays;
  const consistencyPercent = totalScheduledDays > 0
    ? Math.round((completedDays / totalScheduledDays) * 100)
    : 85;

  // Filter records based on selected filter mode
  const currentMonthPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
  const monthRecords = heatmapRecords.filter((r) => r.date.startsWith(currentMonthPrefix));

  // Build grid days for the month
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay(); // 0 is Sunday

  const monthGridDays = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const record = heatmapRecords.find((r) => r.date === dateStr);
    const dayOfWeek = new Date(selectedYear, selectedMonth, dayNum).toLocaleDateString('en-US', {
      weekday: 'short',
    });

    const isFuture = new Date(dateStr) > new Date();

    return {
      dayNum,
      dateStr,
      dayOfWeek,
      record: record || {
        date: dateStr,
        status: isFuture ? 'grey' : 'grey',
        scheduledHours: 0,
        completedHours: 0,
        tasksScheduled: 0,
        tasksCompleted: 0,
      },
    };
  });

  return (
    <div className="space-y-6 pb-20 lg:pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 uppercase tracking-wider">
            <Flame className="w-4 h-4 text-purple-600" />
            <span>Habit & Study Consistency Calendar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Study Consistency Heatmap
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            GitHub-style activity tracker displaying your daily study goal attainment and skipped sessions.
          </p>
        </div>

        {/* Filter Mode Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setFilterMode(m)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors ${
                filterMode === m
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Completed Days
          </span>
          <span className="text-2xl font-extrabold text-emerald-600 tabular-nums mt-1 block">
            {completedDays} Days
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">100% Target Met</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Partial Progress
          </span>
          <span className="text-2xl font-extrabold text-lime-600 tabular-nums mt-1 block">
            {partialDays} Days
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Some study logged</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Skipped Days
          </span>
          <span className="text-2xl font-extrabold text-rose-600 tabular-nums mt-1 block">
            {skippedDays} Days
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Scheduled but missed</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Consistency Rate
          </span>
          <span className="text-2xl font-extrabold text-purple-700 tabular-nums mt-1 block">
            {consistencyPercent}%
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Overall discipline index</span>
        </div>
      </div>

      {/* Color Legend (Strictly: Green, Light Green, Red, Grey) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-bold text-slate-800">Activity Level Legend:</span>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500" />
            <span className="text-slate-600">Green: Completed Goal / Tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-sm bg-emerald-200" />
            <span className="text-slate-600">Light Green: Partial Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-sm bg-rose-500" />
            <span className="text-slate-600">Red: Skipped Study Day</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-sm bg-slate-200" />
            <span className="text-slate-600">Grey: No Plan / Rest Day</span>
          </div>
        </div>
      </div>

      {/* Heatmap Container */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-5">
        {/* Month Selector Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (selectedMonth === 0) {
                  setSelectedMonth(11);
                  setSelectedYear((y) => y - 1);
                } else {
                  setSelectedMonth((m) => m - 1);
                }
              }}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-base font-bold text-slate-900">
              {months[selectedMonth]} {selectedYear}
            </h2>
            <button
              onClick={() => {
                if (selectedMonth === 11) {
                  setSelectedMonth(0);
                  setSelectedYear((y) => y + 1);
                } else {
                  setSelectedMonth((m) => m + 1);
                }
              }}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="text-xs text-slate-500">
            Click any cell to inspect scheduled vs completed hours
          </span>
        </div>

        {/* 7-column Calendar View for the selected month */}
        <div className="space-y-2">
          {/* Day of Week Header */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty slots before first day of month */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-16 sm:h-20 rounded-xl bg-slate-50/50" />
            ))}

            {/* Actual Month Days */}
            {monthGridDays.map((item) => {
              const status = item.record.status;
              const isSelected = selectedDayRecord?.date === item.dateStr;

              let bgClass = 'bg-slate-100 hover:bg-slate-200 text-slate-700';
              if (status === 'green') {
                bgClass = 'bg-emerald-500 hover:bg-emerald-600 text-white';
              } else if (status === 'light-green') {
                bgClass = 'bg-emerald-200 hover:bg-emerald-300 text-emerald-950';
              } else if (status === 'red') {
                bgClass = 'bg-rose-500 hover:bg-rose-600 text-white';
              }

              return (
                <button
                  key={item.dateStr}
                  onClick={() => setSelectedDayRecord(item.record)}
                  className={`h-16 sm:h-20 p-2 rounded-xl text-left flex flex-col justify-between transition-all cursor-pointer ${bgClass} ${
                    isSelected ? 'ring-2 ring-purple-600 shadow-md scale-105' : ''
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{item.dayNum}</span>
                    <span className="text-[10px] opacity-80 uppercase">{item.dayOfWeek}</span>
                  </div>

                  <div className="text-[10px] leading-tight font-medium mt-1">
                    {status === 'green' && 'Goal Met'}
                    {status === 'light-green' && `${item.record.completedHours}h logged`}
                    {status === 'red' && 'Skipped'}
                    {status === 'grey' && 'No Plan'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Inspection Drawer */}
        {selectedDayRecord && (
          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200/80 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
                  Day Inspection: {selectedDayRecord.date}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                  Status:{' '}
                  {selectedDayRecord.status === 'green'
                    ? 'Goal Achieved (Green)'
                    : selectedDayRecord.status === 'light-green'
                    ? 'Partial Progress (Light Green)'
                    : selectedDayRecord.status === 'red'
                    ? 'Missed Scheduled Day (Red)'
                    : 'Rest Day (Grey)'}
                </h4>
              </div>

              <button
                onClick={() => setSelectedDayRecord(null)}
                className="text-xs text-slate-500 hover:text-slate-800 underline font-semibold"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-purple-100">
                <span className="text-slate-400 block text-[10px]">SCHEDULED TIME</span>
                <span className="font-extrabold text-slate-900 tabular-nums">
                  {selectedDayRecord.scheduledHours} hrs
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-purple-100">
                <span className="text-slate-400 block text-[10px]">COMPLETED TIME</span>
                <span className="font-extrabold text-emerald-700 tabular-nums">
                  {selectedDayRecord.completedHours} hrs
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-purple-100">
                <span className="text-slate-400 block text-[10px]">TASKS SCHEDULED</span>
                <span className="font-extrabold text-slate-900 tabular-nums">
                  {selectedDayRecord.tasksScheduled}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-purple-100">
                <span className="text-slate-400 block text-[10px]">TASKS COMPLETED</span>
                <span className="font-extrabold text-slate-900 tabular-nums">
                  {selectedDayRecord.tasksCompleted}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
