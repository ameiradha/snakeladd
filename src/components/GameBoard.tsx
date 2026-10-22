import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Team } from '../types';
import { LADDERS, SNAKES, getSquareCoordinates } from '../game/constants';

interface GameBoardProps {
  teams: Team[];
  activeTeamIndex: number;
  activeEncounter: {
    type: 'snake' | 'ladder';
    from: number;
    to: number;
    progress?: number;
  } | null;
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

  // Calculate coordinates for the active gliding token during snake/ladder transit
  const activeGlidingToken = useMemo(() => {
    if (
      !activeEncounter ||
      activeEncounter.progress === undefined ||
      activeEncounter.progress <= 0 ||
      activeEncounter.progress >= 1
    ) {
      return null;
    }
    const activeTeam = teams[activeTeamIndex];
    if (!activeTeam) return null;

    const t = activeEncounter.progress;
    const fromCoord = getSquareCoordinates(activeEncounter.from);
    const toCoord = getSquareCoordinates(activeEncounter.to);

    const x1 = fromCoord.xPercent * 10;
    const y1 = fromCoord.yPercent * 10;
    const x2 = toCoord.xPercent * 10;
    const y2 = toCoord.yPercent * 10;

    let x = x1 + (x2 - x1) * t;
    let y = y1 + (y2 - y1) * t;

    if (activeEncounter.type === 'snake') {
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const curveFactor = 65;
      const c1x = x1 + (midX - x1) * 0.5 + curveFactor;
      const c1y = y1 + (midY - y1) * 0.5 - curveFactor;
      const c2x = midX + (x2 - midX) * 0.5 - curveFactor;
      const c2y = midY + (y2 - midY) * 0.5 + curveFactor;

      const mt = 1 - t;
      x = mt * mt * mt * x1 + 3 * mt * mt * t * c1x + 3 * mt * t * t * c2x + t * t * t * x2;
      y = mt * mt * mt * y1 + 3 * mt * mt * t * c1y + 3 * mt * t * t * c2y + t * t * t * y2;
    }

    return { team: activeTeam, x, y };
  }, [activeEncounter, teams, activeTeamIndex]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth > 0 && clientHeight > 0) {
        // Compute strict square that fits within both available width and height
        const available = Math.min(clientWidth, clientHeight);
        setBoardSize(Math.floor(available));
      }
    };

    updateSize();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateSize();
      });
      resizeObserver.observe(container);
    }

    window.addEventListener('resize', updateSize);
    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center min-h-0 min-w-0 overflow-hidden p-1"
    >
      <div
        style={boardSize ? { width: `${boardSize}px`, height: `${boardSize}px` } : undefined}
        className="relative max-w-full max-h-full aspect-square select-none rounded-3xl p-1.5 sm:p-2.5 bg-white border-2 border-slate-200 shadow-xl flex flex-col justify-center"
      >
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

          // Encounter highlight
          const isEncounterFrom = activeEncounter && activeEncounter.from === num;
          const isEncounterTo = activeEncounter && activeEncounter.to === num;

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
              className={`relative flex flex-col justify-between p-1 sm:p-1.5 border transition-all cursor-pointer ${
                isEncounterFrom
                  ? 'bg-rose-200 border-4 border-rose-600 ring-4 ring-rose-400 z-30 scale-105 shadow-xl animate-pulse'
                  : isEncounterTo
                  ? 'bg-emerald-200 border-4 border-emerald-600 ring-4 ring-emerald-400 z-30 scale-105 shadow-xl animate-pulse'
                  : isFinish
                  ? 'bg-gradient-to-br from-amber-200 via-yellow-100 to-amber-200 border-2 border-amber-400 font-black'
                  : isStart
                  ? 'bg-gradient-to-br from-emerald-200 via-teal-100 to-emerald-200 border-2 border-emerald-400 font-black'
                  : hasSnakeStart
                  ? 'bg-rose-100/90 border-2 border-rose-500 shadow-xs'
                  : hasLadderStart
                  ? 'bg-amber-100/90 border-2 border-amber-500 shadow-xs'
                  : hasSnakeEnd
                  ? 'bg-emerald-50/80 border-dashed border-2 border-emerald-400'
                  : hasLadderEnd
                  ? 'bg-yellow-50/80 border-dashed border-2 border-amber-400'
                  : isAlternate
                  ? 'bg-sky-50/50 border-slate-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              {/* Square Header: Number + Endpoint Badge */}
              <div className="flex items-center justify-between z-10 pointer-events-none">
                <span
                  className={`text-xs sm:text-sm md:text-base font-black tabular-nums px-1.5 py-0.5 rounded shadow-xs ${
                    isEncounterFrom || isEncounterTo
                      ? 'text-white bg-slate-900'
                      : isFinish
                      ? 'text-amber-950 bg-amber-300'
                      : isStart
                      ? 'text-emerald-950 bg-emerald-300'
                      : hasSnakeStart
                      ? 'text-rose-950 bg-rose-300 border border-rose-400'
                      : hasLadderStart
                      ? 'text-amber-950 bg-amber-300 border border-amber-400'
                      : 'text-slate-800 bg-slate-100'
                  }`}
                >
                  {num}
                </span>

                {/* Prominent High-Contrast Badges */}
                {isFinish && (
                  <span className="text-[10px] sm:text-xs font-black text-amber-900 uppercase tracking-tighter bg-amber-300 px-1.5 py-0.5 rounded shadow-xs">
                    🏆 MENANG
                  </span>
                )}
                {isStart && (
                  <span className="text-[10px] sm:text-xs font-black text-emerald-900 uppercase tracking-tighter bg-emerald-300 px-1.5 py-0.5 rounded shadow-xs">
                    MULA
                  </span>
                )}
                {hasLadderStart && (
                  <span className="text-[9px] sm:text-[11px] font-black text-amber-950 bg-amber-300 border border-amber-400 px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                    🪜 KAKI TANGGA
                  </span>
                )}
                {hasSnakeStart && (
                  <span className="text-[9px] sm:text-[11px] font-black text-white bg-rose-600 border border-rose-700 px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5 animate-pulse">
                    🐍 KEPALA ULAR
                  </span>
                )}
              </div>

              {/* Tokens clustered inside square */}
              <div className="relative flex flex-wrap items-center justify-center gap-1 z-20 my-auto">
                {squareTeams.map((t) => {
                  const isActive = teams[activeTeamIndex]?.id === t.id;
                  // If the active team is in transit along snake/ladder, hide from static square!
                  if (
                    isActive &&
                    activeEncounter &&
                    activeEncounter.progress !== undefined &&
                    activeEncounter.progress > 0 &&
                    activeEncounter.progress < 1
                  ) {
                    return null;
                  }

                  return (
                    <div
                      key={t.id}
                      title={`${t.name} (Petak ${t.currentSquare})`}
                      style={{
                        backgroundColor: t.color,
                        boxShadow: isActive
                          ? `0 0 16px 5px ${t.color}, 0 0 4px #000000`
                          : '0 2px 6px rgba(0,0,0,0.3)',
                      }}
                      className={`relative flex items-center justify-center rounded-full text-white cursor-pointer transition-transform ${
                        squareTeams.length > 4
                          ? 'w-5 h-5 text-xs'
                          : squareTeams.length > 2
                          ? 'w-6 h-6 sm:w-7 sm:h-7 text-sm'
                          : 'w-7 h-7 sm:w-9 sm:h-9 text-base sm:text-lg'
                      } ${isActive ? 'scale-125 ring-4 ring-amber-400 z-30 animate-bounce' : 'hover:scale-110'}`}
                    >
                      <span className="select-none leading-none drop-shadow-md">
                        {t.icon}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Square Footer: Sub-labels indicating destination/source */}
              <div className="z-10 pointer-events-none mt-auto">
                {hasLadderStart && (
                  <div className="text-[8px] sm:text-[10px] font-black text-amber-950 bg-amber-200/95 px-1 py-0.5 rounded text-center border border-amber-400 shadow-xs">
                    Panjat ke #{hasLadderStart.end}
                  </div>
                )}
                {hasSnakeStart && (
                  <div className="text-[8px] sm:text-[10px] font-black text-rose-950 bg-rose-200/95 px-1 py-0.5 rounded text-center border border-rose-400 shadow-xs">
                    Gelongsor ke #{hasSnakeStart.end}
                  </div>
                )}
                {hasLadderEnd && (
                  <div className="text-[8px] sm:text-[10px] font-bold text-amber-800 bg-amber-50/90 px-1 py-0.5 rounded text-center border border-amber-200">
                    ▲ Puncak (Selamat, dr #{hasLadderEnd.start})
                  </div>
                )}
                {hasSnakeEnd && (
                  <div className="text-[8px] sm:text-[10px] font-bold text-emerald-800 bg-emerald-50/90 px-1 py-0.5 rounded text-center border border-emerald-200">
                    ▼ Ekor (Selamat, dr #{hasSnakeEnd.start})
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* SVG Overlay for Snakes and Ladders Curves */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-15"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="ladderRail" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#f59e0b" />
              <stop offset="100%" stop-color="#b45309" />
            </linearGradient>
            <linearGradient id="ladderRailActive" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#fef08a" />
              <stop offset="50%" stop-color="#f59e0b" />
              <stop offset="100%" stop-color="#b45309" />
            </linearGradient>
            <linearGradient id="snakeBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ef4444" />
              <stop offset="40%" stop-color="#f97316" />
              <stop offset="70%" stop-color="#10b981" />
              <stop offset="100%" stop-color="#047857" />
            </linearGradient>
            <filter id="glowDrop" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.4" />
            </filter>
            <filter id="activeHalo" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#f59e0b" floodOpacity="0.8" />
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
            const rungs = Math.max(3, Math.floor(len / 42));

            // Perpendicular offset for double rail
            const offsetX = (-dy / len) * 16;
            const offsetY = (dx / len) * 16;

            const isHighlighted =
              activeEncounter &&
              activeEncounter.type === 'ladder' &&
              activeEncounter.from === ladder.start;

            return (
              <g
                key={`ladder_${ladder.start}_${ladder.end}`}
                filter={isHighlighted ? 'url(#activeHalo)' : 'url(#glowDrop)'}
                className={isHighlighted ? 'animate-pulse' : 'opacity-95'}
              >
                {/* Left rail */}
                <line
                  x1={x1 - offsetX}
                  y1={y1 - offsetY}
                  x2={x2 - offsetX}
                  y2={y2 - offsetY}
                  stroke={isHighlighted ? '#fde047' : 'url(#ladderRail)'}
                  strokeWidth={isHighlighted ? 12 : 8}
                  strokeLinecap="round"
                />
                {/* Right rail */}
                <line
                  x1={x1 + offsetX}
                  y1={y1 + offsetY}
                  x2={x2 + offsetX}
                  y2={y2 + offsetY}
                  stroke={isHighlighted ? '#fde047' : 'url(#ladderRail)'}
                  strokeWidth={isHighlighted ? 12 : 8}
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
                      stroke={isHighlighted ? '#fef08a' : '#d97706'}
                      strokeWidth={isHighlighted ? 8 : 6}
                      strokeLinecap="round"
                    />
                  );
                })}

                {/* Bottom Base Anchor Caps */}
                <circle cx={x1 - offsetX} cy={y1 - offsetY} r={isHighlighted ? 9 : 7} fill="#b45309" stroke="#ffffff" strokeWidth="2" />
                <circle cx={x1 + offsetX} cy={y1 + offsetY} r={isHighlighted ? 9 : 7} fill="#b45309" stroke="#ffffff" strokeWidth="2" />

                {/* Top Peak Anchor Stars */}
                <circle cx={x2 - offsetX} cy={y2 - offsetY} r={isHighlighted ? 9 : 7} fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                <circle cx={x2 + offsetX} cy={y2 + offsetY} r={isHighlighted ? 9 : 7} fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
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

            // S-curve control points adjusted for smooth natural curvature
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
                filter={isHighlighted ? 'url(#activeHalo)' : 'url(#glowDrop)'}
                className={isHighlighted ? 'animate-pulse' : 'opacity-95'}
              >
                {/* Outer shadow/outline */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth={isHighlighted ? 24 : 18}
                  strokeLinecap="round"
                />
                {/* Snake body */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isHighlighted ? '#ef4444' : 'url(#snakeBodyGrad)'}
                  strokeWidth={isHighlighted ? 20 : 14}
                  strokeLinecap="round"
                />

                {/* Snake Tail Tip with Rattle Rings */}
                <circle cx={xTail} cy={yTail} r={8} fill="#047857" stroke="#ffffff" strokeWidth="2" />
                <circle cx={xTail} cy={yTail} r={4} fill="#f59e0b" />

                {/* Snake Head: Large, Distinct Cartoon Serpent Head firmly in the Start Tile */}
                <circle
                  cx={xHead}
                  cy={yHead}
                  r={isHighlighted ? 26 : 22}
                  fill="#ef4444"
                  stroke="#ffffff"
                  strokeWidth="3.5"
                />

                {/* Cute Big Cartoon Eyes */}
                <ellipse cx={xHead - 7} cy={yHead - 6} rx={5.5} ry={7} fill="#ffffff" />
                <circle cx={xHead - 7} cy={yHead - 6} r={3.5} fill="#0f172a" />
                <circle cx={xHead - 9} cy={yHead - 8} r={1.5} fill="#ffffff" />

                <ellipse cx={xHead + 7} cy={yHead - 6} rx={5.5} ry={7} fill="#ffffff" />
                <circle cx={xHead + 7} cy={yHead - 6} r={3.5} fill="#0f172a" />
                <circle cx={xHead + 5} cy={yHead - 8} r={1.5} fill="#ffffff" />

                {/* Smiling Mouth Line */}
                <path
                  d={`M ${xHead - 9} ${yHead + 6} Q ${xHead} ${yHead + 12} ${xHead + 9} ${yHead + 6}`}
                  fill="none"
                  stroke="#7f1d1d"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Red Forked Tongue flicking out */}
                <path
                  d={`M ${xHead} ${yHead + 11} L ${xHead} ${yHead + 22} L ${xHead - 5} ${yHead + 28} M ${xHead} ${yHead + 22} L ${xHead + 5} ${yHead + 28}`}
                  stroke="#dc2626"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

          {/* Active Gliding Token physically soaring along Ladder or sliding down Snake */}
          {activeGlidingToken && (
            <g className="z-40" filter="url(#activeHalo)">
              {/* Outer celebratory glow halo */}
              <circle
                cx={activeGlidingToken.x}
                cy={activeGlidingToken.y}
                r={36}
                fill={activeGlidingToken.team.color}
                opacity={0.35}
              />
              {/* Main token body */}
              <circle
                cx={activeGlidingToken.x}
                cy={activeGlidingToken.y}
                r={26}
                fill={activeGlidingToken.team.color}
                stroke="#ffffff"
                strokeWidth="4"
              />
              {/* Token Emoji Icon */}
              <text
                x={activeGlidingToken.x}
                y={activeGlidingToken.y + 8}
                textAnchor="middle"
                fontSize="24"
                className="select-none pointer-events-none"
              >
                {activeGlidingToken.team.icon}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  </div>
);
};
