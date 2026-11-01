import React from 'react';
import {
  Sparkles,
  Target,
  CheckSquare,
  Calendar,
  Flame,
  FolderOpen,
  ArrowRight,
  X,
  Compass,
} from 'lucide-react';

interface NewUserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const NewUserGuideModal: React.FC<NewUserGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      step: '01',
      title: 'Set Your Learning Goals & Syllabus',
      description:
        'Enter your subject syllabus, total chapters, and target exam date. StudyMate automatically calculates your daily and weekly chapter requirements.',
      icon: Target,
      tab: 'goals',
      color: 'text-purple-600 bg-purple-50',
    },
    {
      step: '02',
      title: 'Schedule Daily Study Tasks',
      description:
        'Plan daily revision sessions with custom start times, durations, and reminder offsets. Mark them In Progress or Completed as you study.',
      icon: CheckSquare,
      tab: 'tasks',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      step: '03',
      title: 'Add Upcoming Exams & Submissions',
      description:
        'Enter major university exams, project submission dates, and lab vivas. StudyMate will automatically trigger daily alert countdowns starting 5 days prior.',
      icon: Calendar,
      tab: 'exams',
      color: 'text-amber-600 bg-amber-50',
    },
    {
      step: '04',
      title: 'Maintain Consistency on the Heatmap',
      description:
        'Turn your calendar Green by completing scheduled study goals. Avoid Red skipped days to keep your streak and earn study honor badges.',
      icon: Flame,
      tab: 'heatmap',
      color: 'text-rose-600 bg-rose-50',
    },
    {
      step: '05',
      title: 'Vault Notes, PDFs & Certificates',
      description:
        'Keep subject lecture notes, cheatsheets, and academic certificates organized in one private, secure vault.',
      icon: FolderOpen,
      tab: 'documents',
      color: 'text-emerald-600 bg-emerald-50',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-200">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>New Student Welcome Guide</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold mt-1">
            Welcome to StudyMate!
          </h2>
          <p className="text-xs sm:text-sm text-purple-100 mt-1 max-w-md">
            Here is how to get the most out of your smart academic productivity system:
          </p>
        </div>

        {/* Steps List */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1 text-left">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="p-3.5 rounded-2xl border border-slate-200/80 hover:border-purple-300 bg-white shadow-2xs flex items-start gap-3.5 transition-all group"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                      {item.step}. {item.title}
                    </span>
                    <button
                      onClick={() => {
                        onNavigateTab(item.tab);
                        onClose();
                      }}
                      className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-0.5 opacity-90 group-hover:opacity-100"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-purple-600" />
            <span>You can revisit this guide anytime in Settings</span>
          </span>

          <button
            onClick={() => {
              onNavigateTab('goals');
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 transition-colors shadow-xs"
          >
            Start with Learning Goals
          </button>
        </div>
      </div>
    </div>
  );
};
