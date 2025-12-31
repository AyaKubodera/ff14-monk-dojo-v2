
import React from 'react';
import { Form, RotationState, BeastChakraType, NadiType } from '../types';

interface StatsPanelProps {
  state: RotationState;
  feedback: string;
  isThinking: boolean;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ state, feedback, isThinking }) => {
  return (
    <div className="w-full flex flex-col gap-4">
      {/* Nadi and Beast Chakra Display */}
      <div className="flex justify-between items-end gap-2 bg-slate-900/50 p-3 rounded-xl border border-slate-700">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Nadi</span>
          <div className="flex gap-2">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${state.nadi.includes(NadiType.Lunar) ? 'bg-indigo-500 border-indigo-300 shadow-[0_0_10px_#6366f1]' : 'border-slate-800 bg-slate-950'}`}>
              🌙
            </div>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${state.nadi.includes(NadiType.Solar) ? 'bg-orange-500 border-orange-300 shadow-[0_0_10px_#f97316]' : 'border-slate-800 bg-slate-950'}`}>
              ☀️
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Beast Chakra</span>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => {
              const chakra = state.beastChakra[i];
              return (
                <div key={i} className={`w-8 h-8 rounded-md border flex items-center justify-center text-lg ${
                  chakra === BeastChakraType.Opo ? 'bg-yellow-500 border-yellow-300' :
                  chakra === BeastChakraType.Raptor ? 'bg-orange-500 border-orange-300' :
                  chakra === BeastChakraType.Coeurl ? 'bg-red-500 border-red-300' : 'bg-slate-950 border-slate-800'
                }`}>
                  {chakra === BeastChakraType.Opo ? '🐒' : chakra === BeastChakraType.Raptor ? '🐲' : chakra === BeastChakraType.Coeurl ? '🐅' : ''}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Buff Trackers */}
      <div className="grid grid-cols-3 gap-2">
        <div className={`p-2 rounded-lg border transition-all ${state.buffs.disciplinedFist > 0 ? 'bg-orange-900/40 border-orange-500/50' : 'bg-gray-800/50 border-gray-700'}`}>
          <div className="text-[10px] font-bold text-orange-400 mb-1 flex justify-between">
            <span>🐍 功力</span>
            <span>{state.buffs.disciplinedFist}s</span>
          </div>
          <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500" style={{ width: `${(state.buffs.disciplinedFist / 15) * 100}%` }} />
          </div>
        </div>
        <div className={`p-2 rounded-lg border transition-all ${state.buffs.demolishDoT > 0 ? 'bg-red-900/40 border-red-500/50' : 'bg-gray-800/50 border-gray-700'}`}>
          <div className="text-[10px] font-bold text-red-400 mb-1 flex justify-between">
            <span>💥 破砕</span>
            <span>{state.buffs.demolishDoT}s</span>
          </div>
          <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-red-500" style={{ width: `${(state.buffs.demolishDoT / 18) * 100}%` }} />
          </div>
        </div>
        <div className={`p-2 rounded-lg border transition-all ${state.buffs.riddleOfFire > 0 ? 'bg-red-700 border-red-400 animate-pulse' : 'bg-gray-800/50 border-gray-700'}`}>
          <div className="text-[10px] font-bold text-white mb-1 flex justify-between">
            <span>🔥 紅蓮</span>
            <span>{state.buffs.riddleOfFire}s</span>
          </div>
          <div className="w-full h-1 bg-gray-900/50 rounded-full overflow-hidden">
            <div className="h-full bg-red-400" style={{ width: `${(state.buffs.riddleOfFire / 20) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-300">{state.currentForm}</span>
            {state.buffs.perfectBalanceStacks > 0 && (
              <span className="bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                踏鳴中 ({state.buffs.perfectBalanceStacks})
              </span>
            )}
          </div>
          {state.buffs.leadenFist && (
            <span className="bg-yellow-500 text-black text-[10px] px-2 py-0.5 rounded-full font-black">
              連撃UP
            </span>
          )}
        </div>

        <div className="relative min-h-[50px] flex items-center justify-center p-2 rounded-lg bg-indigo-950/30 border border-indigo-500/20">
          {isThinking ? (
            <div className="flex gap-1"><div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" /></div>
          ) : (
            <p className="text-xs italic text-indigo-100 text-center leading-tight">「{feedback}」</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
