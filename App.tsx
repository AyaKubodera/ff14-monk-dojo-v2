
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Form, RotationState, Skill, BeastChakraType, NadiType } from './types';
import { MONK_SKILLS, INITIAL_ROTATION_STATE, OPENER_SEQUENCE } from './constants';
import SkillButton from './components/SkillButton';
import StatsPanel from './components/StatsPanel';
import { getMonkFeedback } from './services/geminiService';
import { sounds } from './services/soundService';

const App: React.FC = () => {
  const [state, setState] = useState<RotationState>(INITIAL_ROTATION_STATE);
  const [canWinds, setCanWinds] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("黄金のモンク道場へ。型を研ぎ澄ませ。");
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isGCD, setIsGCD] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const unlockAudio = () => sounds.init();

  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => ({
        ...prev,
        buffs: {
          ...prev.buffs,
          disciplinedFist: Math.max(0, prev.buffs.disciplinedFist - 1),
          demolishDoT: Math.max(0, prev.buffs.demolishDoT - 1),
          riddleOfFire: Math.max(0, prev.buffs.riddleOfFire - 1),
        }
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentBlitz = useMemo(() => {
    if (state.beastChakra.length < 3) return null;
    const types = new Set(state.beastChakra);
    
    if (state.nadi.includes(NadiType.Lunar) && state.nadi.includes(NadiType.Solar)) {
      return { id: 'phantom_rush', name: '夢幻闘舞', icon: '🌀', color: 'bg-gradient-to-br from-indigo-900 via-purple-600 to-indigo-950 border-purple-300 shadow-[0_0_40px_rgba(168,85,247,0.9)]' };
    }
    if (types.size === 3) {
      return { id: 'rising_phoenix', name: '鳳凰の舞', icon: '🔥', color: 'bg-gradient-to-br from-orange-800 via-red-600 to-yellow-900 border-red-300 shadow-[0_0_40px_rgba(239,68,68,0.9)]' };
    }
    if (types.size === 1) {
      return { id: 'elixir_burst', name: '爆裂脚', icon: '🦵', color: 'bg-gradient-to-br from-blue-900 via-cyan-500 to-blue-950 border-cyan-300 shadow-[0_0_40px_rgba(6,182,212,0.9)]' };
    }
    return { id: 'celestial_revolution', name: '天宙脚', icon: '💫', color: 'bg-slate-700 border-slate-500 opacity-60' };
  }, [state.beastChakra, state.nadi]);

  const recommendation = useMemo(() => {
    if (canWinds) return { id: 'winds_of_reply', reason: '追撃：真空波！' };
    if (currentBlitz) return { id: currentBlitz.id, reason: currentBlitz.name === '天宙脚' ? '那岐ミス！' : '必殺技！' };
    
    const { currentForm, buffs, beastChakra, chakraCount, history, phase, nadi } = state;
    if (chakraCount === 5) return { id: 'forbidden_chakra', reason: '闘気全開' };

    if (phase === 'opener') {
      const openerStep = history.length;
      if (openerStep < OPENER_SEQUENCE.length) {
        return { id: OPENER_SEQUENCE[openerStep], reason: `開幕：${openerStep + 1}手目` };
      }
    }

    if (buffs.perfectBalanceStacks > 0) {
      const hasLunar = nadi.includes(NadiType.Lunar);
      if (!hasLunar) {
        return { id: buffs.leadenFist ? 'pouncing_barrage' : 'dragon_kick', reason: '蓄積（月）' };
      } else {
        const types = new Set(beastChakra);
        if (!types.has(BeastChakraType.Opo)) return { id: 'dragon_kick', reason: '太陽（壱）' };
        if (!types.has(BeastChakraType.Raptor)) return { id: 'twin_snakes', reason: '太陽（弐）' };
        return { id: 'demolish', reason: '太陽（参）' };
      }
    }

    if (currentForm === Form.OpoOpo || currentForm === Form.Formless || currentForm === Form.None) {
      return { id: buffs.leadenFist ? 'pouncing_barrage' : 'dragon_kick', reason: buffs.leadenFist ? '猿舞連撃' : '双竜脚' };
    }
    if (currentForm === Form.Raptor) {
      return { id: buffs.disciplinedFist < 6 ? 'twin_snakes' : 'dragon_jaw', reason: '功力維持' };
    }
    if (currentForm === Form.Coeurl) {
      return { id: buffs.demolishDoT < 6 ? 'demolish' : 'tiger_claw', reason: '破砕維持' };
    }

    return { id: null, reason: '' };
  }, [state, currentBlitz, canWinds]);

  const recommendedSkillId = recommendation.id;

  const triggerError = (msg: string) => {
    setIsError(true);
    sounds.playError();
    setTimeout(() => setIsError(false), 200);
    setFeedback(msg);
  };

  const executeSkill = useCallback((skill: Skill | any) => {
    unlockAudio();
    if (!skill.isAbility && isGCD) return;

    if (skill.id === 'forbidden_chakra' && state.chakraCount < 5) {
      triggerError("闘気が足りぬ。"); return;
    }
    
    if (!skill.isAbility && state.buffs.perfectBalanceStacks === 0 && !['elixir_burst', 'rising_phoenix', 'phantom_rush', 'celestial_revolution'].includes(skill.id)) {
      if (!skill.formRequired.includes(state.currentForm)) {
        triggerError(`型が違う！次は「${MONK_SKILLS.find(s => s.id === recommendedSkillId)?.name}」だ。`);
        return;
      }
    }

    if (skill.id === 'winds_of_reply' && !canWinds) {
      triggerError("真空波はまだだ。"); return;
    }

    if (skill.isAbility || currentBlitz) sounds.playSuccess();
    else sounds.playSkill();

    if (!skill.isAbility) {
      setIsGCD(true);
      setTimeout(() => setIsGCD(false), 1950);
    }

    setState(prev => {
      const newBuffs = { ...prev.buffs };
      let newBeastChakra = [...prev.beastChakra];
      let newNadi = [...prev.nadi];
      let nextForm = skill.formGranted;
      let newChakra = prev.chakraCount;
      let newPhase = prev.phase;

      if (prev.history.length >= OPENER_SEQUENCE.length) newPhase = 'standard';
      if (!skill.isAbility && newChakra < 5 && Math.random() > 0.4) newChakra++;

      if (skill.id === 'forbidden_chakra') {
        newChakra = 0;
        return { ...prev, chakraCount: newChakra, history: [...prev.history, skill.name] };
      }

      if (skill.id === 'winds_of_reply') {
        setCanWinds(false);
        return { ...prev, history: [...prev.history, skill.name] };
      }

      if (skill.id === 'riddle_of_fire') {
        newBuffs.riddleOfFire = 20;
        return { ...prev, buffs: newBuffs, history: [...prev.history, skill.name] };
      }
      if (skill.id === 'perfect_balance') {
        newBuffs.perfectBalanceStacks = 3;
        return { ...prev, buffs: newBuffs, history: [...prev.history, skill.name] };
      }
      
      if (['elixir_burst', 'rising_phoenix', 'phantom_rush', 'celestial_revolution'].includes(skill.id)) {
        if (skill.id === 'elixir_burst') !newNadi.includes(NadiType.Lunar) && newNadi.push(NadiType.Lunar);
        if (skill.id === 'rising_phoenix') !newNadi.includes(NadiType.Solar) && newNadi.push(NadiType.Solar);
        if (skill.id === 'phantom_rush') newNadi = [];
        newBeastChakra = [];
        newBuffs.perfectBalanceStacks = 0;
        setCanWinds(true);
        return { ...prev, nadi: newNadi, beastChakra: newBeastChakra, buffs: newBuffs, currentForm: Form.Formless, history: [...prev.history, skill.name], phase: newPhase };
      }

      if (skill.id === 'dragon_kick') newBuffs.leadenFist = true;
      if (skill.id === 'pouncing_barrage') newBuffs.leadenFist = false;
      if (skill.id === 'twin_snakes') newBuffs.disciplinedFist = 15;
      if (skill.id === 'demolish') newBuffs.demolishDoT = 18;

      if (newBuffs.perfectBalanceStacks > 0 && !skill.isAbility) {
        if (skill.beastChakraGranted) newBeastChakra.push(skill.beastChakraGranted);
        newBuffs.perfectBalanceStacks--;
        nextForm = newBuffs.perfectBalanceStacks === 0 ? Form.None : Form.Formless;
      }

      return {
        ...prev,
        currentForm: nextForm,
        buffs: newBuffs,
        beastChakra: newBeastChakra,
        chakraCount: newChakra,
        history: [...prev.history, skill.name],
        phase: newPhase
      };
    });
  }, [isGCD, state, recommendedSkillId, currentBlitz, canWinds]);

  useEffect(() => {
    if (state.history.length > 0 && state.history.length % 15 === 0) {
      const updateFeedback = async () => {
        setIsThinking(true);
        const advice = await getMonkFeedback(state.history, state.currentForm);
        setFeedback(advice);
        setIsThinking(false);
      };
      updateFeedback();
    }
  }, [state.history.length]);

  return (
    <div 
      onClick={unlockAudio}
      className={`fixed inset-0 transition-all duration-300 ${isError ? 'bg-red-900/40' : 'bg-[#020617]'} text-slate-100 p-4 safe-pt flex flex-col items-center select-none overflow-hidden`}
    >
      <header className="w-full max-w-lg flex flex-col items-center mb-0.5">
        <div className="flex items-center gap-2">
           <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${state.phase === 'opener' ? 'bg-blue-600' : 'bg-green-600'}`}>
             {state.phase === 'opener' ? 'OPENER' : 'LOOP'}
           </span>
           <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-yellow-400 via-white to-orange-500 bg-clip-text text-transparent italic">
            MONK DOJO <span className="text-xs ml-1">v8.0</span>
          </h1>
        </div>
      </header>

      <main className="w-full max-w-lg flex flex-col gap-1.5 flex-1 overflow-y-auto pb-[260px] pt-1 px-1">
        {/* Guidance HUD - More Compact */}
        <div className={`relative flex flex-col items-center py-1.5 rounded-2xl border transition-all duration-700 min-h-[80px] justify-center ${
          currentBlitz || canWinds
            ? 'bg-white/5 border-white shadow-[0_0_50px_rgba(255,255,255,0.1)] scale-[1.01] z-40' 
            : 'bg-white/5 border-white/10'
        }`}>
          {canWinds ? (
            <div className="flex flex-col items-center">
               <span className="text-3xl mb-0.5 filter drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">🌪️</span>
               <div className="bg-cyan-900/40 px-2 py-0.5 rounded border border-cyan-400/30">
                  <span className="text-[12px] text-cyan-200 font-black italic">真空波</span>
               </div>
            </div>
          ) : currentBlitz ? (
            <div className="flex flex-col items-center animate-bounce">
               <span className="text-3xl mb-0.5 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{currentBlitz.icon}</span>
               <div className="bg-black/60 px-2 py-0.5 rounded border border-white/20 backdrop-blur-xl">
                  <span className="text-[12px] text-white font-black italic tracking-tighter">{currentBlitz.name}</span>
               </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-0">
              <div className={`text-xl font-black italic tracking-tighter text-center ${recommendedSkillId === 'perfect_balance' ? 'text-indigo-400 animate-pulse' : 'text-white'}`}>
                {MONK_SKILLS.find(s => s.id === recommendedSkillId)?.name || '---'}
              </div>
              <div className="mt-0.5 px-2 py-0.5 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                <span className="text-[8px] text-yellow-500 font-black uppercase tracking-tight">{recommendation.reason}</span>
              </div>
            </div>
          )}
        </div>

        <StatsPanel state={state} feedback={feedback} isThinking={isThinking} />
        
        <div className="flex justify-center mt-0 opacity-0 hover:opacity-10 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); sounds.playClick(220); setState(INITIAL_ROTATION_STATE); setCanWinds(false); setFeedback("一から叩き直す。構えろ。"); }} className="text-[6px] px-2 py-0.5 bg-slate-800/10 text-slate-700 rounded-full border border-slate-800/20 active:bg-slate-700 uppercase tracking-widest font-bold">Reset</button>
        </div>
      </main>

      {/* Primary Interaction Area - Tightened to the extreme */}
      <div className="fixed bottom-0 left-0 right-0 p-1.5 pb-[calc(0.5rem+var(--sab))] bg-slate-950/98 backdrop-blur-3xl border-t border-white/10 z-50">
        <div className="max-w-lg mx-auto flex flex-col gap-1.5">
          {/* Top Row: Blitz & OGCDs */}
          <div className="flex justify-between gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); currentBlitz && executeSkill(currentBlitz); }}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl border-2 flex-1 shadow-lg transition-all ${
                currentBlitz 
                  ? `${currentBlitz.color} scale-[1.03] z-10 border-white ring-4 ring-white/10` 
                  : 'bg-slate-900 border-slate-800 opacity-20 pointer-events-none'
              }`}
            >
              <span className="text-xl">{currentBlitz ? currentBlitz.icon : '✨'}</span>
              <span className="text-[7px] font-black uppercase mt-0.5">必殺技</span>
            </button>

            {['winds_of_reply', 'perfect_balance', 'riddle_of_fire', 'forbidden_chakra'].map(id => {
              const skill = MONK_SKILLS.find(s => s.id === id)!;
              const isAvailable = id === 'forbidden_chakra' ? state.chakraCount === 5 : (id === 'winds_of_reply' ? canWinds : true);
              const isRecommended = recommendedSkillId === id;
              return (
                <button
                  key={id}
                  onClick={(e) => { e.stopPropagation(); executeSkill(skill); }}
                  className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl border-2 ${skill.color} flex-1 shadow-lg active:scale-95 transition-all ${
                    !isAvailable ? 'opacity-20 grayscale pointer-events-none' : ''
                  } ${isRecommended ? 'ring-2 ring-white border-white scale-[1.03] z-10' : 'border-white/10'}`}
                >
                  <span className="text-xl">{skill.icon}</span>
                  <span className="text-[7px] font-black uppercase mt-0.5 leading-none text-center">{skill.name}</span>
                </button>
              );
            })}
          </div>
          
          {/* Main Combo Grid */}
          <div className="grid grid-cols-6 gap-1">
            {MONK_SKILLS.filter(s => !s.isAbility).map(skill => (
              <SkillButton
                key={skill.id}
                skill={skill}
                currentForm={state.currentForm}
                onClick={executeSkill}
                disabled={isGCD}
                isRecommended={skill.id === recommendedSkillId}
              />
            ))}
          </div>
        </div>
        
        {isGCD && (
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 via-white to-cyan-400 animate-[gcd_1.95s_linear_forwards]" />
          </div>
        )}
      </div>

      <style>{`
        @keyframes gcd { from { width: 0%; } to { width: 100%; } }
      `}</style>
    </div>
  );
};

export default App;
