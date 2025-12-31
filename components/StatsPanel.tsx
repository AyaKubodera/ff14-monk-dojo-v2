
import React from 'react';
import { Form, RotationState, BeastChakraType, NadiType } from '../types';

interface StatsPanelProps {
  state: RotationState;
  feedback: string;
  isThinking: boolean;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ state, feedback, isThinking }) => {
  const isBurst = state.buffs.riddleOfFire > 0;
  const isPB = state.buffs.perfectBalanceStacks > 0;
  const isBlitzReady = state.beastChakra.length === 3;

  return (
    <div className="w-full flex flex-col gap-2">
      {/* --- Compact Job Gauge --- */}
      <div className={`relative p-3 rounded-2xl border transition-all duration-500 overflow-hidden ${
        isBlitzReady 
          ? 'bg-gradient-to-br from-indigo-900/40 via-slate-900/60 to-purple-900/40 border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]' 
          : isBurst 
          ? 'bg-gradient-to-br from-red-950/40 via-slate-900/60 to-red-950/40 border-red-500/40' 
          : 'bg-slate-900/80 border-white/5'
      }`}>
        <div className="relative flex flex-col gap-3">
          <div className="flex justify-between items-center">
            {/* Nadi Orbs - Scaled Down */}
            <div className="flex gap-2 items-center">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-700 ${
                  state.nadi.includes(NadiType.Lunar) 
                    ? 'bg-indigo-600 border-indigo-300 shadow-[0_0_15px_#6366f1] scale-105' 
                    : 'border-slate-700 bg-slate-950 opacity-20 scale-90'
                }`}>
                  <span className="text-lg">🌙</span>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-700 ${
                  state.nadi.includes(NadiType.Solar) 
                    ? 'bg-orange-600 border-orange-300 shadow-[0_0_15px_#f97316] scale-105' 
                    : 'border-slate-700 bg-slate-950 opacity-20 scale-90'
                }`}>
                  <span className="text-lg">☀️</span>
                </div>
              </div>
            </div>

            {/* Beast Chakra HUD - Compact */}
            <div className="flex items-center gap-1.5">
               <div className={`flex gap-1.5 p-1.5 bg-black/40 rounded-xl border transition-all duration-300 ${isBlitzReady ? 'border-white ring-2 ring-white/20' : isPB ? 'border-indigo-500/50' : 'border-white/5'}`}>
                {[0, 1, 2].map(i => {
                  const chakra = state.beastChakra[i];
                  const colors = {
                    [BeastChakraType.Opo]: 'text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]',
                    [BeastChakraType.Raptor]: 'text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]',
                    [BeastChakraType.Coeurl]: 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]',
                  };
                  return (
                    <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xl transition-all duration-300 border border-white/5 ${
                      chakra ? `bg-white/5 opacity-100 scale-105` : 
                      isPB ? 'bg-indigo-900/10 border-indigo-500/20 animate-pulse' : 'bg-slate-950 opacity-5'
                    }`}>
                      {chakra === BeastChakraType.Opo ? <span className={colors[BeastChakraType.Opo]}>🐒</span> : 
                       chakra === BeastChakraType.Raptor ? <span className={colors[BeastChakraType.Raptor]}>🐲</span> : 
                       chakra === BeastChakraType.Coeurl ? <span className={colors[BeastChakraType.Coeurl]}>🐅</span> : 
                       isPB ? <span className="text-[6px] text-indigo-400 font-black">●</span> : ''}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Meditation Tracker - Small Diamonds */}
            <div className="flex items-center gap-1.5 px-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`w-3 h-3 rotate-45 border transition-all duration-300 ${
                  state.chakraCount >= i 
                    ? 'bg-yellow-400 border-white shadow-[0_0_8px_#fbbf24] scale-110' 
                    : 'bg-slate-950 border-slate-800'
                }`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mini Buff Trackers */}
      <div className="flex gap-1.5">
        <div className={`flex-1 px-3 py-1.5 rounded-lg border flex items-center justify-between transition-all ${state.buffs.disciplinedFist > 0 ? 'bg-orange-500/10 border-orange-500/30 text-orange-300' : 'bg-slate-900/30 border-slate-800/50 text-slate-600'}`}>
          <span className="text-[9px] font-black uppercase tracking-tighter">功力 (Buff)</span>
          <span className="text-[10px] font-black font-mono">{state.buffs.disciplinedFist}s</span>
        </div>
        <div className={`flex-1 px-3 py-1.5 rounded-lg border flex items-center justify-between transition-all ${state.buffs.demolishDoT > 0 ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-slate-900/30 border-slate-800/50 text-slate-600'}`}>
          <span className="text-[9px] font-black uppercase tracking-tighter">破砕 (DoT)</span>
          <span className="text-[10px] font-black font-mono">{state.buffs.demolishDoT}s</span>
        </div>
      </div>

      {/* Compact AI Dojo Voice */}
      <div className={`relative p-3 rounded-xl border transition-all duration-500 ${
        isThinking ? 'bg-indigo-950/20 border-indigo-500/20' : 'bg-slate-900/60 border-white/5'
      }`}>
        <div className="flex gap-3 items-center">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm">
            {isThinking ? '🧘' : isBlitzReady ? '🔥' : '👊'}
          </div>
          <div className="flex-1">
            {isThinking ? (
              <div className="flex gap-1 h-3 items-center">
                {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: `${i*0.2}s`}} />)}
              </div>
            ) : (
              <p className="text-[10px] font-medium leading-tight text-slate-300 italic line-clamp-2">「{feedback}」</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
