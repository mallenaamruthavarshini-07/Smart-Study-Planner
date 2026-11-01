import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/90 text-slate-800 border border-slate-200/80 shadow-xs hover:bg-white transition-all whitespace-nowrap"
        title="Install StudyMate to your home screen or desktop"
      >
        <Download className="w-3.5 h-3.5 text-indigo-600" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white/80 text-slate-700 border border-slate-200/70 hover:bg-white transition-all whitespace-nowrap"
          title="Install on iOS Safari"
        >
          <Smartphone className="w-3.5 h-3.5 text-slate-500" />
          <span>Add to Home</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-900">Install on iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <span>1. Tap the <strong>Share</strong> icon (square with arrow up) in Safari.</span>
                <br />
                <span>2. Scroll down and select <strong>Add to Home Screen</strong>.</span>
                <br />
                <span>3. Tap <strong>Add</strong> to use StudyMate as an offline-ready app.</span>
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl py-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
