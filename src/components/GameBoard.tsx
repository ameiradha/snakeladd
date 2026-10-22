import React, { useMemo } from 'react';
import { Team } from '../types';
import { LADDERS, SNAKES, getSquareCoordinates } from '../game/constants';

interface GameBoardProps {
  teams: Team[];
  activeTeamIndex: number;
  activeEncounter: { type: 'snake' | 'ladder'; from: number; to: number } | null;
  onSquareClick?: (squareNumber: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  teams,
  activeTeamIndex,
  activeEncounter,
  onSquareClick,
}) => {
  // Map teams by current square
  const teamsBySquare = useMemo(() => {
    const map = new Map<number, Team[]>();
    teams.forEach((t) => {
      const list = map.get(t.currentSquare) || [];
      list.push(t);
      map.set(t.currentSquare, list);
    });
    return map;
  }, [teams]);

  // Generate 100 squares in order from row 0 (top, 91-100) to row 9 (bottom, 1-10)
  const squares = useMemo(() => {
    const list: { num: number; row: number; col: number }[] = [];
    for (let num = 1; num <= 100; num++) {
      const { row, col } = getSquareCoordinates(num);
      list.push({ num, row, col });
    }
    return list;
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-140px)] max-h-[780px] aspect-square mx-auto select-none rounded-3xl p-2 sm:p-3 bg-white border-2 border-slate-200 shadow-xl flex flex-col justify-center">
      {/* 10x10 Grid container */}
      <div className="relative w-full h-full grid grid-cols-10 grid-rows-10 rounded-2xl overflow-hidden border-2 border-slate-300 bg-white shadow-inner">
        {squares.map(({ num, row, col }) => {
          const squareTeams = teamsBySquare.get(num) || [];
          const hasLadderStart = LADDERS.find((l) => l.start === num);
          const hasLadderEnd = LADDERS.find((l) => l.end === num);
          const hasSnakeStart = SNAKES.find((s) => s.start === num);
          const hasSnakeEnd = SNAKES.find((s) => s.end === num);

          const isStart = num === 1;
          const isFinish = num === 100;

          // Checkerboard in bright educational pastel tones
          const isAlternate = (row + col) % 2 === 1;

          return (
            <div
              key={num}
              onClick={() => onSquareClick && onSquareClick(num)}
              style={{
                gridRowStart: row + 1,
                gridColumnStart: col + 1,
              }}
              className={`relative flex flex-col justify-between p-1 sm:p-1.5 border border-slate-200 transition-colors ${
                isFinish
                  ? 'bg-gradient-to-br from-amber-200 via-yellow-100 to-amber-200 border-amber-400 font-black'
                  : isStart
                  ? 'bg-gradient-to-br from-emerald-200 via-teal-100 to-emerald-200 border-emerald-400 font-black'
                  : hasSnakeStart
                  ? 'bg-rose-50/70'
                  : hasLadderStart
                  ? 'bg-amber-50/70'
                  : isAlternate
                  ? 'bg-sky-50/50'
                  : 'bg-white'
              }`}
            >
              {/* Square Number */}
              <div className="flex items-center justify-between z-10 pointer-events-none">
                <span
                  className={`text-xs sm:text-sm md:text-base font-black tabular-nums px-1.5 py-0.5 rounded ${
                    isFinish
                      ? 'text-amber-900 bg-amber-300/80'
                      : isStart
                      ? 'text-emerald-900 bg-emerald-300/80'
                      : 'text-slate-700 bg-slate-100/90'
                  }`}
                >
                  {num}
                </span>

                {/* Badges for endpoints */}
                {isFinish && (
                  <span className="text-[10px] sm:text-xs font-black text-amber-900 uppercase tracking-tighter bg-amber-300 px-1 rounded shadow-xs">
                    🏆 FINISH
                  </span>
                )}
                {isStart && (
                  <span className="text-[9px] sm:text-[10px] font-black text-emerald-900 uppercase tracking-tighter bg-emerald-300 px-1 rounded shadow-xs">
                    START
                  </span>
                )}
                {hasLadderStart && (
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-amber-800 bg-amber-200 px-1 rounded shadow-xs flex items-center gap-0.5">
                    🪜 &rarr;{hasLadderStart.end}
                  </span>
                )}
                {hasSnakeStart && (
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-rose-800 bg-rose-200 px-1 rounded shadow-xs flex items-center gap-0.5">
                    🐍 &darr;{hasSnakeStart.end}
                  </span>
                )}
              </div>

              {/* Tokens clustered inside square */}
              <div className="relative flex flex-wrap items-center justify-center gap-1 z-20 my-auto">
                {squareTeams.map((t) => {
                  const isActive = teams[activeTeamIndex]?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      title={`${t.name} (Petak ${t.currentSquare})`}
                      style={{
                        backgroundColor: t.color,
                        boxShadow: isActive
                          ? `0 0 14px 4px ${t.color}, 0 0 4px #000000`
                          : '0 2px 6px rgba(0,0,0,0.3)',
                      }}
                      className={`relative flex items-center justify-center rounded-full text-white cursor-pointer transition-transform ${
                        squareTeams.length > 4
                          ? 'w-5 h-5 text-xs'
                          : squareTeams.length > 2
                          ? 'w-6 h-6 sm:w-7 sm:h-7 text-sm'
                          : 'w-7 h-7 sm:w-9 sm:h-9 text-base sm:text-lg'
                      } ${isActive ? 'scale-125 ring-3 ring-amber-400 z-30 animate-bounce' : 'hover:scale-110'}`}
                    >
                      <span className="select-none leading-none drop-shadow-md">
                        {t.icon}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Endpoint target helper label */}
              {hasLadderEnd && squareTeams.length === 0 && (
                <div className="text-[9px] font-bold text-amber-700 text-right z-0 pointer-events-none">
                  ▲ Tangga
                </div>
              )}
              {hasSnakeEnd && squareTeams.length === 0 && (
                <div className="text-[9px] font-bold text-rose-700 text-right z-0 pointer-events-none">
                  ▼ Ekor Ular
                </div>
              )}
            </div>
          );
        })}

        {/* SVG Overlay for Snakes and Ladders Curves */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-15"
          viewBox="0 0 1000 1000"
        >
          <defs>
            <linearGradient id="ladderRail" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#f59e0b" />
              <stop offset="100%" stop-color="#b45309" />
            </linearGradient>
            <linearGradient id="snakeBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ef4444" />
              <stop offset="50%" stop-color="#10b981" />
              <stop offset="100%" stop-color="#059669" />
            </linearGradient>
            <filter id="glowDrop" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Render Ladders */}
          {LADDERS.map((ladder) => {
            const fromCoord = getSquareCoordinates(ladder.start);
            const toCoord = getSquareCoordinates(ladder.end);

            const x1 = fromCoord.xPercent * 10;
            const y1 = fromCoord.yPercent * 10;
            const x2 = toCoord.xPercent * 10;
            const y2 = toCoord.yPercent * 10;

            const dx = x2 - x1;
            const dy = y2 - y1;
            const len = Math.sqrt(dx * dx + dy * dy);
            const rungs = Math.max(3, Math.floor(len / 45));

            // Perpendicular offset for double rail
            const offsetX = (-dy / len) * 15;
            const offsetY = (dx / len) * 15;

            const isHighlighted =
              activeEncounter &&
              activeEncounter.type === 'ladder' &&
              activeEncounter.from === ladder.start;

            return (
              <g
                key={`ladder_${ladder.start}_${ladder.end}`}
                filter="url(#glowDrop)"
                className={isHighlighted ? 'animate-pulse' : 'opacity-90'}
              >
                {/* Left rail */}
                <line
                  x1={x1 - offsetX}
                  y1={y1 - offsetY}
                  x2={x2 - offsetX}
                  y2={y2 - offsetY}
                  stroke={isHighlighted ? '#f59e0b' : 'url(#ladderRail)'}
                  strokeWidth={isHighlighted ? 10 : 7}
                  strokeLinecap="round"
                />
                {/* Right rail */}
                <line
                  x1={x1 + offsetX}
                  y1={y1 + offsetY}
                  x2={x2 + offsetX}
                  y2={y2 + offsetY}
                  stroke={isHighlighted ? '#f59e0b' : 'url(#ladderRail)'}
                  strokeWidth={isHighlighted ? 10 : 7}
                  strokeLinecap="round"
                />
                {/* Rungs */}
                {Array.from({ length: rungs }).map((_, i) => {
                  const t = (i + 1) / (rungs + 1);
                  const rx1 = x1 - offsetX + dx * t;
                  const ry1 = y1 - offsetY + dy * t;
                  const rx2 = x1 + offsetX + dx * t;
                  const ry2 = y1 + offsetY + dy * t;
                  return (
                    <line
                      key={i}
                      x1={rx1}
                      y1={ry1}
                      x2={rx2}
                      y2={ry2}
                      stroke="#d97706"
                      strokeWidth={isHighlighted ? 7 : 5}
                      strokeLinecap="round"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Render Snakes */}
          {SNAKES.map((snake) => {
            const fromCoord = getSquareCoordinates(snake.start);
            const toCoord = getSquareCoordinates(snake.end);

            const xHead = fromCoord.xPercent * 10;
            const yHead = fromCoord.yPercent * 10;
            const xTail = toCoord.xPercent * 10;
            const yTail = toCoord.yPercent * 10;

            const midX = (xHead + xTail) / 2;
            const midY = (yHead + yTail) / 2;

            // S-curve control points
            const curveFactor = 65;
            const c1x = xHead + (midX - xHead) * 0.5 + curveFactor;
            const c1y = yHead + (midY - yHead) * 0.5 - curveFactor;
            const c2x = midX + (xTail - midX) * 0.5 - curveFactor;
            const c2y = midY + (yTail - midY) * 0.5 + curveFactor;

            const pathData = `M ${xHead} ${yHead} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${xTail} ${yTail}`;

            const isHighlighted =
              activeEncounter &&
              activeEncounter.type === 'snake' &&
              activeEncounter.from === snake.start;

            return (
              <g
                key={`snake_${snake.start}_${snake.end}`}
                filter="url(#glowDrop)"
                className={isHighlighted ? 'animate-pulse' : 'opacity-90'}
              >
                {/* Outer shadow/outline */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="#334155"
                  strokeWidth={isHighlighted ? 20 : 16}
                  strokeLinecap="round"
                />
                {/* Snake body */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isHighlighted ? '#f43f5e' : 'url(#snakeBody)'}
                  strokeWidth={isHighlighted ? 16 : 12}
                  strokeLinecap="round"
                />
                {/* Snake head circle with eyes */}
                <circle cx={xHead} cy={yHead} r={13} fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                <circle cx={xHead - 4} cy={yHead - 3} r={3} fill="#ffffff" />
                <circle cx={xHead + 4} cy={yHead - 3} r={3} fill="#ffffff" />
                <circle cx={xHead - 4} cy={yHead - 3} r={1.5} fill="#0f172a" />
                <circle cx={xHead + 4} cy={yHead - 3} r={1.5} fill="#0f172a" />
                {/* Snake tongue */}
                <path d={`M ${xHead} ${yHead - 13} L ${xHead - 3} ${yHead - 20} M ${xHead} ${yHead - 13} L ${xHead + 3} ${yHead - 20}`} stroke="#ef4444" strokeWidth="2" />
                {/* Snake tail tip */}
                <circle cx={xTail} cy={yTail} r={5} fill="#047857" stroke="#ffffff" strokeWidth="1.5" />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
