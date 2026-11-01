import React, { useState } from 'react';
import { User } from '../types';
import {
  Upload,
  Image as ImageIcon,
  Check,
  X,
  GraduationCap,
  BookOpen,
  Brain,
  Trophy,
  Laptop,
  Flame,
  Coffee,
  Sparkles,
  Camera,
} from 'lucide-react';

interface ProfileAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSaveAvatar: (avatarDataUrl: string) => void;
}

const PRESET_ICONS = [
  { id: 'icon_cap', label: 'Graduate', icon: GraduationCap, bg: 'bg-purple-600' },
  { id: 'icon_book', label: 'Scholar', icon: BookOpen, bg: 'bg-blue-600' },
  { id: 'icon_brain', label: 'Intellect', icon: Brain, bg: 'bg-indigo-600' },
  { id: 'icon_trophy', label: 'Achiever', icon: Trophy, bg: 'bg-amber-600' },
  { id: 'icon_laptop', label: 'Coder', icon: Laptop, bg: 'bg-slate-700' },
  { id: 'icon_flame', label: 'Consistent', icon: Flame, bg: 'bg-rose-600' },
  { id: 'icon_coffee', label: 'Deep Focus', icon: Coffee, bg: 'bg-emerald-600' },
  { id: 'icon_sparkles', label: 'Mastery', icon: Sparkles, bg: 'bg-purple-800' },
];

export const ProfileAvatarModal: React.FC<ProfileAvatarModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveAvatar,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentUser?.avatar || '');
  const [fileError, setFileError] = useState('');

  if (!isOpen) return null;

  const handleDeviceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setFileError('Image size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSaveAvatar(selectedAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Student Profile Avatar</h3>
              <p className="text-xs text-slate-500">Choose an image from your device or pick an icon</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Avatar Preview */}
        <div className="my-5 flex flex-col items-center justify-center space-y-2">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-purple-100 border-4 border-purple-200 shadow-md flex items-center justify-center relative group">
            {selectedAvatar ? (
              selectedAvatar.startsWith('data:image/') || selectedAvatar.startsWith('/') ? (
                <img
                  src={selectedAvatar}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-extrabold text-purple-800">
                  {currentUser?.name?.[0]?.toUpperCase() || 'S'}
                </span>
              )
            ) : (
              <img
                src="/src/assets/images/student_avatar_user_1793461321943.jpg"
                alt="Default User"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <span className="text-xs font-bold text-slate-800">{currentUser?.name}</span>
          <span className="text-[11px] text-slate-400">Preview of your profile badge</span>
        </div>

        {/* 1. Upload From Device */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
            Option 1: Choose Image from Your Device
          </label>

          <label className="flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 border-dashed border-purple-300 hover:border-purple-600 bg-purple-50/40 hover:bg-purple-50/70 text-purple-900 text-xs font-bold cursor-pointer transition-all shadow-2xs">
            <Upload className="w-4 h-4 text-purple-700" />
            <span>Select Photo / Icon from Phone or Laptop</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleDeviceFileUpload}
              className="hidden"
            />
          </label>

          {fileError && (
            <p className="text-xs text-rose-600 font-semibold">{fileError}</p>
          )}
        </div>

        {/* 2. Choose from Presets */}
        <div className="mt-6 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
            Option 2: Select an Academic Avatar Icon
          </label>

          <div className="grid grid-cols-4 gap-3">
            {PRESET_ICONS.map((preset) => {
              const Icon = preset.icon;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    // Create an SVG-like data url or simple preset key
                    setSelectedAvatar(
                      `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%238066C5"/><text x="50" y="58" font-size="34" font-family="sans-serif" font-weight="bold" fill="white" text-anchor="middle">${preset.label[0]}</text></svg>`
                    );
                  }}
                  className="p-2 rounded-2xl border border-slate-200 hover:border-purple-600 hover:bg-purple-50/30 flex flex-col items-center justify-center gap-1 transition-all group"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${preset.bg} text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105`}
                  >
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 truncate max-w-full">
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-purple-700 text-white text-xs font-bold hover:bg-purple-800 transition-colors shadow-xs"
          >
            Save Avatar
          </button>
        </div>
      </div>
    </div>
  );
};
