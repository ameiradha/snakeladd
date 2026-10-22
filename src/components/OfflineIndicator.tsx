import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-xl bg-amber-500 text-slate-950 px-3.5 py-2 text-xs font-bold shadow-xl border border-amber-400">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Offline Mode — All cached quizzes and game boards are fully playable.</span>
    </div>
  );
};
