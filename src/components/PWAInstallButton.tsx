import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import type { PWAInstallState } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  installState: PWAInstallState;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ installState }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = installState;
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  if (isInstalled) return null;

  return (
    <>
      <button
        onClick={() => {
          if (isInstallable) {
            void install().catch(() => setShowInstallGuide(true));
          } else {
            setShowInstallGuide(true);
          }
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/90 text-slate-800 border border-slate-200/80 shadow-xs hover:bg-white transition-all whitespace-nowrap"
        title="Install StudyMate to your home screen or desktop"
      >
        {isIOS ? (
          <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
        ) : (
          <Download className="w-3.5 h-3.5 text-indigo-600" />
        )}
        <span>Install App</span>
      </button>

      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">
                {isIOS ? 'Add to Home Screen' : 'Install StudyMate'}
              </h3>
              <button
                onClick={() => setShowInstallGuide(false)}
                aria-label="Close install instructions"
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {isIOS ? (
              <ol className="list-decimal space-y-2 pl-5 text-xs text-slate-600 leading-relaxed">
                <li>Open this page in Safari and tap the Share icon.</li>
                <li>Choose <strong>Add to Home Screen</strong>.</li>
                <li>Tap <strong>Add</strong>.</li>
              </ol>
            ) : isAndroid ? (
              <ol className="list-decimal space-y-2 pl-5 text-xs text-slate-600 leading-relaxed">
                <li>Open this page in Chrome and tap the three-dot menu.</li>
                <li>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
                <li>Confirm the installation.</li>
              </ol>
            ) : (
              <ol className="list-decimal space-y-2 pl-5 text-xs text-slate-600 leading-relaxed">
                <li>Open this page in Chrome or Microsoft Edge.</li>
                <li>Use the install icon in the address bar, or choose <strong>Install StudyMate</strong> from the browser menu.</li>
              </ol>
            )}
            <p className="mt-4 text-xs text-slate-500">
              If the install option is unavailable, open the app using its secure HTTPS link in a supported browser.
            </p>
            <button
              onClick={() => setShowInstallGuide(false)}
              className="mt-5 w-full rounded-xl py-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
