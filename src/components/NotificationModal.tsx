import React, { useState } from 'react';
import { NotificationItem } from '../types';
import {
  Bell,
  CheckCircle2,
  Clock,
  Calendar,
  X,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  CalendarClock,
  ShieldCheck,
} from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onAction: (
    id: string,
    action: 'snooze' | 'dismiss' | 'complete' | 'reschedule',
    meta?: any
  ) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onAction,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'system-info'>('all');
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('11:00');

  if (!isOpen) return null;

  const browserSupportsPush = typeof window !== 'undefined' && 'Notification' in window;
  const permissionStatus = browserSupportsPush ? Notification.permission : 'unsupported';

  const filteredNotifs = notifications.filter((n) => {
    if (activeTab === 'unread') return n.status === 'unread';
    return true;
  });

  const handleRescheduleSubmit = (id: string) => {
    if (!rescheduleDate) return;
    onAction(id, 'reschedule', { rescheduleDate, rescheduleTime });
    setReschedulingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Notification & Reminder Center</h3>
              <p className="text-xs text-slate-500">Scheduled study alerts, countdowns & follow-ups</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Security Status Notice */}
        <div className="bg-slate-50/80 px-6 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Zero-Permission Dispatch Active:</strong> In-app reminders & audio chime running.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('system-info')}
            className="text-purple-700 hover:text-purple-800 font-semibold underline text-[11px]"
          >
            Protocol Info
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 px-6 pt-3 shrink-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'all'
                ? 'bg-purple-100 text-purple-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Alerts ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'unread'
                ? 'bg-purple-100 text-purple-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Unread ({notifications.filter((n) => n.status === 'unread').length})
          </button>
          <button
            onClick={() => setActiveTab('system-info')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'system-info'
                ? 'bg-purple-100 text-purple-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Browser Push Architecture
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {activeTab === 'system-info' ? (
            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100">
                <h4 className="text-sm font-bold text-purple-950 flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-purple-700" />
                  W3C Web Push & Notification Policy
                </h4>
                <p>
                  As mandated by modern W3C browser security standards (Chrome, Safari, Firefox),
                  native operating-system level notifications require an intentional user interaction.
                  StudyMate strictly complies with this standard and will <strong>never</strong> trigger
                  unsolicited permission popups or break browser policies.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-mono text-slate-400">BROWSER PERMISSION</span>
                  <p className="font-semibold text-slate-800 text-sm capitalize mt-0.5">
                    {permissionStatus}
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-mono text-slate-400">SERVICE WORKER ENGINE</span>
                  <p className="font-semibold text-emerald-700 text-sm mt-0.5">
                    Active (`/public/sw.js`)
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <h5 className="font-semibold text-slate-800">Supported In-App Capabilities:</h5>
                <ul className="list-disc pl-4 space-y-1 text-slate-500">
                  <li>Scheduled task start time & deadline triggers</li>
                  <li>Overdue task follow-up reminders with persistent tray badge</li>
                  <li>Snooze with customizable delay (15m, 1 hour)</li>
                  <li>In-place task rescheduling with calendar time sync</li>
                  <li>Safe dismissal without accidentally marking tasks as finished</li>
                </ul>
              </div>
            </div>
          ) : filteredNotifs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No active notifications</p>
              <p className="text-xs text-slate-400 mt-1">You are all caught up on your study schedule!</p>
            </div>
          ) : (
            filteredNotifs.map((n) => {
              const isOverdue = n.type === 'task_overdue';
              const isExam = n.type === 'exam_countdown';

              return (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border transition-all ${
                    n.status === 'unread'
                      ? 'border-purple-200 bg-purple-50/20 shadow-xs'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                          isExam
                            ? 'bg-amber-100 text-amber-800'
                            : isOverdue
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {isExam ? (
                          <Calendar className="w-4 h-4" />
                        ) : isOverdue ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                          {n.status === 'snoozed' && (
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                              Snoozed
                            </span>
                          )}
                          {n.status === 'completed' && (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              Completed
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                        <span className="text-[11px] text-slate-400 mt-1.5 block">
                          Scheduled: {new Date(n.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(n.scheduledTime).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rescheduling Form Drawer */}
                  {reschedulingId === n.id ? (
                    <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                      <span className="text-xs font-bold text-slate-700">Reschedule Task</span>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={rescheduleDate}
                          onChange={(e) => setRescheduleDate(e.target.value)}
                          className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                        />
                        <input
                          type="time"
                          value={rescheduleTime}
                          onChange={(e) => setRescheduleTime(e.target.value)}
                          className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => setReschedulingId(null)}
                          className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleRescheduleSubmit(n.id)}
                          className="px-3 py-1 text-xs font-semibold rounded bg-purple-700 text-white hover:bg-purple-800"
                        >
                          Save New Time
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Action Buttons */
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-end gap-1.5">
                      <button
                        onClick={() => onAction(n.id, 'complete')}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Mark task as completed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Done</span>
                      </button>

                      <button
                        onClick={() => onAction(n.id, 'snooze', { snoozeMinutes: 15 })}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Snooze reminder for 15 minutes"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Snooze 15m</span>
                      </button>

                      <button
                        onClick={() => {
                          setReschedulingId(n.id);
                          setRescheduleDate(new Date().toISOString().split('T')[0]);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Change scheduled date/time"
                      >
                        <CalendarClock className="w-3.5 h-3.5" />
                        <span>Reschedule</span>
                      </button>

                      <button
                        onClick={() => onAction(n.id, 'dismiss')}
                        className="px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Dismiss alert without marking task completed"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
