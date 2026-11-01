import React from 'react';
import { DeviceMode } from '../types';
import { Laptop, Smartphone } from 'lucide-react';

interface DeviceModeToggleProps {
  deviceMode: DeviceMode;
  onChangeMode: (mode: DeviceMode) => void;
}

export const DeviceModeToggle: React.FC<DeviceModeToggleProps> = ({
  deviceMode,
  onChangeMode,
}) => {
  return (
    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
      <button
        onClick={() => onChangeMode('laptop')}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
          deviceMode === 'laptop'
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
        }`}
        title="Switch to Laptop / Desktop View"
      >
        <Laptop className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Laptop</span>
      </button>

      <button
        onClick={() => onChangeMode('mobile')}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
          deviceMode === 'mobile'
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
        }`}
        title="Switch to Mobile Phone View"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Mobile</span>
      </button>
    </div>
  );
};
