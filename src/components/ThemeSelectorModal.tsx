import React from 'react';
import { ThemeKey } from '../types';
import { Check, Palette, X } from 'lucide-react';

interface ThemeOption {
  key: ThemeKey;
  name: string;
  bgHex: string;
  cardHex: string;
  accentHex: string;
  description: string;
}

export const THEMES: ThemeOption[] = [
  {
    key: 'soft-grey',
    name: 'Slate Grey Night',
    bgHex: '#10151F',
    cardHex: '#1C2432',
    accentHex: '#AAB7CA',
    description: 'A dark slate workspace with a calm silver accent.',
  },
  {
    key: 'light-purple',
    name: 'Light Purple',
    bgHex: '#F1EDFF',
    cardHex: '#FFFFFF',
    accentHex: '#8066C5',
    description: 'Calm academic violet, gentle on the eyes for extended study sessions.',
  },
  {
    key: 'soft-peach',
    name: 'Peach Dusk',
    bgHex: '#1B1215',
    cardHex: '#2A1D22',
    accentHex: '#E7A28D',
    description: 'A dark, warm workspace with a soft peach accent.',
  },
  {
    key: 'lemon-yellow',
    name: 'Golden Night',
    bgHex: '#171509',
    cardHex: '#282414',
    accentHex: '#E6C95C',
    description: 'A dark workspace with a warm golden accent for focused revision.',
  },
  {
    key: 'dark',
    name: 'Midnight Dark',
    bgHex: '#0B0F19',
    cardHex: '#1E293B',
    accentHex: '#818CF8',
    description: 'High-contrast nocturnal mode, comfortable for late-night study and reduced eye strain.',
  },
];

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeKey;
  onSelectTheme: (theme: ThemeKey) => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Study Space Themes</h3>
              <p className="text-xs text-slate-500">Light Purple is the only light theme; all other palettes are dark.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {THEMES.map((theme) => {
            const isSelected = currentTheme === theme.key;
            return (
              <button
                key={theme.key}
                onClick={() => {
                  onSelectTheme(theme.key);
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs border border-black/5"
                    style={{ backgroundColor: theme.bgHex }}
                  >
                    <div
                      className="w-5 h-5 rounded-full shadow-xs"
                      style={{ backgroundColor: theme.accentHex }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{theme.name}</span>
                      <span className="text-[11px] font-mono text-slate-400">{theme.accentHex}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{theme.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-center w-6 h-6 shrink-0">
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Apply Theme
          </button>
        </div>
      </div>
    </div>
  );
};
