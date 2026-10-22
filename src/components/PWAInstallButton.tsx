import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-sm transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-amber-500" />
          <span>Pasang / Install PWA</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white border-2 border-slate-200 p-6 shadow-2xl text-slate-900">
              <h3 className="text-base font-black text-slate-900">Pasang di iPad / iPhone</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                1. Tekan butang <strong className="text-amber-600">Share</strong> di palang Safari.<br />
                2. Skrol ke bawah dan pilih <strong className="text-amber-600">Add to Home Screen</strong>.<br />
                3. Buka terus dari skrin utama untuk penggunaan tanpa talian (offline).
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-amber-500 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 cursor-pointer shadow-sm"
              >
                Tutup / Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
