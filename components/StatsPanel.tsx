
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

  return (
    <div className="w-full flex flex-col gap-4">
      {/* --- Advanced Monk Job Gauge --- */}
      <div className={`relative p-5 rounded-3xl border-2 transition-all duration-500 overflow-hidden ${
        isBurst 
          ? 'bg-gradient-to-br from-red-950 via-slate-900 to-red-950 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]' 
          : 'bg-gradient-to-b from-slate-800 to-slate-950 border-yellow-900/40 shadow-2xl'
      }`}>
        {/* Burst Background Glow */}
        {isBurst && <div className="absolute inset-0 bg-red-500/5 animate-pulse" />}
        
        <div className="relative flex flex-col gap-5">
          {/* Nadi (Orbs) Section */}
          <div className="flex justify-between items-end">
            <div className="flex gap-4 items-center">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-700 ${
                  state.nadi.includes(NadiType.Lunar) 
                    ? 'bg-indigo-600 border-indigo-300 shadow-[0_0_25px_#6366f1] scale-110 rotate-[360deg]' 
                    : 'border-slate-700 bg-slate-900 opacity-30 scale-90'
                }`}>
                  <span className="text-2xl drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">🌙</span>
                </div>
                <span className="text-[7px] mt-1 font-black text-indigo-400 opacity-60">LUNAR</span>
              </div>

              <div className="w-0.5 h-8 bg-gradient-to-b from-transparent via-slate-700 to-transparent mx-1" />

              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-700 ${
                  state.nadi.includes(NadiType.Solar) 
                    ? 'bg-orange-600 border-orange-300 shadow-[0_0_25px_#f97316] scale-110' 
                    : 'border-slate-700 bg-slate-900 opacity-30 scale-90'
                }`}>
                  <span className="text-2xl drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">☀️</span>
                </div>
                <span className="text-[7px] mt-1 font-black text-orange-400 opacity-60">SOLAR</span>
              </div>
            </div>

            {/* Beast Chakra HUD - Enhanced with PB mode */}
            <div className="flex flex-col items-end gap-1.5">
               <div className={`flex gap-2 p-2 bg-black/60 rounded-2xl border-2 transition-all duration-300 ${isPB ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'border-white/10'}`}>
                {[0, 1, 2].map(i => {
                  const chakra = state.beastChakra[i];
                  const colors = {
                    [BeastChakraType.Opo]: 'bg-yellow-500/20 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.6)]',
                    [BeastChakraType.Raptor]: 'bg-orange-500/20 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.6)]',
                    [BeastChakraType.Coeurl]: 'bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.6)]',
                  };
                  return (
                    <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 border border-white/5 ${
                      chakra ? `${colors[chakra]} scale-110 opacity-100` : 
                      isPB ? 'bg-indigo-900/20 border-indigo-500/30 animate-pulse' : 'bg-slate-800 opacity-10'
                    }`}>
                      {chakra === BeastChakraType.Opo ? '🐒' : 
                       chakra === BeastChakraType.Raptor ? '🐲' : 
                       chakra === BeastChakraType.Coeurl ? '🐅' : 
                       isPB ? <span className="text-xs text-indigo-400 font-black">?</span> : ''}
                    </div>
                  );
                })}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-[0.2em] mr-2 ${isPB ? 'text-indigo-400 animate-pulse' : 'text-slate-500'}`}>
                {isPB ? 'Perfect Balance Active' : 'Beast Chakra'}
              </span>
            </div>
          </div>

          {/* Meditation Tracker */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="relative">
                  <div className={`w-5 h-5 rounded-sm rotate-45 border-2 transition-all duration-300 ${
                    state.chakraCount >= i 
                      ? 'bg-yellow-400 border-white shadow-[0_0_15px_rgba(250,204,21,1)] scale-110' 
                      : 'bg-slate-900 border-slate-700'
                  }`} />
                  {state.chakraCount >= i && <div className="absolute inset-0 bg-white/40 rotate-45 animate-ping opacity-20" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Buff Trackers */}
      <div className="flex gap-2">
        <div className={`flex-1 p-2.5 rounded-xl border flex items-center justify-between transition-all ${state.buffs.disciplinedFist > 0 ? 'bg-orange-500/10 border-orange-500/40 text-orange-200 shadow-[inset_0_0_10px_rgba(249,115,22,0.1)]' : 'bg-slate-900/50 border-slate-800 text-slate-500'}`}>
          <div className="flex items-center gap-2">
            <span className="text-xs">🐍</span>
            <span className="text-[10px] font-bold uppercase">功力</span>
          </div>
          <span className="text-xs font-black font-mono">{state.buffs.disciplinedFist}s</span>
        </div>
        <div className={`flex-1 p-2.5 rounded-xl border flex items-center justify-between transition-all ${state.buffs.demolishDoT > 0 ? 'bg-red-500/10 border-red-500/40 text-red-200 shadow-[inset_0_0_10px_rgba(239,68,68,0.1)]' : 'bg-slate-900/50 border-slate-800 text-slate-500'}`}>
          <div className="flex items-center gap-2">
            <span className="text-xs">💥</span>
            <span className="text-[10px] font-bold uppercase">破砕</span>
          </div>
          <span className="text-xs font-black font-mono">{state.buffs.demolishDoT}s</span>
        </div>
      </div>

      {/* AI Master's Voice */}
      <div className={`relative p-4 rounded-2xl border transition-all duration-500 overflow-hidden ${
        isThinking ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-slate-900/90 border-slate-700/50 shadow-inner shadow-black'
      }`}>
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xl">
            {isThinking ? '🧘' : isBurst ? '🔥' : isPB ? '🥋' : '👊'}
          </div>
          <div className="flex-1">
            <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Master's Voice</span>
            {isThinking ? (
              <div className="flex gap-1 h-4 items-center">
                {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: `${i*0.2}s`}} />)}
              </div>
            ) : (
              <p className="text-[11px] font-medium leading-relaxed text-slate-200 italic">「{feedback}」</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
