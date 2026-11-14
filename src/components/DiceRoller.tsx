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
      <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-20 lg:h-20 xl:w-24 xl:h-24 bg-white rounded-2xl lg:rounded-3xl shadow-lg border-2 lg:border-4 border-slate-300 p-1.5 sm:p-2 lg:p-3 grid grid-cols-3 grid-rows-3 gap-0.5 lg:gap-1 select-none transform transition-transform duration-200 ring-2 lg:ring-4 ring-amber-300/40 shrink-0">
        <div className="flex items-center justify-center">
          {hasTopLeft && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4 rounded-full bg-slate-900 shadow-inner" />}
        </div>
        <div className="flex items-center justify-center"></div>
        <div className="flex items-center justify-center">
          {hasTopRight && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4 rounded-full bg-slate-900 shadow-inner" />}
        </div>

        <div className="flex items-center justify-center">
          {hasMidLeft && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4 rounded-full bg-slate-900 shadow-inner" />}
        </div>
        <div className="flex items-center justify-center">
          {hasCenter && (
            <div
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 rounded-full shadow-inner ${
                num === 1 ? 'bg-rose-600 scale-125' : 'bg-slate-900'
              }`}
            />
          )}
        </div>
        <div className="flex items-center justify-center">
          {hasMidRight && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4 rounded-full bg-slate-900 shadow-inner" />}
        </div>

        <div className="flex items-center justify-center">
          {hasBottomLeft && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4 rounded-full bg-slate-900 shadow-inner" />}
        </div>
        <div className="flex items-center justify-center"></div>
        <div className="flex items-center justify-center">
          {hasBottomRight && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4 rounded-full bg-slate-900 shadow-inner" />}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-2.5 lg:gap-2 p-2 sm:p-2.5 lg:p-3.5 bg-white rounded-2xl lg:rounded-3xl border-2 border-slate-200 shadow-md lg:shadow-xl">
      <div className="hidden lg:block text-center w-full">
        <span className="text-[11px] font-black text-slate-500 block uppercase tracking-wider">
          GILIRAN KUMPULAN SEKARANG
        </span>
        <span
          className="text-lg xl:text-xl font-black truncate max-w-full block mt-0.5"
          style={{ color: activeTeamColor }}
        >
          {activeTeamName}
        </span>
      </div>

      {/* Animated Dice */}
      <div
        className={`relative transition-all duration-300 shrink-0 ${
          isRolling ? 'rotate-180 scale-110 filter drop-shadow(0 0 16px rgba(245,158,11,0.8))' : 'hover:scale-105'
        }`}
      >
        {renderPips(displayValue)}
      </div>

      {/* Mobile / Compact Info + Roll Button */}
      <div className="flex-1 lg:w-full flex flex-col gap-1 min-w-0">
        <div className="flex lg:hidden items-center justify-between gap-2 min-w-0">
          <span
            className="text-xs sm:text-sm font-black truncate"
            style={{ color: activeTeamColor }}
          >
            {activeTeamName}
          </span>
          {value && !isRolling && (
            <span className="text-[11px] font-black text-amber-600 tabular-nums shrink-0">
              Dadu: {value}
            </span>
          )}
        </div>

        {/* Large Roll Action Button */}
        <button
          type="button"
          disabled={disabled || isRolling}
          onClick={onRoll}
          className={`w-full py-2 sm:py-2.5 lg:py-3 px-3 lg:px-5 rounded-xl lg:rounded-2xl font-black text-xs sm:text-sm lg:text-base tracking-wider shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            disabled || isRolling
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200'
              : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 hover:shadow-lg hover:shadow-amber-500/25 cursor-pointer active:scale-95 ring-2 ring-amber-400/80'
          }`}
        >
          <Dices className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${isRolling ? 'animate-spin' : ''}`} />
          <span>{isRolling ? 'MELEMPAR...' : 'LEMPAR DADU'}</span>
        </button>
      </div>

      {value && !isRolling && (
        <div className="hidden lg:block text-xs xl:text-sm font-bold text-slate-700">
          Mata Dadu: <span className="text-amber-600 font-black text-base xl:text-lg tabular-nums ml-1">{value} Langkah</span>
        </div>
      )}
    </div>
  );
};
