import React, { useState } from 'react';
import {
  User as UserIcon,
  Upload,
  X,
  Check,
  Sparkles,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar?: string;
  userName: string;
  onSaveAvatar: (avatarDataUrl: string) => void;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  userName,
  onSaveAvatar,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    currentAvatar || '/src/assets/images/student_avatar_user_1793461321943.jpg'
  );
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const defaultPresets = [
    {
      id: 'student_1',
      src: '/src/assets/images/student_avatar_user_1793461321943.jpg',
      label: 'University Scholar',
    },
    {
      id: 'trophy_1',
      src: '/src/assets/images/study_master_trophy_1793461322982.jpg',
      label: 'Excellence Trophy',
    },
    {
      id: 'badge_1',
      src: '/icon.svg',
      label: 'StudyMate Crest',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (PNG, JPG, WebP, etc.).');
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setError('Image file must be under 8MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setSelectedAvatar(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApply = () => {
    onSaveAvatar(selectedAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Choose Profile Picture</h3>
              <p className="text-xs text-slate-500">Pick from your device or use student presets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Current Active Preview */}
        <div className="my-5 flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-purple-50 border-4 border-purple-200 shadow-md relative group">
            {selectedAvatar ? (
              <img
                src={selectedAvatar}
                alt={userName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-purple-700">
                <UserIcon className="w-10 h-10" />
              </div>
            )}
          </div>
          <span className="text-xs font-bold text-slate-800 mt-2">{userName}</span>
          <span className="text-[11px] text-slate-400">Selected Profile Icon</span>
        </div>

        {/* Choice 1: Upload from Device */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-700 block">
            Upload from Your Device:
          </span>
          <label className="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/40 hover:bg-purple-50 hover:border-purple-300 cursor-pointer transition-colors text-purple-900 text-xs font-bold">
            <Upload className="w-4 h-4 text-purple-700" />
            <span>Select Image File from Device</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Choice 2: Preset Academic Avatars */}
        <div className="mt-5 space-y-2.5">
          <span className="text-xs font-bold text-slate-700 block">Or Choose a Preset:</span>
          <div className="grid grid-cols-3 gap-3">
            {defaultPresets.map((preset) => {
              const isSelected = selectedAvatar === preset.src;
              return (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => setSelectedAvatar(preset.src)}
                  className={`p-2 rounded-2xl border text-center transition-all flex flex-col items-center ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-400 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 mb-1 border border-black/5">
                    <img
                      src={preset.src}
                      alt={preset.label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 line-clamp-1">
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
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-purple-700 text-white hover:bg-purple-800 transition-colors shadow-sm"
          >
            Save Avatar
          </button>
        </div>
      </div>
    </div>
  );
};
