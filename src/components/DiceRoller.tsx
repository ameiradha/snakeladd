import React, { useState, useEffect } from 'react';
import { Dices } from 'lucide-react';

interface DiceRollerProps {
  value: number | null;
  isRolling: boolean;
  disabled: boolean;
  onRoll: () => void;
  activeTeamName: string;
  activeTeamColor: string;
}

export const DiceRoller: React.FC<DiceRollerProps> = ({
  value,
  isRolling,
  disabled,
  onRoll,
  activeTeamName,
  activeTeamColor,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value || 1);

  // Animate through numbers while rolling
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRolling) {
      interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 70);
    } else if (value) {
      setDisplayValue(value);
    }
    return () => clearInterval(interval);
  }, [isRolling, value]);

  // Large Dice Pip renderer
  const renderPips = (num: number) => {
    const hasTopLeft = [2, 3, 4, 5, 6].includes(num);
    const hasTopRight = [4, 5, 6].includes(num);
    const hasMidLeft = num === 6;
    const hasCenter = [1, 3, 5].includes(num);
    const hasMidRight = num === 6;
    const hasBottomLeft = [4, 5, 6].includes(num);
    const hasBottomRight = [2, 3, 4, 5, 6].includes(num);

    return (
      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-3xl shadow-2xl border-4 border-slate-300 p-3 sm:p-4 grid grid-cols-3 grid-rows-3 gap-1.5 select-none transform transition-transform duration-200 ring-4 ring-amber-300/40">
        <div className="flex items-center justify-center">
          {hasTopLeft && <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-900 shadow-inner" />}
        </div>
        <div className="flex items-center justify-center"></div>
        <div className="flex items-center justify-center">
          {hasTopRight && <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-900 shadow-inner" />}
        </div>

        <div className="flex items-center justify-center">
          {hasMidLeft && <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-900 shadow-inner" />}
        </div>
        <div className="flex items-center justify-center">
          {hasCenter && (
            <div
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full shadow-inner ${
                num === 1 ? 'bg-rose-600 scale-125' : 'bg-slate-900'
              }`}
            />
          )}
        </div>
        <div className="flex items-center justify-center">
          {hasMidRight && <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-900 shadow-inner" />}
        </div>

        <div className="flex items-center justify-center">
          {hasBottomLeft && <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-900 shadow-inner" />}
        </div>
        <div className="flex items-center justify-center"></div>
        <div className="flex items-center justify-center">
          {hasBottomRight && <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-900 shadow-inner" />}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4 sm:p-5 bg-white rounded-3xl border-2 border-slate-200 shadow-xl">
      <div className="text-center w-full">
        <span className="text-xs font-black text-slate-500 block uppercase tracking-wider">
          GILIRAN KUMPULAN SEKARANG
        </span>
        <span
          className="text-lg sm:text-2xl font-black truncate max-w-full block mt-0.5"
          style={{ color: activeTeamColor }}
        >
          {activeTeamName}
        </span>
      </div>

      {/* Large 3D Animated Dice */}
      <div
        className={`relative transition-all duration-300 py-1 ${
          isRolling ? 'rotate-180 scale-110 filter drop-shadow(0 0 20px rgba(245,158,11,0.8))' : 'hover:scale-105'
        }`}
      >
        {renderPips(displayValue)}
      </div>

      {/* Large Roll Action Button */}
      <button
        type="button"
        disabled={disabled || isRolling}
        onClick={onRoll}
        className={`w-full py-3.5 sm:py-4 px-6 rounded-2xl font-black text-base sm:text-lg tracking-wider shadow-lg transition-all flex items-center justify-center gap-3 ${
          disabled || isRolling
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200'
            : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 hover:shadow-xl hover:shadow-amber-500/25 cursor-pointer active:scale-95 ring-2 ring-amber-400/80'
        }`}
      >
        <Dices className={`w-6 h-6 sm:w-7 sm:h-7 ${isRolling ? 'animate-spin' : ''}`} />
        <span>{isRolling ? 'SEDANG MELEMPAR...' : 'LEMPAR DADU'}</span>
      </button>

      {value && !isRolling && (
        <div className="text-sm font-bold text-slate-700">
          Mata Dadu: <span className="text-amber-600 font-black text-xl tabular-nums ml-1">{value} Langkah</span>
        </div>
      )}
    </div>
  );
};
