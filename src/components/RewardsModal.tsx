import React from 'react';
import { User } from '../types';
import {
  Award,
  Flame,
  Sparkles,
  CheckCircle2,
  Lock,
  X,
  Star,
  BookCheck,
  Zap,
} from 'lucide-react';
import { triggerCelebration } from '../utils/confetti';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const RewardsModal: React.FC<RewardsModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  if (!isOpen || !user) return null;

  const allBadges = [
    {
      title: 'First Step',
      description: 'Created your first study plan and scheduled tasks on StudyMate.',
      icon: BookCheck,
      unlocked: user.badges?.includes('First Step'),
    },
    {
      title: '7-Day Streak',
      description: 'Maintained uninterrupted study consistency for seven consecutive days.',
      icon: Flame,
      unlocked: user.badges?.includes('7-Day Streak'),
    },
    {
      title: 'Revision Champion',
      description: 'Completed scheduled spaced repetition flashcards and review sessions.',
      icon: Zap,
      unlocked: user.badges?.includes('Revision Champion'),
    },
    {
      title: 'Study Master',
      description: 'Accumulated over 500 XP through sustained academic productivity.',
      icon: Award,
      unlocked: user.badges?.includes('Study Master'),
    },
    {
      title: 'Consistency Star',
      description: 'Achieved 85%+ green days on the GitHub-style consistency heatmap.',
      icon: Star,
      unlocked: user.badges?.includes('Consistency Star') || user.streakDays >= 14,
    },
  ];

  const currentLevel = Math.floor((user.xp || 0) / 100) + 1;
  const progressToNextLevel = (user.xp || 0) % 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Academic Honors & Badges</h3>
              <p className="text-xs text-slate-500">Track streaks, XP milestones, and study honors</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level & Trophy Spotlight Card */}
        <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-200 bg-white/10 px-2 py-0.5 rounded">
                  Level {currentLevel} Scholar
                </span>
                <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  {user.streakDays}-Day Streak
                </span>
              </div>
              <h2 className="text-2xl font-extrabold mt-1">{user.name}</h2>
              <p className="text-xs text-slate-300 mt-0.5 font-mono">{user.xp} Total XP Earned</p>
            </div>

            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/10 border border-white/20 p-1 shrink-0">
              <img
                src="/src/assets/images/study_master_trophy_1793461322982.jpg"
                alt="Honor Trophy"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="mt-4 pt-4 border-t border-white/10 space-y-1.5 relative z-10">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Next Level Progress</span>
              <span className="font-mono">{progressToNextLevel}/100 XP</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-500"
                style={{ width: `${progressToNextLevel}%` }}
              />
            </div>
          </div>
        </div>

        {/* Badges List */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Study Badges Collection
            </h4>
            <button
              onClick={() => triggerCelebration('milestone')}
              className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Celebrate Progress</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {allBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.title}
                  className={`p-3.5 rounded-xl border flex items-start gap-3.5 transition-all ${
                    badge.unlocked
                      ? 'border-purple-200 bg-purple-50/30'
                      : 'border-slate-200 bg-slate-50/50 opacity-60'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      badge.unlocked
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {badge.unlocked ? <Icon className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-slate-900">{badge.title}</h5>
                      {badge.unlocked && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {badge.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
